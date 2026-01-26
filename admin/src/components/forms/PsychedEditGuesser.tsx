import { EditGuesser, type EditGuesserProps } from '@api-platform/admin';
import { Edit, useResourceContext } from 'react-admin';
import { Box } from '@mui/material';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { ContentForm } from './ContentForm.tsx';

/**
 * Custom Edit guesser that uses ContentForm with two-column layout
 * for resources with x-psychedcms field metadata.
 *
 * Falls back to standard EditGuesser for resources without metadata.
 */
export function PsychedEditGuesser(props: EditGuesserProps) {
  const resource = useResourceContext();
  const resourceSchema = usePsychedSchema(resource ?? '');

  if (!resourceSchema || resourceSchema.fields.size === 0) {
    return <EditGuesser {...props} />;
  }
  // Use Edit with Box component instead of Card to remove background
  return (
    <Edit {...props} actions={false} component={Box} sx={{ bgcolor: 'transparent' }}>
      <ContentForm />
    </Edit>
  );
}
