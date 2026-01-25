import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { AdminContext, SimpleForm, ResourceContextProvider, ResourceDefinitionContextProvider } from 'react-admin';

import { PsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';
import type { PsychedSchema } from '../types/psychedcms.ts';
import { PsychedInputGuesser } from '../components/inputs/PsychedInputGuesser.tsx';
import { TabbedFormGuesser } from '../components/forms/TabbedFormGuesser.tsx';

const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 1 } }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: () => Promise.resolve({ data: { id: 1 } }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: () => Promise.resolve({ data: { id: 1 } }),
  delete: () => Promise.resolve({ data: { id: 1 } }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

const mockSchemaWithGroups: PsychedSchema = {
  resources: new Map([
    [
      'posts',
      {
        name: 'posts',
        contentType: {
          name: 'Posts',
          singularName: 'Post',
          slug: 'posts',
          singularSlug: 'post',
          icon: 'article',
          showOnDashboard: true,
          defaultStatus: 'draft',
          searchable: true,
          singleton: false,
          locales: ['en'],
        },
        fields: new Map([
          [
            'title',
            {
              type: 'text',
              label: 'Title',
              group: 'content',
              required: true,
            },
          ],
          [
            'body',
            {
              type: 'html',
              label: 'Body',
              group: 'content',
            },
          ],
          [
            'metaTitle',
            {
              type: 'text',
              label: 'Meta Title',
              group: 'seo',
            },
          ],
          [
            'metaDescription',
            {
              type: 'textarea',
              label: 'Meta Description',
              group: 'seo',
            },
          ],
          [
            'slug',
            {
              type: 'slug',
              label: 'Slug',
              group: 'content',
              uses: 'title',
            },
          ],
        ]),
      },
    ],
  ]),
};

const mockSchemaWithSingleGroup: PsychedSchema = {
  resources: new Map([
    [
      'users',
      {
        name: 'users',
        contentType: null,
        fields: new Map([
          [
            'email',
            {
              type: 'email',
              label: 'Email',
              group: 'general',
              required: true,
            },
          ],
          [
            'name',
            {
              type: 'text',
              label: 'Name',
              group: 'general',
            },
          ],
        ]),
      },
    ],
  ]),
};

function createFormWrapper(
  schema: PsychedSchema,
  resourceName: string,
  defaultValues: Record<string, unknown> = {}
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
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
            <ResourceContextProvider value={resourceName}>
              <SimpleForm defaultValues={defaultValues} toolbar={false}>
                {children}
              </SimpleForm>
            </ResourceContextProvider>
          </ResourceDefinitionContextProvider>
        </PsychedSchemaContext.Provider>
      </AdminContext>
    );
  };
}

describe('PsychedInputGuesser', () => {
  it('maps html type to HtmlInput', async () => {
    const Wrapper = createFormWrapper(mockSchemaWithGroups, 'posts', { body: '<p>Test</p>' });

    render(
      <Wrapper>
        <PsychedInputGuesser source="body" />
      </Wrapper>
    );

    await waitFor(() => {
      const editor = document.querySelector('.tiptap');
      expect(editor).not.toBeNull();
    });
  });

  it('maps slug type to SlugInput with uses prop', async () => {
    const Wrapper = createFormWrapper(mockSchemaWithGroups, 'posts', { title: '', slug: '' });

    render(
      <Wrapper>
        <PsychedInputGuesser source="slug" />
      </Wrapper>
    );

    await waitFor(() => {
      const lockButton = screen.getByRole('button', { name: /lock/i });
      expect(lockButton).toBeDefined();
    });
  });

  it('returns null for hidden type fields', async () => {
    const schemaWithHidden: PsychedSchema = {
      resources: new Map([
        [
          'posts',
          {
            name: 'posts',
            contentType: null,
            fields: new Map([
              [
                'internalId',
                {
                  type: 'hidden',
                  label: 'Internal ID',
                },
              ],
            ]),
          },
        ],
      ]),
    };

    const Wrapper = createFormWrapper(schemaWithHidden, 'posts', { internalId: '123' });

    const { container } = render(
      <Wrapper>
        <PsychedInputGuesser source="internalId" />
      </Wrapper>
    );

    await waitFor(() => {
      const inputs = container.querySelectorAll('input[name="internalId"]');
      expect(inputs.length).toBe(0);
    });
  });

  it('falls back to TextInput for unknown types', async () => {
    const schemaWithUnknown: PsychedSchema = {
      resources: new Map([
        [
          'posts',
          {
            name: 'posts',
            contentType: null,
            fields: new Map([
              [
                'customField',
                {
                  type: 'field' as const,
                  label: 'Custom Field',
                },
              ],
            ]),
          },
        ],
      ]),
    };

    const Wrapper = createFormWrapper(schemaWithUnknown, 'posts', { customField: '' });

    render(
      <Wrapper>
        <PsychedInputGuesser source="customField" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(input).toBeDefined();
    });
  });
});

describe('TabbedFormGuesser', () => {
  it('groups fields into tabs by group property', async () => {
    const { container } = render(
      <AdminContext dataProvider={dataProvider}>
        <PsychedSchemaContext.Provider
          value={{ schema: mockSchemaWithGroups, loading: false, error: null }}
        >
          <ResourceDefinitionContextProvider
            definitions={{
              posts: {
                name: 'posts',
                hasCreate: true,
                hasEdit: true,
                hasShow: false,
                hasList: true,
              },
            }}
          >
            <ResourceContextProvider value="posts">
              <TabbedFormGuesser />
            </ResourceContextProvider>
          </ResourceDefinitionContextProvider>
        </PsychedSchemaContext.Provider>
      </AdminContext>
    );

    await waitFor(() => {
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(2);
    });

    const contentTab = screen.getByRole('tab', { name: /content/i });
    const seoTab = screen.getByRole('tab', { name: /seo/i });
    expect(contentTab).toBeDefined();
    expect(seoTab).toBeDefined();
  });

  it('falls back to SimpleForm for single group', async () => {
    const { container } = render(
      <AdminContext dataProvider={dataProvider}>
        <PsychedSchemaContext.Provider
          value={{ schema: mockSchemaWithSingleGroup, loading: false, error: null }}
        >
          <ResourceDefinitionContextProvider
            definitions={{
              users: {
                name: 'users',
                hasCreate: true,
                hasEdit: true,
                hasShow: false,
                hasList: true,
              },
            }}
          >
            <ResourceContextProvider value="users">
              <TabbedFormGuesser />
            </ResourceContextProvider>
          </ResourceDefinitionContextProvider>
        </PsychedSchemaContext.Provider>
      </AdminContext>
    );

    await waitFor(() => {
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(0);
    });

    const emailInput = await screen.findByRole('textbox', { name: /email/i });
    expect(emailInput).toBeDefined();
  });
});
