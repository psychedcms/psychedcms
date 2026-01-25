import { describe, expect, it } from 'vitest';

import type { OpenApiDocument } from '../types/psychedcms.ts';
import { parseOpenApiExtensions } from '../utils/parseOpenApiExtensions.ts';

describe('parseOpenApiExtensions', () => {
  it('correctly extracts ContentType metadata from schema-level x-psychedcms', () => {
    const openApiDoc: OpenApiDocument = {
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
              icon: 'article',
              showOnDashboard: true,
              defaultStatus: 'draft',
              searchable: true,
              singleton: false,
              locales: ['en'],
            },
            properties: {},
          },
        },
      },
    };

    const result = parseOpenApiExtensions(openApiDoc);
    const postSchema = result.resources.get('posts');

    expect(postSchema).toBeDefined();
    expect(postSchema?.contentType).toEqual({
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
    });
  });

  it('extracts field-level x-psychedcms from properties', () => {
    const openApiDoc: OpenApiDocument = {
      openapi: '3.1.0',
      components: {
        schemas: {
          'Post.jsonld': {
            type: 'object',
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
              content: {
                type: 'string',
                'x-psychedcms': {
                  type: 'html',
                  label: 'Content',
                  group: 'content',
                },
              },
              slug: {
                type: 'string',
                'x-psychedcms': {
                  type: 'slug',
                  uses: 'title',
                  label: 'Slug',
                },
              },
            },
          },
        },
      },
    };

    const result = parseOpenApiExtensions(openApiDoc);
    const postSchema = result.resources.get('posts');

    expect(postSchema?.fields.size).toBe(3);
    expect(postSchema?.fields.get('title')).toEqual({
      type: 'text',
      label: 'Title',
      group: 'content',
      required: true,
    });
    expect(postSchema?.fields.get('content')?.type).toBe('html');
    expect(postSchema?.fields.get('slug')?.uses).toBe('title');
  });

  it('handles schemas without x-psychedcms gracefully', () => {
    const openApiDoc: OpenApiDocument = {
      openapi: '3.1.0',
      components: {
        schemas: {
          'User.jsonld': {
            type: 'object',
            properties: {
              email: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
            },
          },
        },
      },
    };

    const result = parseOpenApiExtensions(openApiDoc);
    const userSchema = result.resources.get('users');

    expect(userSchema).toBeDefined();
    expect(userSchema?.contentType).toBeNull();
    expect(userSchema?.fields.size).toBe(0);
  });

  it('handles empty or missing components section', () => {
    const emptyDoc: OpenApiDocument = {
      openapi: '3.1.0',
    };

    const result = parseOpenApiExtensions(emptyDoc);

    expect(result.resources.size).toBe(0);
  });

  it('derives resource names correctly from schema names', () => {
    const openApiDoc: OpenApiDocument = {
      openapi: '3.1.0',
      components: {
        schemas: {
          'BlogPost.jsonld': {
            type: 'object',
            'x-psychedcms': {
              name: 'Blog Posts',
              singularName: 'Blog Post',
              slug: 'blog-posts',
              singularSlug: 'blog-post',
              icon: 'article',
              showOnDashboard: true,
              defaultStatus: 'draft',
              searchable: true,
              singleton: false,
              locales: ['en'],
            },
          },
        },
      },
    };

    const result = parseOpenApiExtensions(openApiDoc);

    expect(result.resources.has('blog-posts')).toBe(true);
    expect(result.resources.get('blog-posts')?.name).toBe('blog-posts');
  });
});
