import { useState } from 'react';
import {
  SimpleForm,
  useResourceContext,
} from 'react-admin';
import { Box, Card, Tab, Tabs } from '@mui/material';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { PsychedInputGuesser } from '../inputs/PsychedInputGuesser.tsx';
import { FieldGroup } from './FieldGroup.tsx';
import { EditSidebar } from './EditSidebar.tsx';

interface ContentFormProps {
  resource?: string;
}

// Fields handled by the sidebar, excluded from main form
const SIDEBAR_FIELDS = new Set(['status', 'publishedAt', 'depublishedAt', 'author']);

function humanizeGroupName(group: string): string {
  const abbreviations: Record<string, string> = {
    seo: 'SEO',
    url: 'URL',
    api: 'API',
    id: 'ID',
    html: 'HTML',
    css: 'CSS',
  };

  if (abbreviations[group.toLowerCase()]) {
    return abbreviations[group.toLowerCase()];
  }

  return group
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Inner layout rendered inside SimpleForm.
 * Two-column grid: left (2/3) has tabbed content, right (1/3) has sidebar.
 * The sidebar persists across all tabs.
 */
function ContentFormLayout({
  resource,
  groupOrder,
  groupedFields,
}: {
  resource: string;
  groupOrder: string[];
  groupedFields: Map<string, string[]>;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const hasTabs = groupOrder.length > 1;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3,
        width: '100%',
        alignItems: 'start',
      }}
    >
      {/* Left block: tabbed form fields */}
      <Card sx={{ p: 2 }} variant="outlined">
        {hasTabs && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {groupOrder.map((group) => (
              <Tab key={group} label={humanizeGroupName(group)} />
            ))}
          </Tabs>
        )}

        {groupOrder.map((group, index) => {
          const fields = groupedFields.get(group) ?? [];
          // When tabs exist, only render the active tab's fields.
          // Hidden tabs stay mounted (display:none) so form state is preserved.
          if (hasTabs) {
            return (
              <Box key={group} sx={{ display: activeTab === index ? 'block' : 'none' }}>
                <FieldGroup fields={fields} resource={resource} />
              </Box>
            );
          }
          return <FieldGroup key={group} fields={fields} resource={resource} />;
        })}
      </Card>

      {/* Right block: sidebar - always visible */}
      <Box sx={{ minWidth: 280 }}>
        <EditSidebar resource={resource} />
      </Box>
    </Box>
  );
}

/**
 * Two-column content form layout.
 * Left (2/3): Card with tabbed form fields
 * Right (1/3): Sidebar with save button and publication options (persists across tabs)
 */
export function ContentForm({ resource: resourceProp }: ContentFormProps) {
  const resourceFromContext = useResourceContext();
  const resource = resourceProp ?? resourceFromContext ?? '';
  const resourceSchema = usePsychedSchema(resource);

  const groupedFields = groupFieldsByGroup(resourceSchema?.fields);
  const groupOrder = getGroupOrder(resourceSchema?.fields);

  return (
    <SimpleForm toolbar={false} sx={{ p: 0, '& .RaSimpleForm-form': { width: '100%' } }}>
      <ContentFormLayout
        resource={resource}
        groupOrder={groupOrder}
        groupedFields={groupedFields}
      />
    </SimpleForm>
  );
}

function groupFieldsByGroup(
  fields: Map<string, { group?: string }> | undefined
): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  if (!fields) return groups;

  for (const [fieldName, metadata] of fields) {
    if (SIDEBAR_FIELDS.has(fieldName)) {
      continue;
    }

    const group = metadata.group ?? 'general';

    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group)!.push(fieldName);
  }

  return groups;
}

function getGroupOrder(fields: Map<string, { group?: string }> | undefined): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  if (!fields) return order;

  for (const [fieldName, metadata] of fields) {
    if (SIDEBAR_FIELDS.has(fieldName)) {
      continue;
    }

    const group = metadata.group ?? 'general';

    if (!seen.has(group)) {
      seen.add(group);
      order.push(group);
    }
  }

  return order;
}
