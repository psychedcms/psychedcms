import { EditGuesser, type EditGuesserProps } from '@api-platform/admin';
import { useResourceContext } from 'react-admin';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { TabbedFormGuesser } from './TabbedFormGuesser.tsx';

/**
 * Custom Edit guesser that uses TabbedFormGuesser for resources
 * with x-psychedcms field metadata.
 *
 * Falls back to standard EditGuesser for resources without metadata.
 */
export function PsychedEditGuesser(props: EditGuesserProps) {
  const resource = useResourceContext();
  const resourceSchema = usePsychedSchema(resource ?? '');

  if (!resourceSchema || resourceSchema.fields.size === 0) {
    return <EditGuesser {...props} />;
  }

  return (
    <EditGuesser {...props}>
      <TabbedFormGuesser />
    </EditGuesser>
  );
}
