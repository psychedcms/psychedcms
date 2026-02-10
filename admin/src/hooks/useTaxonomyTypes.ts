import { useMemo } from 'react';

import { usePsychedSchemaContext } from '../providers/PsychedSchemaContext.ts';

export interface GenericTaxonomyType {
  /** The `type` value stored in the taxonomies table (e.g. 'tags') */
  type: string;
  /** Human-readable label derived from type */
  label: string;
}

export interface EntityTaxonomyType {
  /** The API resource name (e.g. 'genres') */
  resource: string;
  /** Human-readable label derived from resource name */
  label: string;
}

export interface TaxonomyTypes {
  generic: GenericTaxonomyType[];
  entity: EntityTaxonomyType[];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Discovers all taxonomy types by scanning field metadata across all resources.
 *
 * - Fields with type `taxonomy` reference the `taxonomies` table with a specific `taxonomy` value.
 * - Fields with type `entity_taxonomy` reference a separate API resource (field name = resource name).
 */
export function useTaxonomyTypes(): TaxonomyTypes {
  const { schema } = usePsychedSchemaContext();

  return useMemo(() => {
    const genericSet = new Set<string>();
    const entitySet = new Set<string>();

    if (schema) {
      for (const resource of schema.resources.values()) {
        for (const [fieldName, meta] of resource.fields) {
          if (meta.type === 'taxonomy' && meta.taxonomy) {
            genericSet.add(meta.taxonomy);
          }
          if (meta.type === 'entity_taxonomy') {
            entitySet.add(fieldName);
          }
        }
      }
    }

    const generic = Array.from(genericSet)
      .sort()
      .map((type) => ({ type, label: capitalize(type) }));

    const entity = Array.from(entitySet)
      .sort()
      .map((resource) => ({ resource, label: capitalize(resource) }));

    return { generic, entity };
  }, [schema]);
}
