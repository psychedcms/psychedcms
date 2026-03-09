# Psyched CMS — MVP Roadmap (Replace Bolt CMS for Hilo)

## Goal

Replace Bolt CMS as Hilo's backend. Psyched CMS serves as a headless API; the Hilo frontend is a standalone app consuming endpoints.

## Architecture Principles

- **DDD-first, type-safe entities** — no EAV, each content type is a typed Doctrine entity
- **PHP Attributes for metadata** — field types, search indexing, relation hints all declared via attributes
- **Packages as Symfony bundles** — each feature area is a reusable `psychedcms-*` package
- **React Admin frontend** — auto-generated from OpenAPI `x-psychedcms` extensions
- **API Platform native** — typed entities exposed directly, no facade layer needed

---

## Phase 1: Core CMS Gaps

### 1.1 Media Management `psychedcms-media`
**Status:** Not started
**Depends on:** nothing

- `Media` entity (filename, mimeType, size, dimensions, altText, storagePath)
- `#[ImageField]`, `#[FileField]`, `#[ImageListField]`, `#[FileListField]` attributes
- Flysystem abstraction (local + S3/MinIO adapters)
- Upload API endpoint (multipart form data)
- Thumbnail generation service (crop, fit, resize)
- Upload path pattern: `{contenttype}/{year}/{month}/`
- File type validation (images, documents, video — configurable max size)
- Admin: `ImageInput`, `FileInput` components with upload + picker
- Admin: media browser/library component

### 1.2 Collection / Repeater Fields `psychedcms-core`
**Status:** Not started
**Depends on:** nothing

- `#[CollectionField(schema: ['platform' => 'text', 'url' => 'text'])]` attribute
- JSON column storage (Doctrine `json` type)
- Per-item schema validation via Symfony Validator
- OpenAPI `x-psychedcms` schema exposure for sub-fields
- Admin: `CollectionInput` component (add/remove/reorder rows)

### 1.3 Multi-Locale / Translations `psychedcms-core`
**Status:** Gedmo loaded but inactive
**Depends on:** nothing

- Activate Gedmo Translatable on entities using `translatable: true` field option
- `Accept-Language` header → locale-aware API responses
- Fallback to default locale when translation missing
- Admin: locale switcher, per-field translation editing UI

### 1.4 Relation UI Hints `psychedcms-core`
**Status:** Partial (TaxonomyInput exists)
**Depends on:** nothing

- `#[RelationField(label: 'Bands', searchable: true, createInline: true)]` attribute
- OpenAPI `x-psychedcms` extension for relation metadata
- Admin: `RelationInput` component (autocomplete, multi-select, inline create)
- Generalize existing `TaxonomyInput` / `EntityTaxonomyInput` pattern

### 1.5 Additional Field Types `psychedcms-core` + `psychedcms-media`
**Status:** Not started
**Depends on:** 1.1 (media fields), 1.2 (collection for structured data)

- `#[GeolocationField]` — JSON `{lat, lng, address}`, admin with map picker
- `#[JsonField]` — arbitrary JSON, admin code editor
- Image/File fields (from 1.1)

---

## Phase 2: Search & Shortcodes

### 2.1 Search Indexing `psychedcms-search`
**Status:** Not started
**Depends on:** nothing (but more valuable after Phase 1 entities exist)
**Reference:** maggie-v3 architecture

- `IndexableInterface` — `getId()`, `toSearchDocument(): array`
- `#[Indexed(index: 'posts')]` class-level attribute
- `#[IndexedField(type: 'text', boost: 3.0)]` property-level attribute
- `#[IndexedRelation(targetEntity: Band::class)]` for related data
- `IndexMetadataReader` — reflection-based mapping builder
- `IndexableEntityRegistry` — auto-discovery of indexable entities
- `IndexManager` — ES index creation, bulk document ops
- `SearchService` — full-text search, fuzzy matching, boosting, multi-index
- Doctrine event listener → Messenger async indexing
- `IndexDocumentHandler` — message handler
- Doctrine ILIKE fallback when ES unavailable
- CLI: `search:create-indices`, `search:reindex`, `search:delete-indices`
- API: `GET /api/search?q=...&type=...`, `GET /api/autocomplete?q=...`

### 2.2 Content Link Shortcodes `psychedcms-shortcode`
**Status:** Not started
**Depends on:** 2.1 (search for autocomplete + label resolution)

- Syntax: `[[type:slug]]`, `[[type:slug|label]]`, `[[type:slug|label|alt]]`
- `ShortcodeParser` — regex parser for HTML fields
- `ShortcodeNormalizer` — serializer normalizer, adds `contentLinks[]` to API response
- `ShortcodeLabelResolver` — batch label resolution via Elasticsearch
- Admin: TipTap plugin detecting `[[` trigger, autocomplete dropdown
- API: `GET /api/shortcode-autocomplete?q=...&type=...`

---

## Phase 3: Hilo Domain Modules

### 3.1 Timetable Module `psychedcms-timetable`
**Status:** Not started — port from Bolt
**Depends on:** 1.1 (indirectly, for full event entities), 1.2 (stages stored as collection)

- `Set` entity: start, end, stage, relations to Event + Band
- API endpoints (9 routes): sets CRUD, band search, conflict check, stage/settings management
- `SetService` — conflict detection, band association
- React component: drag-and-drop timetable grid (~2,250 lines JS → React)
- Set popup modal, settings modal, day tabs
- Key: 5-min granularity, 60px/hour, 8am-8am day boundary

### 3.2 Event Module `psychedcms-event`
**Status:** Not started — port from Bolt
**Depends on:** 3.1 (timetable for sets)

- `DayReport` entity: eventReportId, date, content, status, publishedAt
- `EventDayService`: day computation, 8am-8am boundary, lazy DayReport init
- Day reports controller (AJAX load/save)
- Set reports controller (CRUD for per-band reviews)
- Filtered list controller (parent→child navigation)
- Admin components: day reports editor, set reports manager, main band selector
- Progressive publishing (each day independent status)

---

## Phase 4: Optional / Post-MVP

### 4.1 Admin Enhancements
- Bulk operations (select + action)
- Activity/system logs viewer
- Content duplication
- Content preview

### 4.2 Data Migration Tooling
- Bolt EAV → Psyched typed entities migration scripts
- Media file migration (local → MinIO)
- Relationship/taxonomy preservation
- Translation migration

---

## Package Map

```
packages/
├── psychedcms-core/          # Existing — add: CollectionField, RelationField, translations, GeolocationField, JsonField
├── psychedcms-workflow/       # Existing — complete
├── psychedcms-taxonomy/       # Existing — complete
├── psychedcms-calendar/       # Existing — complete
├── psychedcms-media/          # NEW — media management
├── psychedcms-search/         # NEW — elasticsearch indexing (maggie-v3 arch)
├── psychedcms-shortcode/      # NEW — content link shortcodes
├── psychedcms-timetable/      # NEW — timetable plugin (port from Bolt)
└── psychedcms-event/          # NEW — event module plugin (port from Bolt)
```

## Build Order

```
1.1 Media ──────────┐
1.2 Collection ─────┤
1.3 Translations ───┼──→ 1.5 Extra fields ──→ 2.1 Search ──→ 2.2 Shortcodes ──→ 3.1 Timetable ──→ 3.2 Event
1.4 Relation hints ─┘
```

Items 1.1–1.4 can be worked on in parallel. 1.5 depends on 1.1+1.2. The rest is sequential.
