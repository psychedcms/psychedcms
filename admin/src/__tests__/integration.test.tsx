import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import {
  AdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
} from 'react-admin';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { PsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';
import { PsychedSchemaProvider } from '../providers/PsychedSchemaProvider.tsx';
import type { PsychedSchema, OpenApiDocument, ResourceSchema } from '../types/psychedcms.ts';
import { TabbedFormGuesser } from '../components/forms/TabbedFormGuesser.tsx';
import { PsychedMenu } from '../components/layout/PsychedMenu.tsx';
import { usePsychedSchema } from '../hooks/usePsychedSchema.ts';
import { useContentTypes } from '../hooks/useContentTypes.ts';

const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () =>
    Promise.resolve({
      data: { id: 1, title: 'Existing Post', body: '<p>Content</p>', slug: 'existing-post' },
    }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: () => Promise.resolve({ data: { id: 1 } }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: () => Promise.resolve({ data: { id: 1 } }),
  delete: () => Promise.resolve({ data: { id: 1 } }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

const theme = createTheme();

vi.mock('react-admin', async () => {
  const actual = await vi.importActual('react-admin');
  return {
    ...actual,
    useResourceDefinitions: () => ({
      posts: { name: 'posts', hasList: true },
      pages: { name: 'pages', hasList: true },
      users: { name: 'users', hasList: true },
    }),
    useSidebarState: () => [true],
    MenuItemLink: ({ to, primaryText }: { to: string; primaryText: string }) => (
      <a href={to} data-testid={`menu-item-${to.replace(/\//g, '')}`}>
        {primaryText}
      </a>
    ),
  };
});

const mockOpenApiDoc: OpenApiDocument = {
  openapi: '3.1.0',
  components: {
    schemas: {
      'Post.jsonld': {
        type: 'object',
        'x-psychedcms': {
          name: 'Posts',
          singularName: 'Post',
          slug: 'posts',
          singularSlug: 'post',
          icon: 'Article',
          showOnDashboard: true,
          defaultStatus: 'draft',
          searchable: true,
          singleton: false,
          locales: ['en'],
        },
        properties: {
          title: {
            type: 'string',
            'x-psychedcms': {
              type: 'text',
              label: 'Title',
              group: 'content',
              required: true,
            },
          },
          body: {
            type: 'string',
            'x-psychedcms': {
              type: 'html',
              label: 'Body',
              group: 'content',
            },
          },
          metaTitle: {
            type: 'string',
            'x-psychedcms': {
              type: 'text',
              label: 'Meta Title',
              group: 'seo',
            },
          },
          slug: {
            type: 'string',
            'x-psychedcms': {
              type: 'slug',
              label: 'Slug',
              group: 'content',
              uses: 'title',
            },
          },
        },
      },
      'Page.jsonld': {
        type: 'object',
        'x-psychedcms': {
          name: 'Pages',
          singularName: 'Page',
          slug: 'pages',
          singularSlug: 'page',
          icon: 'Description',
          showOnDashboard: true,
          defaultStatus: 'draft',
          searchable: true,
          singleton: false,
          locales: ['en'],
        },
        properties: {},
      },
      'User.jsonld': {
        type: 'object',
        properties: {
          email: { type: 'string' },
        },
      },
    },
  },
};

const mockSchema: PsychedSchema = {
  resources: new Map<string, ResourceSchema>([
    [
      'posts',
      {
        name: 'posts',
        contentType: {
          name: 'Posts',
          singularName: 'Post',
          slug: 'posts',
          singularSlug: 'post',
          icon: 'Article',
          showOnDashboard: true,
          defaultStatus: 'draft',
          searchable: true,
          singleton: false,
          locales: ['en'],
        },
        fields: new Map([
          ['title', { type: 'text', label: 'Title', group: 'content', required: true }],
          ['body', { type: 'html', label: 'Body', group: 'content' }],
          ['metaTitle', { type: 'text', label: 'Meta Title', group: 'seo' }],
          ['slug', { type: 'slug', label: 'Slug', group: 'content', uses: 'title' }],
        ]),
      },
    ],
    [
      'pages',
      {
        name: 'pages',
        contentType: {
          name: 'Pages',
          singularName: 'Page',
          slug: 'pages',
          singularSlug: 'page',
          icon: 'Description',
          showOnDashboard: true,
          defaultStatus: 'draft',
          searchable: true,
          singleton: false,
          locales: ['en'],
        },
        fields: new Map(),
      },
    ],
    [
      'users',
      {
        name: 'users',
        contentType: null,
        fields: new Map(),
      },
    ],
  ]),
};

function createIntegrationWrapper(schema: PsychedSchema, resourceName: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <AdminContext dataProvider={dataProvider}>
          <PsychedSchemaContext.Provider value={{ schema, loading: false, error: null }}>
            <ResourceDefinitionContextProvider
              definitions={{
                [resourceName]: {
                  name: resourceName,
                  hasCreate: true,
                  hasEdit: true,
                  hasShow: false,
                  hasList: true,
                },
              }}
            >
              <ResourceContextProvider value={resourceName}>{children}</ResourceContextProvider>
            </ResourceDefinitionContextProvider>
          </PsychedSchemaContext.Provider>
        </AdminContext>
      </ThemeProvider>
    );
  };
}

describe('Integration: Schema Provider -> Hooks -> Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hooks receive parsed schema data from provider context', () => {
    function TestComponent() {
      const postSchema = usePsychedSchema('posts');
      const contentTypes = useContentTypes();

      return (
        <div>
          <span data-testid="post-name">{postSchema?.contentType?.name ?? 'none'}</span>
          <span data-testid="content-count">{contentTypes.length}</span>
          <span data-testid="field-count">{postSchema?.fields.size ?? 0}</span>
        </div>
      );
    }

    render(
      <PsychedSchemaContext.Provider value={{ schema: mockSchema, loading: false, error: null }}>
        <TestComponent />
      </PsychedSchemaContext.Provider>
    );

    expect(screen.getByTestId('post-name').textContent).toBe('Posts');
    expect(screen.getByTestId('content-count').textContent).toBe('2');
    expect(screen.getByTestId('field-count').textContent).toBe('4');
  });

  it('PsychedSchemaProvider fetches and parses OpenAPI document', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOpenApiDoc),
    } as Response);

    function TestComponent() {
      const postSchema = usePsychedSchema('posts');
      return <span data-testid="result">{postSchema?.contentType?.name ?? 'loading'}</span>;
    }

    render(
      <PsychedSchemaProvider entrypoint="http://localhost/api">
        <TestComponent />
      </PsychedSchemaProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('result').textContent).toBe('Posts');
    });

    expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/docs.json', {
      headers: { Accept: 'application/json' },
    });
  });
});

describe('Integration: Create Form with Field Groups', () => {
  it('TabbedFormGuesser renders correct field groups for resources with multiple groups', async () => {
    const Wrapper = createIntegrationWrapper(mockSchema, 'posts');

    const { container } = render(
      <Wrapper>
        <TabbedFormGuesser />
      </Wrapper>
    );

    await waitFor(() => {
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(2);
    });

    expect(screen.getByRole('tab', { name: /content/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /seo/i })).toBeDefined();
  });

  it('TabbedFormGuesser renders fields in correct tabs', async () => {
    const Wrapper = createIntegrationWrapper(mockSchema, 'posts');

    render(
      <Wrapper>
        <TabbedFormGuesser />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /content/i })).toBeDefined();
    });

    const contentTab = screen.getByRole('tab', { name: /content/i });
    expect(contentTab.getAttribute('aria-selected')).toBe('true');
  });
});

describe('Integration: Menu Categorizes Resources Correctly', () => {
  it('separates ContentType resources into Content section and others into Admin', () => {
    render(
      <ThemeProvider theme={theme}>
        <PsychedSchemaContext.Provider value={{ schema: mockSchema, loading: false, error: null }}>
          <PsychedMenu />
        </PsychedSchemaContext.Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();

    expect(screen.getByTestId('menu-item-posts')).toBeDefined();
    expect(screen.getByTestId('menu-item-pages')).toBeDefined();
    expect(screen.getByTestId('menu-item-users')).toBeDefined();
  });

  it('displays correct labels for Content resources from contentType metadata', () => {
    render(
      <ThemeProvider theme={theme}>
        <PsychedSchemaContext.Provider value={{ schema: mockSchema, loading: false, error: null }}>
          <PsychedMenu />
        </PsychedSchemaContext.Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Posts')).toBeDefined();
    expect(screen.getByText('Pages')).toBeDefined();
    expect(screen.getByText('Users')).toBeDefined();
  });
});

describe('Integration: Loading State Handling', () => {
  it('hooks return appropriate values when schema is loading', () => {
    function TestComponent() {
      const postSchema = usePsychedSchema('posts');
      const contentTypes = useContentTypes();

      return (
        <div>
          <span data-testid="schema-status">{postSchema === null ? 'null' : 'loaded'}</span>
          <span data-testid="content-types-count">{contentTypes.length}</span>
        </div>
      );
    }

    render(
      <PsychedSchemaContext.Provider value={{ schema: null, loading: true, error: null }}>
        <TestComponent />
      </PsychedSchemaContext.Provider>
    );

    expect(screen.getByTestId('schema-status').textContent).toBe('null');
    expect(screen.getByTestId('content-types-count').textContent).toBe('0');
  });

  it('hooks handle error state gracefully', () => {
    function TestComponent() {
      const postSchema = usePsychedSchema('posts');
      const contentTypes = useContentTypes();

      return (
        <div>
          <span data-testid="schema-result">{postSchema === null ? 'null' : 'loaded'}</span>
          <span data-testid="content-types-result">{contentTypes.length}</span>
        </div>
      );
    }

    render(
      <PsychedSchemaContext.Provider
        value={{ schema: null, loading: false, error: new Error('Network error') }}
      >
        <TestComponent />
      </PsychedSchemaContext.Provider>
    );

    expect(screen.getByTestId('schema-result').textContent).toBe('null');
    expect(screen.getByTestId('content-types-result').textContent).toBe('0');
  });
});

describe('Integration: Full Flow with Multiple Resources', () => {
  it('correctly distinguishes resources with and without ContentType metadata', () => {
    function TestComponent() {
      const postSchema = usePsychedSchema('posts');
      const userSchema = usePsychedSchema('users');
      const contentTypes = useContentTypes();

      return (
        <div>
          <span data-testid="post-has-contenttype">
            {postSchema?.contentType ? 'yes' : 'no'}
          </span>
          <span data-testid="user-has-contenttype">
            {userSchema?.contentType ? 'yes' : 'no'}
          </span>
          <span data-testid="content-type-names">
            {contentTypes.map((ct) => ct.contentType?.name).join(',')}
          </span>
        </div>
      );
    }

    render(
      <PsychedSchemaContext.Provider value={{ schema: mockSchema, loading: false, error: null }}>
        <TestComponent />
      </PsychedSchemaContext.Provider>
    );

    expect(screen.getByTestId('post-has-contenttype').textContent).toBe('yes');
    expect(screen.getByTestId('user-has-contenttype').textContent).toBe('no');
    expect(screen.getByTestId('content-type-names').textContent).toBe('Posts,Pages');
  });
});
