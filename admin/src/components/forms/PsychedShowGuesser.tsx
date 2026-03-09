import type { ReactElement } from 'react';
import { ShowGuesser, type ShowGuesserProps } from '@api-platform/admin';
import {
  Show,
  SimpleShowLayout,
  TextField,
  RichTextField,
  DateField,
  NumberField,
  BooleanField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  useResourceContext,
} from 'react-admin';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import type { FieldMetadata, FieldType } from '../../types/psychedcms.ts';

function getShowField(fieldName: string, meta: FieldMetadata) {
  const label = meta.label ?? undefined;

  if (meta.type === 'entity_taxonomy') {
    if (meta.multiple) {
      return (
        <ReferenceArrayField key={fieldName} source={fieldName} reference={fieldName} label={label}>
          <SingleFieldList linkType={false}>
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
      );
    }
    return (
      <ReferenceField key={fieldName} source={fieldName} reference={fieldName} link={false} label={label}>
        <TextField source="name" />
      </ReferenceField>
    );
  }

  if (meta.type === 'taxonomy') {
    if (meta.multiple) {
      return (
        <ReferenceArrayField key={fieldName} source={fieldName} reference="taxonomies" label={label}>
          <SingleFieldList linkType={false}>
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
      );
    }
    return (
      <ReferenceField key={fieldName} source={fieldName} reference="taxonomies" link={false} label={label}>
        <TextField source="name" />
      </ReferenceField>
    );
  }

  const displayMap: Partial<Record<FieldType, ReactElement>> = {
    html: <RichTextField key={fieldName} source={fieldName} label={label} />,
    markdown: <RichTextField key={fieldName} source={fieldName} label={label} />,
    date: <DateField key={fieldName} source={fieldName} label={label} showTime />,
    number: <NumberField key={fieldName} source={fieldName} label={label} />,
    checkbox: <BooleanField key={fieldName} source={fieldName} label={label} />,
  };

  if (displayMap[meta.type]) {
    return displayMap[meta.type];
  }

  return <TextField key={fieldName} source={fieldName} label={label} />;
}

// Fields rendered in the sidebar, not in the show layout
const SIDEBAR_FIELDS = new Set(['status', 'publishedAt', 'depublishedAt', 'author']);

function PsychedShowLayout({ fields }: { fields: Map<string, FieldMetadata> }) {
  const visibleFields = Array.from(fields.entries()).filter(
    ([name, meta]) => meta.type !== 'hidden' && !SIDEBAR_FIELDS.has(name),
  );

  return (
    <SimpleShowLayout>
      {visibleFields.map(([name, meta]) => getShowField(name, meta))}
    </SimpleShowLayout>
  );
}

export function PsychedShowGuesser(props: ShowGuesserProps) {
  const resource = useResourceContext();
  const resourceSchema = usePsychedSchema(resource ?? '');

  if (!resourceSchema || resourceSchema.fields.size === 0) {
    return <ShowGuesser {...props} />;
  }

  return (
    <Show {...props}>
      <PsychedShowLayout fields={resourceSchema.fields} />
    </Show>
  );
}
