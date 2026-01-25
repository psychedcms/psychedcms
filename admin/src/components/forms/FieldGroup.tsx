import { PsychedInputGuesser } from '../inputs/PsychedInputGuesser.tsx';

interface FieldGroupProps {
  fields: string[];
  resource: string;
}

/**
 * Helper component that renders a group of fields within a tab.
 * Encapsulates field rendering to keep TabbedFormGuesser logic clean.
 */
export function FieldGroup({ fields, resource }: FieldGroupProps) {
  return (
    <>
      {fields.map((fieldName) => (
        <PsychedInputGuesser
          key={fieldName}
          source={fieldName}
          resource={resource}
        />
      ))}
    </>
  );
}
