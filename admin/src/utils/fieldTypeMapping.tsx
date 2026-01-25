import type { ComponentType, ReactElement } from 'react';
import {
  TextInput,
  BooleanInput,
  DateInput,
  NumberInput,
  SelectInput,
  AutocompleteInput,
  SelectArrayInput,
  AutocompleteArrayInput,
} from 'react-admin';
import { InputAdornment } from '@mui/material';

import type { FieldType, FieldMetadata } from '../types/psychedcms.ts';
import { HtmlInput } from '../components/inputs/HtmlInput.tsx';
import { MarkdownInput } from '../components/inputs/MarkdownInput.tsx';
import { SlugInput } from '../components/inputs/SlugInput.tsx';

/**
 * Configuration for a field type mapping.
 */
export interface FieldTypeConfig {
  component: ComponentType<Record<string, unknown>>;
  defaultProps?: Record<string, unknown>;
}

/**
 * Map of field types to their React Admin input components.
 */
const fieldTypeMappings: Record<FieldType, FieldTypeConfig> = {
  text: {
    component: TextInput,
  },
  textarea: {
    component: TextInput,
    defaultProps: {
      multiline: true,
      rows: 4,
    },
  },
  html: {
    component: HtmlInput as ComponentType<Record<string, unknown>>,
  },
  markdown: {
    component: MarkdownInput as ComponentType<Record<string, unknown>>,
  },
  number: {
    component: NumberInput,
  },
  checkbox: {
    component: BooleanInput,
  },
  date: {
    component: DateInput,
  },
  email: {
    component: TextInput,
    defaultProps: {
      type: 'email',
    },
  },
  select: {
    component: SelectInput,
  },
  slug: {
    component: SlugInput as ComponentType<Record<string, unknown>>,
  },
  hidden: {
    component: () => null,
  },
  field: {
    component: TextInput,
  },
};

/**
 * Get the input component configuration for a field type.
 */
export function getFieldTypeConfig(type: FieldType): FieldTypeConfig {
  return fieldTypeMappings[type] || fieldTypeMappings.text;
}

/**
 * Build InputProps with prefix/postfix adornments from field metadata.
 */
export function buildInputAdornments(
  metadata: FieldMetadata
): Record<string, unknown> | undefined {
  const { prefix, postfix } = metadata;

  if (!prefix && !postfix) {
    return undefined;
  }

  const InputProps: {
    startAdornment?: ReactElement;
    endAdornment?: ReactElement;
  } = {};

  if (prefix) {
    InputProps.startAdornment = (
      <InputAdornment position="start">{prefix}</InputAdornment>
    ) as ReactElement;
  }

  if (postfix) {
    InputProps.endAdornment = (
      <InputAdornment position="end">{postfix}</InputAdornment>
    ) as ReactElement;
  }

  return { InputProps };
}

/**
 * Build select input choices from field metadata values.
 */
export function buildSelectChoices(
  values: string[] | Record<string, string> | undefined
): { id: string; name: string }[] {
  if (!values) {
    return [];
  }

  if (Array.isArray(values)) {
    return values.map((value) => ({ id: value, name: value }));
  }

  return Object.entries(values).map(([id, name]) => ({ id, name }));
}

/**
 * Get the appropriate select component based on field metadata.
 */
export function getSelectComponent(
  metadata: FieldMetadata
): ComponentType<Record<string, unknown>> {
  const { multiple, autocomplete } = metadata;

  if (multiple) {
    return autocomplete
      ? (AutocompleteArrayInput as ComponentType<Record<string, unknown>>)
      : (SelectArrayInput as ComponentType<Record<string, unknown>>);
  }

  return autocomplete
    ? (AutocompleteInput as ComponentType<Record<string, unknown>>)
    : (SelectInput as ComponentType<Record<string, unknown>>);
}
