import type {
  ContentTypeMetadata,
  FieldMetadata,
  OpenApiDocument,
  PsychedSchema,
  ResourceSchema,
} from '../types/psychedcms.ts';

/**
 * Derive a resource name from an OpenAPI schema name.
 * Examples:
 *   - "Post.jsonld" -> "posts"
 *   - "User.jsonld" -> "users"
 *   - "Post" -> "posts"
 */
function deriveResourceName(schemaName: string): string {
  // Remove common suffixes like ".jsonld", ".json", "-input", "-output"
  let baseName = schemaName
    .replace(/\.jsonld$/i, '')
    .replace(/\.json$/i, '')
    .replace(/-input$/i, '')
    .replace(/-output$/i, '')
    .replace(/-read$/i, '')
    .replace(/-write$/i, '');

  // Convert PascalCase to lowercase plural
  // Add space before uppercase letters, then lowercase and remove spaces
  baseName = baseName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  // Simple pluralization: add 's' if not already plural
  if (!baseName.endsWith('s')) {
    baseName = baseName + 's';
  }

  return baseName;
}

/**
 * Check if a schema name represents a primary resource schema.
 * We want to skip collection schemas, input/output variants, etc.
 */
function isPrimarySchema(schemaName: string): boolean {
  // Primary schemas typically end with .jsonld or have no suffix
  // Skip schemas ending with:
  // - .jsonld_* (collection variants)
  // - _input, _output
  // - -read, -write
  const skipPatterns = [
    /_collection$/i,
    /\.jsonld_/i,
    /-input$/i,
    /-output$/i,
    /-read$/i,
    /-write$/i,
  ];

  return !skipPatterns.some((pattern) => pattern.test(schemaName));
}

/**
 * Extract properties from a schema, handling allOf structures.
 */
function extractProperties(
  schema: Record<string, unknown>
): Record<string, Record<string, unknown>> {
  // Direct properties
  if (schema.properties) {
    return schema.properties as Record<string, Record<string, unknown>>;
  }

  // Handle allOf - merge properties from all schemas
  if (Array.isArray(schema.allOf)) {
    const merged: Record<string, Record<string, unknown>> = {};

    for (const subSchema of schema.allOf) {
      if (typeof subSchema === 'object' && subSchema !== null) {
        const subProps = (subSchema as Record<string, unknown>)
          .properties as Record<string, Record<string, unknown>> | undefined;

        if (subProps) {
          Object.assign(merged, subProps);
        }
      }
    }

    return merged;
  }

  return {};
}

/**
 * Extract x-psychedcms from schema level, handling allOf structures.
 */
function extractContentType(
  schema: Record<string, unknown>
): ContentTypeMetadata | null {
  // Direct x-psychedcms
  if (schema['x-psychedcms']) {
    return schema['x-psychedcms'] as ContentTypeMetadata;
  }

  // Handle allOf - look in each subschema
  if (Array.isArray(schema.allOf)) {
    for (const subSchema of schema.allOf) {
      if (
        typeof subSchema === 'object' &&
        subSchema !== null &&
        (subSchema as Record<string, unknown>)['x-psychedcms']
      ) {
        return (subSchema as Record<string, unknown>)[
          'x-psychedcms'
        ] as ContentTypeMetadata;
      }
    }
  }

  return null;
}

/**
 * Parse OpenAPI extensions from an OpenAPI document.
 * Extracts x-psychedcms metadata from both schema and property levels.
 */
export function parseOpenApiExtensions(
  openApiDoc: OpenApiDocument
): PsychedSchema {
  const resources = new Map<string, ResourceSchema>();

  const schemas = openApiDoc.components?.schemas ?? {};

  for (const [schemaName, schema] of Object.entries(schemas)) {
    // Skip non-primary schemas
    if (!isPrimarySchema(schemaName)) {
      continue;
    }

    const resourceName = deriveResourceName(schemaName);

    // Skip if we already have this resource (prefer first occurrence)
    if (resources.has(resourceName)) {
      continue;
    }

    // Extract ContentType from schema-level x-psychedcms (handles allOf)
    const contentType = extractContentType(schema);

    // Extract field metadata from property-level x-psychedcms (handles allOf)
    const fields = new Map<string, FieldMetadata>();
    const properties = extractProperties(schema);

    for (const [propName, propSchema] of Object.entries(properties)) {
      if (propSchema['x-psychedcms']) {
        fields.set(propName, propSchema['x-psychedcms'] as FieldMetadata);
      }
    }

    resources.set(resourceName, {
      name: resourceName,
      contentType,
      fields,
    });
  }

  return { resources };
}
