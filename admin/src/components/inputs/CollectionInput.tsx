import { useInput, useTranslate } from 'react-admin';
import { useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type SubFieldSchema = string | { type: string; values?: string[] | Record<string, string> };

interface CollectionInputProps {
  source: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  schema?: Record<string, SubFieldSchema>;
  min?: number;
  max?: number;
  sortable?: boolean;
}

interface CollectionItem {
  [key: string]: unknown;
}

function normalizeSchema(schema: Record<string, SubFieldSchema>): Record<string, { type: string; values?: string[] | Record<string, string> }> {
  const normalized: Record<string, { type: string; values?: string[] | Record<string, string> }> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === 'string') {
      normalized[key] = { type: value };
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}

function createEmptyItem(schema: Record<string, { type: string; values?: string[] | Record<string, string> }>): CollectionItem {
  const item: CollectionItem = {};
  for (const [key, fieldDef] of Object.entries(schema)) {
    switch (fieldDef.type) {
      case 'checkbox':
        item[key] = false;
        break;
      case 'number':
        item[key] = null;
        break;
      default:
        item[key] = '';
        break;
    }
  }
  return item;
}

function SubFieldInput({
  fieldKey,
  fieldDef,
  value,
  onChange,
}: {
  fieldKey: string;
  fieldDef: { type: string; values?: string[] | Record<string, string> };
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/_/g, ' ');

  switch (fieldDef.type) {
    case 'select': {
      const choices = fieldDef.values
        ? Array.isArray(fieldDef.values)
          ? fieldDef.values.map((v) => ({ id: v, label: v }))
          : Object.entries(fieldDef.values).map(([id, name]) => ({ id, label: name }))
        : [];
      return (
        <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={(value as string) ?? ''}
            label={label}
            onChange={(e) => onChange(e.target.value)}
          >
            {choices.map((choice) => (
              <MenuItem key={choice.id} value={choice.id}>
                {choice.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              size="small"
            />
          }
          label={label}
        />
      );
    case 'number':
      return (
        <TextField
          label={label}
          type="number"
          size="small"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          sx={{ flex: 1 }}
        />
      );
    case 'date':
      return (
        <TextField
          label={label}
          type="date"
          size="small"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1 }}
        />
      );
    case 'email':
      return (
        <TextField
          label={label}
          type="email"
          size="small"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          sx={{ flex: 1 }}
        />
      );
    default:
      return (
        <TextField
          label={label}
          size="small"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          sx={{ flex: 1 }}
        />
      );
  }
}

export function CollectionInput({
  source,
  label,
  helperText,
  isRequired,
  schema: rawSchema,
  min = 0,
  max = 0,
  sortable = true,
}: CollectionInputProps) {
  const translate = useTranslate();
  const {
    field,
    fieldState: { error },
  } = useInput({ source });

  const schema = rawSchema ? normalizeSchema(rawSchema) : {};
  const items: CollectionItem[] = Array.isArray(field.value) ? field.value : [];
  const canAdd = max === 0 || items.length < max;
  const canRemove = items.length > min;

  const updateItems = useCallback(
    (newItems: CollectionItem[]) => {
      field.onChange(newItems);
    },
    [field],
  );

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    updateItems([...items, createEmptyItem(schema)]);
  }, [canAdd, items, schema, updateItems]);

  const handleRemove = useCallback(
    (index: number) => {
      if (!canRemove) return;
      updateItems(items.filter((_, i) => i !== index));
    },
    [canRemove, items, updateItems],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      updateItems(newItems);
    },
    [items, updateItems],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= items.length - 1) return;
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      updateItems(newItems);
    },
    [items, updateItems],
  );

  const handleFieldChange = useCallback(
    (index: number, fieldKey: string, value: unknown) => {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, [fieldKey]: value } : item,
      );
      updateItems(newItems);
    },
    [items, updateItems],
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
        {label ?? source}
        {isRequired && ' *'}
        {(min > 0 || max > 0) && ` (${min}–${max || '∞'})`}
      </Typography>

      {items.map((item, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, '&:last-child': { pb: 1 } }}>
            {Object.entries(schema).map(([fieldKey, fieldDef]) => (
              <SubFieldInput
                key={fieldKey}
                fieldKey={fieldKey}
                fieldDef={fieldDef}
                value={item[fieldKey]}
                onChange={(value) => handleFieldChange(index, fieldKey, value)}
              />
            ))}
            <Box sx={{ display: 'flex', flexShrink: 0 }}>
              {sortable && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= items.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </>
              )}
              <IconButton
                size="small"
                onClick={() => handleRemove(index)}
                disabled={!canRemove}
                color="error"
                aria-label="Remove item"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={!canAdd}
      >
        {translate('ra.action.add', { _: 'Add' })}
      </Button>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {error.message}
        </Typography>
      )}
      {helperText && !error && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
