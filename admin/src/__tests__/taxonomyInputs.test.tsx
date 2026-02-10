import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminContext, SimpleForm } from 'react-admin';

import { TaxonomyInput } from '../components/inputs/TaxonomyInput.tsx';
import { EntityTaxonomyInput } from '../components/inputs/EntityTaxonomyInput.tsx';

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

beforeEach(() => {
  vi.clearAllMocks();
  dataProvider.getList.mockResolvedValue({ data: [], total: 0 });
  dataProvider.getMany.mockResolvedValue({ data: [] });
});

describe('TaxonomyInput', () => {
  it('renders autocomplete input for single selection', async () => {
    const Wrapper = createTestWrapper({ tag: null });

    render(
      <Wrapper>
        <TaxonomyInput source="tag" taxonomyType="tags" label="Tag" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByLabelText(/tag/i);
      expect(input).toBeDefined();
    });
  });

  it('renders autocomplete array input for multiple selection', async () => {
    const Wrapper = createTestWrapper({ tags: [] });

    render(
      <Wrapper>
        <TaxonomyInput source="tags" taxonomyType="tags" multiple label="Tags" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByLabelText(/tags/i);
      expect(input).toBeDefined();
    });
  });

  it('fetches taxonomies filtered by type', async () => {
    const Wrapper = createTestWrapper({ category: null });

    render(
      <Wrapper>
        <TaxonomyInput source="category" taxonomyType="categories" label="Category" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(dataProvider.getList).toHaveBeenCalledWith('taxonomies', expect.objectContaining({
        filter: expect.objectContaining({ type: 'categories' }),
      }));
    });
  });
});

describe('EntityTaxonomyInput', () => {
  it('renders reference input for single selection', async () => {
    const Wrapper = createTestWrapper({ author: null });

    render(
      <Wrapper>
        <EntityTaxonomyInput source="author" reference="authors" label="Author" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByLabelText(/author/i);
      expect(input).toBeDefined();
    });
  });

  it('renders reference array input for multiple selection', async () => {
    const Wrapper = createTestWrapper({ authors: [] });

    render(
      <Wrapper>
        <EntityTaxonomyInput source="authors" reference="authors" multiple label="Authors" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByLabelText(/authors/i);
      expect(input).toBeDefined();
    });
  });
});
