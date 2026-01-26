import {
  SimpleForm,
  TabbedForm,
  useResourceContext,
} from 'react-admin';
import { Box, Card } from '@mui/material';

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
 * Two-column layout component that goes INSIDE the form.
 * Uses CSS Grid for more reliable two-column layout.
 */
function TwoColumnFormContent({
  children,
  resource
}: {
  children: React.ReactNode;
  resource: string;
}) {
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
      {/* Left block: Form fields */}
      <Card sx={{ p: 2 }} variant="outlined">
        {children}
      </Card>

      {/* Right block: Sidebar */}
      <Box sx={{ minWidth: 280 }}>
        <EditSidebar resource={resource} />
      </Box>
    </Box>
  );
}

/**
 * Two-column content form layout.
 * Left (2/3): Card with form fields
 * Right (1/3): Sidebar with save button and publication options
 */
export function ContentForm({ resource: resourceProp }: ContentFormProps) {
  const resourceFromContext = useResourceContext();
  const resource = resourceProp ?? resourceFromContext ?? '';
  const resourceSchema = usePsychedSchema(resource);

  const groupedFields = groupFieldsByGroup(resourceSchema?.fields);
  const groupOrder = getGroupOrder(resourceSchema?.fields);

  // Single group or no schema - use SimpleForm
  if (groupOrder.length <= 1) {
    const fields = groupOrder.length === 1 ? groupedFields.get(groupOrder[0]) ?? [] : [];

    return (
      <SimpleForm toolbar={false} sx={{ p: 2, '& .RaSimpleForm-form': { width: '100%' } }}>
        <TwoColumnFormContent resource={resource}>
          {fields.map((fieldName) => (
            <PsychedInputGuesser key={fieldName} source={fieldName} resource={resource} />
          ))}
        </TwoColumnFormContent>
      </SimpleForm>
    );
  }

  // Multiple groups - use TabbedForm with sidebar in first tab
  return (
    <TabbedForm toolbar={false} sx={{ p: 2, '& .RaTabbedForm-content': { width: '100%' } }}>
      {groupOrder.map((group, index) => {
        const fields = groupedFields.get(group) ?? [];
        const label = humanizeGroupName(group);

        if (index === 0) {
          // First tab includes sidebar
          return (
            <TabbedForm.Tab key={group} label={label}>
              <TwoColumnFormContent resource={resource}>
                <FieldGroup fields={fields} resource={resource} />
              </TwoColumnFormContent>
            </TabbedForm.Tab>
          );
        }

        // Other tabs without sidebar
        return (
          <TabbedForm.Tab key={group} label={label}>
            <FieldGroup fields={fields} resource={resource} />
          </TabbedForm.Tab>
        );
      })}
    </TabbedForm>
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
