import {
  useGetList,
  useInput,
} from 'react-admin';
import type { RaRecord } from 'react-admin';
import { useMemo, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Checkbox,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

interface EntityTaxonomyInputProps {
  source: string;
  reference: string;
  multiple?: boolean;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
}

interface TreeChoice {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
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

  if (childrenByParent.size === 0) {
    return data.map((item) => ({
      id: item['@id'] ?? item.id,
      name: item.taxonomyLabel ?? item.name ?? '',
      depth: 0,
      parentId: null,
    }));
  }

  const choices: TreeChoice[] = [];

  function walk(items: RaRecord[], depth: number) {
    for (const item of items) {
      choices.push({
        id: item['@id'] ?? item.id,
        name: item.taxonomyLabel ?? item.name ?? '',
        depth,
        parentId: (item.parent as string) ?? null,
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

function getAncestorIds(choiceId: string, choicesById: Map<string, TreeChoice>): Set<string> {
  const ancestors = new Set<string>();
  let current = choicesById.get(choiceId);
  while (current?.parentId) {
    ancestors.add(current.parentId);
    current = choicesById.get(current.parentId);
  }
  return ancestors;
}

export function EntityTaxonomyInput({
  source,
  reference,
  multiple = false,
  label,
  helperText,
  isRequired,
}: EntityTaxonomyInputProps) {
  const { data, isLoading } = useGetList(reference, {
    pagination: { page: 1, perPage: 200 },
    sort: { field: 'taxonomyTermPosition', order: 'ASC' },
  });

  const choices = useMemo(() => buildTreeChoices(data ?? []), [data]);
  const choicesById = useMemo(
    () => new Map(choices.map((c) => [c.id, c])),
    [choices],
  );

  const {
    field,
    fieldState: { error },
  } = useInput({ source });

  const selectedIds = useMemo(() => {
    const val = field.value;
    if (!val) return new Set<string>();
    if (Array.isArray(val)) return new Set<string>(val);
    return new Set<string>([val]);
  }, [field.value]);

  const impliedParentIds = useMemo(() => {
    const parents = new Set<string>();
    for (const id of selectedIds) {
      for (const ancestorId of getAncestorIds(id, choicesById)) {
        if (!selectedIds.has(ancestorId)) {
          parents.add(ancestorId);
        }
      }
    }
    return parents;
  }, [selectedIds, choicesById]);

  const selectedChoices = useMemo(
    () => choices.filter((c) => selectedIds.has(c.id)),
    [choices, selectedIds],
  );

  const handleChange = useCallback(
    (_: unknown, newValue: TreeChoice | TreeChoice[] | null) => {
      if (multiple) {
        field.onChange((newValue as TreeChoice[]).map((c) => c.id));
      } else {
        field.onChange(newValue ? (newValue as TreeChoice).id : null);
      }
    },
    [field, multiple],
  );

  if (multiple) {
    return (
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={choices}
        value={selectedChoices}
        onChange={handleChange}
        loading={isLoading}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={({ key, ...props }, option) => {
          const isSelected = selectedIds.has(option.id);
          const isImpliedParent = impliedParentIds.has(option.id);

          return (
            <li key={key} {...props} style={{ ...props.style, opacity: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: option.depth * 2 }}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  indeterminateIcon={<IndeterminateCheckBoxIcon fontSize="small" />}
                  checked={isSelected}
                  indeterminate={isImpliedParent}
                  sx={{ mr: 1, p: 0, ...(isImpliedParent ? { color: 'text.disabled' } : {}) }}
                />
                <Box
                  component="span"
                  sx={{
                    color: option.depth > 0 && !isSelected && !isImpliedParent ? 'text.secondary' : 'text.primary',
                    ...(isSelected ? { fontWeight: 500 } : {}),
                    ...(isImpliedParent ? { fontStyle: 'italic', color: 'text.disabled' } : {}),
                  }}
                >
                  {option.depth > 0 && (
                    <Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>{'—'}</Box>
                  )}
                  {option.name}
                </Box>
              </Box>
            </li>
          );
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip key={key} label={option.name} size="small" {...tagProps} />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            helperText={error?.message ?? helperText}
            error={!!error}
            required={isRequired}
            variant="filled"
            size="small"
          />
        )}
      />
    );
  }

  const selectedChoice = choices.find((c) => selectedIds.has(c.id)) ?? null;

  return (
    <Autocomplete
      options={choices}
      value={selectedChoice}
      onChange={handleChange}
      loading={isLoading}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ pl: option.depth * 2 }}>
            {option.depth > 0 && (
              <Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>{'—'}</Box>
            )}
            {option.name}
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={error?.message ?? helperText}
          error={!!error}
          required={isRequired}
          variant="filled"
          size="small"
        />
      )}
    />
  );
}
