import { useRef, useCallback } from 'react';
import { EditGuesser, type EditGuesserProps } from '@api-platform/admin';
import { Edit, useResourceContext, useNotify } from 'react-admin';
import { Box } from '@mui/material';

import { usePsychedSchema } from '../../hooks/usePsychedSchema.ts';
import { getCurrentEditLocale } from '../../providers/EditLocaleContext.tsx';
import { ContentForm } from './ContentForm.tsx';
import type { TranslatableSaveHandle } from './TranslatableFormManager.tsx';

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
 * Save translatable fields for non-active locales via direct PATCH calls.
 */
async function saveOtherLocales(
  recordIri: string,
  handle: TranslatableSaveHandle,
  activeLocale: string,
): Promise<void> {
  const allContents = handle.getAllLocaleContents();
  const origin = new URL(entrypoint).origin;
  const url = `${origin}${recordIri}`;

  for (const loc of handle.locales) {
    if (loc === activeLocale) continue;

    const content = allContents[loc];
    if (!content) continue;

    // Only send translatable fields that have content
    const payload: Record<string, unknown> = {};
    for (const field of handle.translatableFields) {
      if (content[field] !== undefined) {
        payload[field] = content[field];
      }
    }

    if (Object.keys(payload).length === 0) continue;

    await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json',
        'Accept-Language': loc,
      },
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Custom Edit guesser that uses ContentForm with two-column layout
 * for resources with x-psychedcms field metadata.
 *
 * Handles multi-locale save: the main save persists the active locale,
 * then onSuccess saves all other locales via direct PATCH calls.
 */
export function PsychedEditGuesser(props: EditGuesserProps) {
  const resource = useResourceContext();
  const resourceSchema = usePsychedSchema(resource ?? '');
  const notify = useNotify();
  const translatableSaveRef = useRef<TranslatableSaveHandle | null>(null);

  const mutationOptions = useCallback(() => ({
    onSuccess: async (data: { '@id'?: string; id?: string | number }) => {
      const handle = translatableSaveRef.current;
      if (!handle || handle.locales.length <= 1) return;

      const iri = data['@id'];
      if (!iri) return;

      try {
        await saveOtherLocales(iri, handle, getCurrentEditLocale());
      } catch {
        notify('Some translations could not be saved', { type: 'warning' });
      }
    },
  }), [notify]);

  if (!resourceSchema || resourceSchema.fields.size === 0) {
    return <EditGuesser {...props} />;
  }

  return (
    <Edit
      {...props}
      actions={false}
      component={Box}
      sx={{ bgcolor: 'transparent' }}
      transform={normalizeForPatch}
      mutationMode="pessimistic"
      mutationOptions={mutationOptions()}
    >
      <ContentForm translatableSaveRef={translatableSaveRef} />
    </Edit>
  );
}
