/**
 * Type definitions for x-psychedcms OpenAPI extensions.
 * These types mirror the PHP attribute class toSchemaArray() output structures.
 */

/**
 * ContentType metadata attached at the schema root level.
 * Mirrors PHP ContentType::toSchemaArray() output.
 */
export interface ContentTypeMetadata {
  name: string;
  singularName: string;
  slug: string;
  singularSlug: string;
  icon: string | null;
  showOnDashboard: boolean;
  defaultStatus: string;
  searchable: boolean;
  singleton: boolean;
  locales: string[];
}

/**
 * Union type for all supported field types.
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'html'
  | 'markdown'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'email'
  | 'select'
  | 'slug'
  | 'hidden'
  | 'taxonomy'
  | 'entity_taxonomy'
  | 'field';

/**
 * Field metadata attached at the property level.
 * Mirrors PHP FieldAttribute::toSchemaArray() output with extended types.
 */
export interface FieldMetadata {
  type: FieldType;
  label?: string;
  group?: string;
  placeholder?: string;
  info?: string;
  prefix?: string;
  postfix?: string;
  separator?: boolean;
  class?: string;
  default?: unknown;
  required?: boolean;
  readonly?: boolean;
  pattern?: string;
  index?: boolean;
  searchable?: boolean;
  translatable?: boolean;
  sanitise?: boolean;
  allowHtml?: boolean;
  // SelectField extras
  values?: string[] | Record<string, string>;
  multiple?: boolean;
  sortable?: boolean;
  autocomplete?: boolean;
  limit?: number;
  sort?: 'asc' | 'desc';
  // SlugField extras
  uses?: string | string[];
  allowNumeric?: boolean;
  // TaxonomyField extras
  taxonomy?: string;
  allowCreate?: boolean;
  min?: number;
  max?: number;
  // EntityTaxonomyField extras
  order?: string;
  filter?: string;
}

/**
 * Schema for a single resource including its ContentType and field metadata.
 */
export interface ResourceSchema {
  name: string;
  contentType: ContentTypeMetadata | null;
  fields: Map<string, FieldMetadata>;
}

/**
 * Parsed OpenAPI schema containing all resources with x-psychedcms extensions.
 */
export interface PsychedSchema {
  resources: Map<string, ResourceSchema>;
}

/**
 * OpenAPI document types for parsing.
 */
export interface OpenApiProperty {
  type?: string;
  format?: string;
  description?: string;
  'x-psychedcms'?: FieldMetadata;
  [key: string]: unknown;
}

export interface OpenApiSchema {
  type?: string;
  properties?: Record<string, OpenApiProperty>;
  'x-psychedcms'?: ContentTypeMetadata;
  [key: string]: unknown;
}

export interface OpenApiComponents {
  schemas?: Record<string, OpenApiSchema>;
}

export interface OpenApiDocument {
  openapi?: string;
  info?: Record<string, unknown>;
  components?: OpenApiComponents;
  [key: string]: unknown;
}

/**
 * Workflow state returned from the API.
 */
export interface WorkflowState {
  place: string;
  available_transitions: string[];
}

/**
 * Workflow transition metadata for UI display.
 */
export interface TransitionMeta {
  name: string;
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon?: string;
}
