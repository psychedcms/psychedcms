import { List, Datagrid, TextField, EditButton, ShowButton, useResourceContext } from 'react-admin';
import type { ListProps } from 'react-admin';
import { usePsychedSchema } from '../../hooks/index.ts';
import type { FieldMetadata } from '../../types/psychedcms.ts';

/**
 * Get the appropriate react-admin field component for a field type.
 */
function getFieldComponent(fieldName: string, _meta: FieldMetadata) {
  // For now, use TextField for everything - can be extended later
  return <TextField key={fieldName} source={fieldName} />;
}

/**
 * Determine which fields to show in the list view.
 * Prioritizes: title, name, label, then other text fields.
 */
function getListFields(fields: Map<string, FieldMetadata>): string[] {
  const fieldNames = Array.from(fields.keys());
  const listFields: string[] = [];

  // Priority fields to show first
  const priorityFields = ['title', 'name', 'label', 'slug'];
  for (const pf of priorityFields) {
    if (fieldNames.includes(pf)) {
      listFields.push(pf);
    }
  }

  // Add status if available
  if (fieldNames.includes('status')) {
    listFields.push('status');
  }

  // If we don't have any priority fields, show first few text fields
  if (listFields.length === 0) {
    const textFields = fieldNames.filter((name) => {
      const meta = fields.get(name);
      return meta && ['text', 'textarea', 'email'].includes(meta.type);
    });
    listFields.push(...textFields.slice(0, 3));
  }

  // Limit to reasonable number of columns
  return listFields.slice(0, 5);
}

/**
 * Inner component that uses the resource context to get the schema.
 */
function PsychedListGuesserInner() {
  const resource = useResourceContext();
  const schema = usePsychedSchema(resource ?? '');

  // Get fields to display
  const listFields = schema?.fields ? getListFields(schema.fields) : [];

  return (
    <Datagrid rowClick="show">
      {listFields.map((fieldName) => {
        const meta = schema?.fields.get(fieldName);
        if (meta) {
          return getFieldComponent(fieldName, meta);
        }
        return <TextField key={fieldName} source={fieldName} />;
      })}
      {listFields.length === 0 && <TextField source="id" label="ID" />}
      <ShowButton />
      <EditButton />
    </Datagrid>
  );
}

/**
 * Custom List component that uses PsychedCMS schema to guess fields.
 *
 * Avoids the buggy ListGuesser from @api-platform/admin which crashes
 * with "Cannot read properties of undefined" errors.
 */
export function PsychedListGuesser(props: ListProps) {
  return (
    <List {...props}>
      <PsychedListGuesserInner />
    </List>
  );
}
