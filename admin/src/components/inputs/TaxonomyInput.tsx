import {
  AutocompleteInput,
  AutocompleteArrayInput,
  ReferenceInput,
  ReferenceArrayInput,
  useCreate,
} from 'react-admin';
import { useCallback } from 'react';

interface TaxonomyInputProps {
  source: string;
  taxonomyType: string;
  multiple?: boolean;
  allowCreate?: boolean;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function TaxonomyInput({
  source,
  taxonomyType,
  multiple = false,
  allowCreate = false,
  label,
  helperText,
  isRequired,
}: TaxonomyInputProps) {
  const [create] = useCreate();

  const handleCreate = useCallback(
    async (name?: string) => {
      if (!name) return undefined;
      const slug = slugify(name);
      if (!slug) return undefined;
      const newTaxonomy = await create(
        'taxonomies',
        { data: { type: taxonomyType, name, slug } },
        { returnPromise: true },
      );
      return newTaxonomy;
    },
    [create, taxonomyType],
  );

  const filter = { type: taxonomyType };
  const sort = { field: 'sortOrder', order: 'ASC' as const };

  const autocompleteProps = {
    label,
    helperText,
    isRequired,
    optionText: 'name' as const,
    filterToQuery: (q: string) => ({ name: q, type: taxonomyType }),
    ...(allowCreate ? { onCreate: handleCreate } : {}),
  };

  if (multiple) {
    return (
      <ReferenceArrayInput source={source} reference="taxonomies" filter={filter} sort={sort}>
        <AutocompleteArrayInput {...autocompleteProps} />
      </ReferenceArrayInput>
    );
  }

  return (
    <ReferenceInput source={source} reference="taxonomies" filter={filter} sort={sort}>
      <AutocompleteInput {...autocompleteProps} />
    </ReferenceInput>
  );
}
