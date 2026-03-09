import { EditGuesser, type EditGuesserProps } from '@api-platform/admin';
import { Edit, useResourceContext } from 'react-admin';
import { Box } from '@mui/material';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { ContentForm } from './ContentForm.tsx';

/**
 * Keys that should be stripped from PATCH payloads.
 * These are read-only or Hydra metadata fields that the API rejects.
 */
const STRIP_KEYS = new Set([
  '@context', '@id', '@type', 'id', 'originId',
  'createdAt', 'updatedAt',
]);

/**
 * Normalize form data before sending to the API.
 * - Strips read-only and Hydra metadata fields
 * - Converts nested objects with @id back to IRI strings (the Hydra data
 *   provider resolves IRIs to objects on GET, but the API expects IRI strings)
 */
function normalizeForPatch(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (STRIP_KEYS.has(key)) continue;

    if (value && typeof value === 'object' && !Array.isArray(value) && '@id' in value) {
      normalized[key] = (value as { '@id': string })['@id'];
    } else if (Array.isArray(value)) {
      normalized[key] = value.map((item) =>
        item && typeof item === 'object' && '@id' in item ? item['@id'] : item,
      );
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

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
    <Edit {...props} actions={false} component={Box} sx={{ bgcolor: 'transparent' }} transform={normalizeForPatch}>
      <ContentForm />
    </Edit>
  );
}
