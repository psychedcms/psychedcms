import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminContext, SimpleForm } from 'react-admin';

import { CollectionInput } from '../CollectionInput.tsx';

const dataProvider = {
  getList: vi.fn(),
  getOne: vi.fn(),
  getMany: vi.fn(),
  getManyReference: vi.fn(),
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

const testSchema = {
  platform: { type: 'select', values: ['spotify', 'bandcamp'] },
  url: 'text',
};

describe('CollectionInput', () => {
  it('renders empty state with add button', async () => {
    const Wrapper = createTestWrapper({ socialLinks: null });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Add item')).toBeDefined();
    });
  });

  it('renders existing items', async () => {
    const Wrapper = createTestWrapper({
      socialLinks: [
        { platform: 'spotify', url: 'https://spotify.com/artist' },
        { platform: 'bandcamp', url: 'https://band.bandcamp.com' },
      ],
    });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} />
      </Wrapper>,
    );

    await waitFor(() => {
      const removeButtons = screen.getAllByLabelText('Remove item');
      expect(removeButtons).toHaveLength(2);
    });
  });

  it('adds a new item when clicking add button', async () => {
    const Wrapper = createTestWrapper({ socialLinks: [] });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Add item')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Add item'));

    await waitFor(() => {
      expect(screen.getByLabelText('Remove item')).toBeDefined();
    });
  });

  it('removes an item when clicking remove button', async () => {
    const Wrapper = createTestWrapper({
      socialLinks: [{ platform: 'spotify', url: 'https://spotify.com' }],
    });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Remove item')).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText('Remove item'));

    await waitFor(() => {
      expect(screen.queryAllByLabelText('Remove item')).toHaveLength(0);
    });
  });

  it('disables add button when max is reached', async () => {
    const Wrapper = createTestWrapper({
      socialLinks: [
        { platform: 'spotify', url: 'https://spotify.com' },
      ],
    });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} max={1} />
      </Wrapper>,
    );

    await waitFor(() => {
      const addButton = screen.getByText('Add item').closest('button');
      expect(addButton?.disabled).toBe(true);
    });
  });

  it('shows label with count constraints', async () => {
    const Wrapper = createTestWrapper({ socialLinks: [] });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} min={1} max={5} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Social Links/)).toBeDefined();
      expect(screen.getByText(/1–5/)).toBeDefined();
    });
  });

  it('renders reorder buttons when sortable', async () => {
    const Wrapper = createTestWrapper({
      socialLinks: [
        { platform: 'spotify', url: 'https://spotify.com' },
        { platform: 'bandcamp', url: 'https://bandcamp.com' },
      ],
    });

    render(
      <Wrapper>
        <CollectionInput source="socialLinks" label="Social Links" schema={testSchema} sortable={true} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getAllByLabelText('Move up')).toHaveLength(2);
      expect(screen.getAllByLabelText('Move down')).toHaveLength(2);
    });
  });
});
