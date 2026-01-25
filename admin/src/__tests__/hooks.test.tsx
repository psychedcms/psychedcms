import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';

import { PsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';
import type { PsychedSchema } from '../types/psychedcms.ts';
import { usePsychedSchema } from '../hooks/usePsychedSchema.ts';
import { useFieldMetadata } from '../hooks/useFieldMetadata.ts';
import { useContentTypes } from '../hooks/useContentTypes.ts';

const mockSchema: PsychedSchema = {
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
            'content',
            {
              type: 'html',
              label: 'Content',
              group: 'content',
            },
          ],
        ]),
      },
    ],
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
              required: true,
            },
          ],
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
          icon: 'description',
          showOnDashboard: true,
          defaultStatus: 'draft',
          searchable: true,
          singleton: false,
          locales: ['en'],
        },
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

describe('usePsychedSchema', () => {
  it('returns correct resource schema for existing resource', () => {
    const { result } = renderHook(() => usePsychedSchema('posts'), {
      wrapper: createWrapper(mockSchema),
    });

    expect(result.current).not.toBeNull();
    expect(result.current?.name).toBe('posts');
    expect(result.current?.contentType?.name).toBe('Posts');
    expect(result.current?.contentType?.icon).toBe('article');
    expect(result.current?.fields.size).toBe(2);
  });

  it('returns null for missing resource', () => {
    const { result } = renderHook(() => usePsychedSchema('nonexistent'), {
      wrapper: createWrapper(mockSchema),
    });

    expect(result.current).toBeNull();
  });
});

describe('useFieldMetadata', () => {
  it('returns field-specific metadata for existing field', () => {
    const { result } = renderHook(() => useFieldMetadata('posts', 'title'), {
      wrapper: createWrapper(mockSchema),
    });

    expect(result.current).toBeDefined();
    expect(result.current?.type).toBe('text');
    expect(result.current?.label).toBe('Title');
    expect(result.current?.group).toBe('content');
    expect(result.current?.required).toBe(true);
  });

  it('returns undefined when field has no x-psychedcms metadata', () => {
    const { result } = renderHook(
      () => useFieldMetadata('posts', 'nonexistent'),
      {
        wrapper: createWrapper(mockSchema),
      }
    );

    expect(result.current).toBeUndefined();
  });
});

describe('useContentTypes', () => {
  it('filters resources with ContentType metadata', () => {
    const { result } = renderHook(() => useContentTypes(), {
      wrapper: createWrapper(mockSchema),
    });

    expect(result.current).toHaveLength(2);
    expect(result.current.map((r) => r.name)).toContain('posts');
    expect(result.current.map((r) => r.name)).toContain('pages');
    expect(result.current.map((r) => r.name)).not.toContain('users');
  });

  it('returns empty array when schema is not loaded', () => {
    const { result } = renderHook(() => useContentTypes(), {
      wrapper: createWrapper(null, true),
    });

    expect(result.current).toEqual([]);
  });
});
