import {
  AutocompleteInput,
  AutocompleteArrayInput,
  ReferenceInput,
  ReferenceArrayInput,
} from 'react-admin';

interface RelationInputProps {
  source: string;
  reference: string;
  multiple?: boolean;
  displayField?: string;
  searchable?: boolean;
  allowCreate?: boolean;
  order?: string;
  filter?: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
}

export function RelationInput({
  source,
  reference,
  multiple = false,
  displayField = 'name',
  searchable = true,
  // allowCreate plumbed but not wired in v1
  allowCreate: _allowCreate = false,
  order,
  filter,
  label,
  helperText,
  isRequired,
}: RelationInputProps) {
  const sort = order
    ? { field: order, order: 'ASC' as const }
    : undefined;

  const filterObj = filter ? { [filter]: true } : undefined;

  const autocompleteProps = {
    label,
    helperText,
    isRequired,
    optionText: displayField,
    ...(searchable
      ? { filterToQuery: (q: string) => (q ? { [displayField]: q } : {}) }
      : {}),
  };

  if (multiple) {
    return (
      <ReferenceArrayInput source={source} reference={reference} filter={filterObj} sort={sort}>
        <AutocompleteArrayInput {...autocompleteProps} />
      </ReferenceArrayInput>
    );
  }

  return (
    <ReferenceInput source={source} reference={reference} filter={filterObj} sort={sort}>
      <AutocompleteInput {...autocompleteProps} />
    </ReferenceInput>
  );
}
