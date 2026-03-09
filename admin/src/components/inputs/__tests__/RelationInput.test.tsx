import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminContext, SimpleForm } from 'react-admin';

import { RelationInput } from '../RelationInput.tsx';

const dataProvider = {
  getList: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getOne: vi.fn().mockResolvedValue({ data: {} }),
  getMany: vi.fn().mockResolvedValue({ data: [] }),
  getManyReference: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  update: vi.fn(),
  updateMany: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
};

function createTestWrapper(defaultValues: Record<string, unknown> = {}) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <AdminContext dataProvider={dataProvider}>
        <SimpleForm defaultValues={defaultValues} toolbar={false}>
          {children}
        </SimpleForm>
      </AdminContext>
    );
  };
}

describe('RelationInput', () => {
  it('renders single-select with ReferenceInput and AutocompleteInput', async () => {
    const Wrapper = createTestWrapper({ author: null });

    render(
      <Wrapper>
        <RelationInput source="author" reference="users" label="Author" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Author')).toBeDefined();
    });
  });

  it('renders multi-select with ReferenceArrayInput and AutocompleteArrayInput', async () => {
    const Wrapper = createTestWrapper({ relatedPosts: [] });

    render(
      <Wrapper>
        <RelationInput source="relatedPosts" reference="posts" multiple label="Related Posts" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Related Posts')).toBeDefined();
    });
  });

  it('passes reference prop to data provider', async () => {
    const Wrapper = createTestWrapper({ author: null });

    render(
      <Wrapper>
        <RelationInput source="author" reference="users" label="Author" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(dataProvider.getList).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          pagination: expect.any(Object),
        }),
      );
    });
  });

  it('uses default displayField of name', async () => {
    const Wrapper = createTestWrapper({ author: null });

    render(
      <Wrapper>
        <RelationInput source="author" reference="users" label="Author" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Author')).toBeDefined();
    });
  });

  it('renders label and helperText', async () => {
    const Wrapper = createTestWrapper({ author: null });

    render(
      <Wrapper>
        <RelationInput
          source="author"
          reference="users"
          label="Post Author"
          helperText="Select the author of this post"
        />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Post Author')).toBeDefined();
      expect(screen.getByText('Select the author of this post')).toBeDefined();
    });
  });
});
