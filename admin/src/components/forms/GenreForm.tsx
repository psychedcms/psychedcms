import {
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  AutocompleteInput,
  useGetList,
  useRecordContext,
} from 'react-admin';
import type { RaRecord } from 'react-admin';
import { useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';

interface TreeChoice {
  id: string;
  name: string;
  depth: number;
}

function buildTreeChoices(data: RaRecord[]): TreeChoice[] {
  const byId = new Map<string, RaRecord>();
  for (const item of data) {
    byId.set(item['@id'] ?? item.id, item);
  }

  const childrenByParent = new Map<string, RaRecord[]>();
  for (const item of data) {
    if (item.parent) {
      const key = item.parent as string;
      const list = childrenByParent.get(key) ?? [];
      list.push(item);
      childrenByParent.set(key, list);
    }
  }

  const idSet = new Set(data.map((r) => r['@id'] ?? r.id));
  const roots = data.filter((r) => !r.parent || !idSet.has(r.parent as string));

  const choices: TreeChoice[] = [];

  function walk(items: RaRecord[], depth: number) {
    for (const item of items) {
      choices.push({
        id: item['@id'] ?? item.id,
        name: item.taxonomyLabel ?? item.name ?? '',
        depth,
      });
      const kids = childrenByParent.get(item['@id'] ?? item.id) ?? [];
      if (kids.length > 0) {
        walk(kids, depth + 1);
      }
    }
  }

  walk(roots, 0);
  return choices;
}

function HierarchyOptionText() {
  const record = useRecordContext();
  if (!record) return null;
  const depth = (record.depth as number) ?? 0;

  if (depth === 0) {
    return <span>{record.name}</span>;
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        pl: depth * 1.5,
        color: 'text.secondary',
        fontSize: '0.875rem',
      }}
    >
      <Box component="span" sx={{ color: 'text.disabled' }}>{'—'}</Box>
      {record.name}
    </Box>
  );
}

function HierarchicalParentInput() {
  const { data, isLoading } = useGetList('genres', {
    pagination: { page: 1, perPage: 200 },
    sort: { field: 'taxonomyTermPosition', order: 'ASC' },
  });

  const choices = useMemo(() => buildTreeChoices(data ?? []), [data]);

  const inputText = useCallback(
    (choice: TreeChoice) => choice.name,
    [],
  );

  const matchSuggestion = useCallback(
    (filter: string, choice: TreeChoice) =>
      choice.name.toLowerCase().includes(filter.toLowerCase()),
    [],
  );

  return (
    <AutocompleteInput
      source="parent"
      choices={choices}
      optionText={<HierarchyOptionText />}
      optionValue="id"
      inputText={inputText}
      matchSuggestion={matchSuggestion}
      label="Parent"
      isLoading={isLoading}
    />
  );
}

function GenreFormFields() {
  return (
    <>
      <TextInput source="name" isRequired />
      <TextInput source="slug" isRequired />
      <HierarchicalParentInput />
      <NumberInput source="taxonomyTermPosition" label="Position" defaultValue={0} />
    </>
  );
}

export function GenreCreate() {
  return (
    <Create>
      <SimpleForm>
        <GenreFormFields />
      </SimpleForm>
    </Create>
  );
}

export function GenreEdit() {
  return (
    <Edit>
      <SimpleForm>
        <GenreFormFields />
      </SimpleForm>
    </Edit>
  );
}
