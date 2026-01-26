import {
  useResourceContext,
  SimpleForm,
  TabbedForm,
} from 'react-admin';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { PsychedInputGuesser } from '../inputs/PsychedInputGuesser.tsx';
import { FieldGroup } from './FieldGroup.tsx';

interface TabbedFormGuesserProps {
  resource?: string;
}

/**
 * Humanize a group name for display as a tab label.
 * Handles common abbreviations and formats.
 */
function humanizeGroupName(group: string): string {
  const abbreviations: Record<string, string> = {
    seo: 'SEO',
    url: 'URL',
    api: 'API',
    id: 'ID',
    ids: 'IDs',
    html: 'HTML',
    css: 'CSS',
    faq: 'FAQ',
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
 * Form guesser that groups fields into tabs based on x-psychedcms metadata.
 *
 * - Groups fields by their `group` property (default: "general")
 * - Tab order determined by first appearance in field list
 * - Humanizes group names for tab labels
 * - Falls back to SimpleForm for single group
 * - Renders PsychedInputGuesser for each field
 */
export function TabbedFormGuesser({
  resource: resourceProp,
}: TabbedFormGuesserProps) {
  const resourceFromContext = useResourceContext();
  const resource = resourceProp ?? resourceFromContext ?? '';

  const resourceSchema = usePsychedSchema(resource);

  if (!resourceSchema || resourceSchema.fields.size === 0) {
    return <SimpleForm>{null}</SimpleForm>;
  }

  const groupedFields = groupFieldsByGroup(resourceSchema.fields);
  const groupOrder = getGroupOrder(resourceSchema.fields);

  if (groupOrder.length <= 1) {
    const fields = groupOrder.length === 1 ? groupedFields.get(groupOrder[0]) ?? [] : [];

    return (
      <SimpleForm>
        {fields.map((fieldName) => (
          <PsychedInputGuesser key={fieldName} source={fieldName} resource={resource} />
        ))}
      </SimpleForm>
    );
  }

  return (
    <TabbedForm>
      {groupOrder.map((group) => {
        const fields = groupedFields.get(group) ?? [];
        const label = humanizeGroupName(group);

        return (
          <TabbedForm.Tab key={group} label={label}>
            <FieldGroup
              fields={fields}
              resource={resource}
            />
          </TabbedForm.Tab>
        );
      })}
    </TabbedForm>
  );
}

/**
 * Group field names by their group property.
 */
function groupFieldsByGroup(
  fields: Map<string, { group?: string }>
): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const [fieldName, metadata] of fields) {
    const group = metadata.group ?? 'general';

    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group)!.push(fieldName);
  }

  return groups;
}

/**
 * Get group order based on first appearance in field list.
 */
function getGroupOrder(fields: Map<string, { group?: string }>): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  for (const metadata of fields.values()) {
    const group = metadata.group ?? 'general';

    if (!seen.has(group)) {
      seen.add(group);
      order.push(group);
    }
  }

  return order;
}
