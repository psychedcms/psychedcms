import { useMemo } from 'react';

import { usePsychedSchemaContext } from '../providers/PsychedSchemaProvider.tsx';
import type { ResourceSchema } from '../types/psychedcms.ts';

/**
 * Hook to get all resources that have ContentType metadata.
 * Used by menu to separate Content resources from Admin resources.
 * Returns an empty array if schema is not loaded.
 */
export function useContentTypes(): ResourceSchema[] {
  const { schema } = usePsychedSchemaContext();

  return useMemo(() => {
    if (!schema) {
      return [];
    }

    return Array.from(schema.resources.values()).filter(
      (resource) => resource.contentType !== null
    );
  }, [schema]);
}
