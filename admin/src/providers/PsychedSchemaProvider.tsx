import { useEffect, useState, type ReactNode } from 'react';

import type { OpenApiDocument, PsychedSchema } from '../types/psychedcms.ts';
import { parseOpenApiExtensions } from '../utils/parseOpenApiExtensions.ts';
import { PsychedSchemaContext } from './PsychedSchemaContext.ts';

interface PsychedSchemaProviderProps {
  entrypoint: string;
  children: ReactNode;
}

/**
 * Provider that fetches and parses OpenAPI schema with x-psychedcms extensions.
 * Wraps HydraAdmin to make schema data available via context.
 */
export function PsychedSchemaProvider({
  entrypoint,
  children,
}: PsychedSchemaProviderProps) {
  const [schema, setSchema] = useState<PsychedSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchema() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${entrypoint}/docs.json`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch OpenAPI schema: ${response.status} ${response.statusText}`
          );
        }

        const openApiDoc: OpenApiDocument = await response.json();

        if (!cancelled) {
          const parsedSchema = parseOpenApiExtensions(openApiDoc);
          setSchema(parsedSchema);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Unknown error occurred')
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSchema();

    return () => {
      cancelled = true;
    };
  }, [entrypoint]);

  return (
    <PsychedSchemaContext.Provider value={{ schema, loading, error }}>
      {children}
    </PsychedSchemaContext.Provider>
  );
}
