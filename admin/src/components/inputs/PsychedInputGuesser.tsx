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
  ...props
}: PsychedInputGuesserProps) {
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
