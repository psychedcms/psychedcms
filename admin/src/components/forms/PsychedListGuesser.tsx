import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  EditButton,
  ShowButton,
  useResourceContext,
} from 'react-admin';
import type { ListProps, RaRecord } from 'react-admin';
import { usePsychedSchema } from '../../hooks/index.ts';
import type { FieldMetadata } from '../../types/psychedcms.ts';

/**
 * Get the appropriate react-admin field component for a field type.
 */
function getFieldComponent(fieldName: string, meta: FieldMetadata) {
  if (meta.type === 'entity_taxonomy') {
    if (meta.multiple) {
      return (
        <ReferenceArrayField key={fieldName} source={fieldName} reference={fieldName} label={meta.label}>
          <SingleFieldList linkType={false}>
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
      );
    }
    return (
      <ReferenceField key={fieldName} source={fieldName} reference={fieldName} link={false} label={meta.label}>
        <TextField source="name" />
      </ReferenceField>
    );
  }

  if (meta.type === 'taxonomy') {
    if (meta.multiple) {
      return (
        <ReferenceArrayField key={fieldName} source={fieldName} reference="taxonomies" label={meta.label}>
          <SingleFieldList linkType={false}>
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
      );
    }
    return (
      <ReferenceField key={fieldName} source={fieldName} reference="taxonomies" link={false} label={meta.label}>
        <TextField source="name" />
      </ReferenceField>
    );
  }

  return <TextField key={fieldName} source={fieldName} label={meta.label} />;
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
 * Fallback field for resources without x-psychedcms schema.
 * Tries common display fields before falling back to id.
 */
function FallbackNameField() {
  return (
    <FunctionField
      label="Name"
      render={(record: RaRecord) =>
        record.name ?? record.email ?? record.title ?? record.label ?? String(record.id)
      }
    />
  );
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
      {listFields.length === 0 && <FallbackNameField />}
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
