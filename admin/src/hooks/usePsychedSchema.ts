import { usePsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';
import type { ResourceSchema } from '../types/psychedcms.ts';

/**
 * Hook to access the full ResourceSchema for a specific resource.
 * Returns null if the resource is not found or schema is not loaded.
 */
export function usePsychedSchema(resourceName: string): ResourceSchema | null {
  const { schema } = usePsychedSchemaContext();

  if (!schema) {
    console.log('[usePsychedSchema] Schema not loaded yet');
    return null;
  }

  // Debug: show available resources
  console.log('[usePsychedSchema] Looking for:', resourceName);
  console.log('[usePsychedSchema] Available resources:', Array.from(schema.resources.keys()));

  return schema.resources.get(resourceName) ?? null;
}
