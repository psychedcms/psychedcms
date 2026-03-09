import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AdminContext, SimpleForm, ResourceContextProvider, ResourceDefinitionContextProvider } from 'react-admin';

import { PsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';
import type { PsychedSchema } from '../types/psychedcms.ts';
import { PsychedInputGuesser } from '../components/inputs/PsychedInputGuesser.tsx';
import { TabbedFormGuesser } from '../components/forms/TabbedFormGuesser.tsx';
import { ScheduleDialog } from '../components/forms/ScheduleDialog.tsx';

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

  it('renders DateTimeInput when date field has mode datetime', async () => {
    const schemaWithDateTime: PsychedSchema = {
      resources: new Map([
        [
          'events',
          {
            name: 'events',
            contentType: null,
            fields: new Map([
              [
                'startsAt',
                {
                  type: 'date',
                  label: 'Starts At',
                  mode: 'datetime',
                },
              ],
            ]),
          },
        ],
      ]),
    };

    const Wrapper = createFormWrapper(schemaWithDateTime, 'events', { startsAt: '' });

    render(
      <Wrapper>
        <PsychedInputGuesser source="startsAt" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByLabelText('Starts At');
      expect(input).toBeDefined();
    });
  });

  it('renders DateInput when date field has no mode', async () => {
    const schemaWithDate: PsychedSchema = {
      resources: new Map([
        [
          'events',
          {
            name: 'events',
            contentType: null,
            fields: new Map([
              [
                'publishedOn',
                {
                  type: 'date',
                  label: 'Published On',
                },
              ],
            ]),
          },
        ],
      ]),
    };

    const Wrapper = createFormWrapper(schemaWithDate, 'events', { publishedOn: '' });

    render(
      <Wrapper>
        <PsychedInputGuesser source="publishedOn" />
      </Wrapper>
    );

    await waitFor(() => {
      const input = screen.getByLabelText('Published On');
      expect(input).toBeDefined();
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

describe('ScheduleDialog', () => {
  it('renders dialog when open', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ScheduleDialog open={true} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.getByText('Schedule Publication')).toBeDefined();
    expect(screen.getByText(/select date/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /schedule/i })).toBeDefined();
  });

  it('does not render when closed', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ScheduleDialog open={false} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.queryByText('Schedule Publication')).toBeNull();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ScheduleDialog open={true} onClose={onClose} onConfirm={onConfirm} />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm with ISO date when schedule is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ScheduleDialog open={true} onClose={onClose} onConfirm={onConfirm} />
    );

    // Default value is 1 hour in the future, so just clicking schedule should work
    fireEvent.click(screen.getByRole('button', { name: /schedule/i }));

    expect(onConfirm).toHaveBeenCalled();
    const calledArg = onConfirm.mock.calls[0][0];
    // Should be ISO 8601 ATOM format with timezone
    expect(calledArg).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it('disables buttons when loading', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ScheduleDialog open={true} onClose={onClose} onConfirm={onConfirm} loading={true} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const scheduleButton = screen.getByRole('button', { name: /scheduling/i });
    expect(cancelButton.hasAttribute('disabled')).toBe(true);
    expect(scheduleButton.hasAttribute('disabled')).toBe(true);
  });
});
