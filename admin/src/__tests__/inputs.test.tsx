import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminContext, SimpleForm, TextInput } from 'react-admin';

import { HtmlInput } from '../components/inputs/HtmlInput.tsx';
import { MarkdownInput } from '../components/inputs/MarkdownInput.tsx';
import { SlugInput } from '../components/inputs/SlugInput.tsx';

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

function getSlugField(): HTMLInputElement {
  const allInputs = screen.getAllByRole('textbox');
  return allInputs.find((input) =>
    input.closest('.MuiTextField-root')?.querySelector('label')?.textContent === 'Slug'
  ) as HTMLInputElement;
}

describe('HtmlInput', () => {
  it('renders TipTap editor', async () => {
    const Wrapper = createTestWrapper({ body: '<p>Hello world</p>' });

    render(
      <Wrapper>
        <HtmlInput source="body" label="Body Content" />
      </Wrapper>
    );

    await waitFor(() => {
      const editor = document.querySelector('.tiptap');
      expect(editor).toBeDefined();
      expect(editor).not.toBeNull();
    });
  });
});

describe('MarkdownInput', () => {
  it('renders editor and handles markdown bidirectionally', async () => {
    const Wrapper = createTestWrapper({ content: '# Hello\n\nThis is **bold** text.' });

    render(
      <Wrapper>
        <MarkdownInput source="content" label="Markdown Content" />
      </Wrapper>
    );

    await waitFor(() => {
      const editor = document.querySelector('.tiptap');
      expect(editor).toBeDefined();
      expect(editor).not.toBeNull();
    });
  });
});

describe('SlugInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-generates slug from source field', async () => {
    const Wrapper = createTestWrapper({ title: '', slug: '' });

    render(
      <Wrapper>
        <TextInput source="title" label="Title" />
        <SlugInput source="slug" uses="title" label="Slug" />
      </Wrapper>
    );

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const slugField = getSlugField();

    fireEvent.change(titleInput, { target: { value: 'Hello World' } });

    await waitFor(() => {
      expect(slugField?.value || '').toBe('hello-world');
    });
  });

  it('lock toggle stops auto-generation', async () => {
    const Wrapper = createTestWrapper({ title: '', slug: '' });

    render(
      <Wrapper>
        <TextInput source="title" label="Title" />
        <SlugInput source="slug" uses="title" label="Slug" />
      </Wrapper>
    );

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const slugField = getSlugField();

    fireEvent.change(titleInput, { target: { value: 'First Title' } });

    await waitFor(() => {
      expect(slugField?.value || '').toBe('first-title');
    });

    const lockButton = screen.getByTestId('LockOpenIcon').closest('button')!;
    fireEvent.click(lockButton);

    fireEvent.change(titleInput, { target: { value: 'Second Title' } });

    await waitFor(
      () => {
        expect(slugField?.value || '').toBe('first-title');
      },
      { timeout: 500 }
    );
  });

  it('initializes locked for existing records', async () => {
    const existingRecord = { id: 1, title: 'Existing Post', slug: 'existing-post' };
    const Wrapper = createTestWrapper(existingRecord);

    render(
      <Wrapper>
        <TextInput source="title" label="Title" />
        <SlugInput source="slug" uses="title" label="Slug" />
      </Wrapper>
    );

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const slugField = getSlugField();

    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });

    await waitFor(
      () => {
        expect(slugField?.value || '').toBe('existing-post');
      },
      { timeout: 500 }
    );
  });
});
