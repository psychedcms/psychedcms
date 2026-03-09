import {
  useResourceContext,
  TextInput,
  SelectInput,
  SelectArrayInput,
  AutocompleteInput,
  AutocompleteArrayInput,
  type InputProps,
} from 'react-admin';

import { useFieldMetadata } from '../../hooks/useFieldMetadata.ts';
import {
  getFieldTypeConfig,
  buildInputAdornments,
  buildSelectChoices,
} from '../../utils/fieldTypeMapping.tsx';
import { SlugInput } from './SlugInput.tsx';
import { TaxonomyInput } from './TaxonomyInput.tsx';
import { EntityTaxonomyInput } from './EntityTaxonomyInput.tsx';
import { ImageInput } from './ImageInput.tsx';
import { FileInput } from './FileInput.tsx';
import { ImageListInput } from './ImageListInput.tsx';
import { FileListInput } from './FileListInput.tsx';

interface PsychedInputGuesserProps extends Omit<InputProps, 'source'> {
  source: string;
  resource?: string;
}

/**
 * Input component guesser that selects the appropriate input based on
 * x-psychedcms field type metadata.
 *
 * - Maps field types to React Admin input components
 * - Passes through label, placeholder, helperText from metadata
 * - Applies required, readonly props
 * - Returns null for hidden type fields
 * - Falls back to TextInput for unknown types
 */
export function PsychedInputGuesser({
  source,
  resource: resourceProp,
  // Filter out MUI theme props that shouldn't reach DOM elements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  styleOverrides: _styleOverrides,
  ...props
}: PsychedInputGuesserProps & { styleOverrides?: unknown }) {
  const resourceFromContext = useResourceContext();
  const resource = resourceProp ?? resourceFromContext ?? '';

  const fieldMetadata = useFieldMetadata(resource, source);

  if (!fieldMetadata) {
    return <TextInput source={source} {...props} />;
  }

  if (fieldMetadata.type === 'hidden') {
    return null;
  }

  const { type, label, placeholder, info, required, readonly } = fieldMetadata;

  const baseProps: Record<string, unknown> = {
    source,
    label: label ?? undefined,
    helperText: info ?? undefined,
    placeholder: placeholder ?? undefined,
    isRequired: required ?? undefined,
    readOnly: readonly ?? undefined,
    ...props,
  };

  const adornmentProps = buildInputAdornments(fieldMetadata);
  if (adornmentProps) {
    Object.assign(baseProps, adornmentProps);
  }

  if (type === 'select') {
    const choices = buildSelectChoices(fieldMetadata.values);
    const { multiple, autocomplete } = fieldMetadata;

    if (multiple && autocomplete) {
      return <AutocompleteArrayInput {...baseProps} choices={choices} />;
    }
    if (multiple) {
      return <SelectArrayInput {...baseProps} choices={choices} />;
    }
    if (autocomplete) {
      return <AutocompleteInput {...baseProps} choices={choices} />;
    }
    return <SelectInput {...baseProps} choices={choices} />;
  }

  if (type === 'taxonomy') {
    return (
      <TaxonomyInput
        source={source}
        taxonomyType={fieldMetadata.taxonomy ?? ''}
        multiple={fieldMetadata.multiple ?? false}
        allowCreate={fieldMetadata.allowCreate ?? false}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
        isRequired={required ?? undefined}
      />
    );
  }

  if (type === 'entity_taxonomy') {
    return (
      <EntityTaxonomyInput
        source={source}
        reference={source}
        multiple={fieldMetadata.multiple ?? false}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
        isRequired={required ?? undefined}
      />
    );
  }

  if (type === 'image') {
    return (
      <ImageInput
        source={source}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
        isRequired={required ?? undefined}
      />
    );
  }

  if (type === 'file') {
    return (
      <FileInput
        source={source}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
        isRequired={required ?? undefined}
      />
    );
  }

  if (type === 'imagelist') {
    return (
      <ImageListInput
        source={source}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
        isRequired={required ?? undefined}
        min={fieldMetadata.min}
        max={fieldMetadata.max}
      />
    );
  }

  if (type === 'filelist') {
    return (
      <FileListInput
        source={source}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
        isRequired={required ?? undefined}
        min={fieldMetadata.min}
        max={fieldMetadata.max}
      />
    );
  }

  if (type === 'slug' && fieldMetadata.uses) {
    return (
      <SlugInput
        source={source}
        uses={fieldMetadata.uses}
        label={typeof label === 'string' ? label : undefined}
        helperText={typeof info === 'string' ? info : undefined}
      />
    );
  }

  const { component: Component, defaultProps } = getFieldTypeConfig(type);
  return <Component {...defaultProps} {...baseProps} />;
}
