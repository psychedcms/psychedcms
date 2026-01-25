import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { PsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';
import type { PsychedSchema, ResourceSchema } from '../types/psychedcms.ts';
import { MenuIcon } from '../components/layout/MenuIcon.tsx';
import { PsychedMenu } from '../components/layout/PsychedMenu.tsx';

vi.mock('react-admin', async () => {
  const actual = await vi.importActual('react-admin');
  return {
    ...actual,
    useResourceDefinitions: () => ({
      posts: { name: 'posts', hasList: true },
      pages: { name: 'pages', hasList: true },
      users: { name: 'users', hasList: true },
      settings: { name: 'settings', hasList: true },
    }),
    MenuItemLink: ({ to, primaryText }: { to: string; primaryText: string }) => (
      <a href={to} data-testid={`menu-item-${to.replace(/\//g, '')}`}>
        {primaryText}
      </a>
    ),
    useSidebarState: () => [true],
  };
});

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
        fields: new Map(),
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
    [
      'settings',
      {
        name: 'settings',
        contentType: null,
        fields: new Map(),
      },
    ],
  ]),
};

function createWrapper(schema: PsychedSchema | null, loading = false) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <PsychedSchemaContext.Provider value={{ schema, loading, error: null }}>
        {children}
      </PsychedSchemaContext.Provider>
    );
  };
}

describe('MenuIcon', () => {
  it('renders correct MUI icon by name', () => {
    render(<MenuIcon name="Article" />);
    const icon = screen.getByTestId('ArticleIcon');
    expect(icon).toBeDefined();
    expect(icon.tagName.toLowerCase()).toBe('svg');
  });

  it('shows fallback icon for invalid icon name', () => {
    render(<MenuIcon name="NonExistentIcon" />);
    const fallback = screen.getByTestId('DescriptionIcon');
    expect(fallback).toBeDefined();
    expect(fallback.tagName.toLowerCase()).toBe('svg');
  });

  it('shows fallback icon when name is null', () => {
    render(<MenuIcon name={null} />);
    const fallback = screen.getByTestId('DescriptionIcon');
    expect(fallback).toBeDefined();
    expect(fallback.tagName.toLowerCase()).toBe('svg');
  });
});

describe('PsychedMenu', () => {
  it('renders Content section with ContentType resources', () => {
    const Wrapper = createWrapper(mockSchema);
    render(
      <Wrapper>
        <PsychedMenu />
      </Wrapper>
    );

    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByTestId('menu-item-posts')).toBeDefined();
    expect(screen.getByTestId('menu-item-pages')).toBeDefined();
  });

  it('renders Admin section with non-ContentType resources', () => {
    const Wrapper = createWrapper(mockSchema);
    render(
      <Wrapper>
        <PsychedMenu />
      </Wrapper>
    );

    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByTestId('menu-item-users')).toBeDefined();
    expect(screen.getByTestId('menu-item-settings')).toBeDefined();
  });
});
