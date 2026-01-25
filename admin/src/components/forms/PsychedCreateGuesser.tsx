import { CreateGuesser, type CreateGuesserProps } from '@api-platform/admin';
import { useResourceContext } from 'react-admin';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { TabbedFormGuesser } from './TabbedFormGuesser.tsx';

/**
 * Custom Create guesser that uses TabbedFormGuesser for resources
 * with x-psychedcms field metadata.
 *
 * Falls back to standard CreateGuesser for resources without metadata.
 */
export function PsychedCreateGuesser(props: CreateGuesserProps) {
  const resource = useResourceContext();
  const resourceSchema = usePsychedSchema(resource ?? '');

  if (!resourceSchema || resourceSchema.fields.size === 0) {
    return <CreateGuesser {...props} />;
  }

  return (
    <CreateGuesser {...props}>
      <TabbedFormGuesser />
    </CreateGuesser>
  );
}
