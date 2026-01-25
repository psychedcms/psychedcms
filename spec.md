# PsychedCMS - Specification

## Overview

**PsychedCMS** is a Symfony-based headless CMS that replaces the traditional EAV (Entity-Attribute-Value) pattern with standard Doctrine entity mappings, providing type-safe content management through PHP attributes.

### Vision

Content types are independent PHP entities using a shared `ContentTrait` for common behavior. Each content type maps to its own database table with explicit columns. Fields are defined via custom attributes that serve both as Doctrine mapping hints and admin UI metadata. The system is fully introspectable, enabling auto-generated admin interfaces while allowing customization when needed.

### Why Not EAV?

| EAV (Bolt) | Concrete Tables (PsychedCMS) |
|------------|------------------------------|
| Runtime flexibility (YAML config) | Compile-time type safety |
| Complex queries with many JOINs | Simple, fast queries |
| Generic field storage | Proper column types & indexes |
| No IDE autocompletion | Full IDE support |
| Schema changes without migrations | Migrations required |

The trade-off is intentional: developers gain type safety, performance, and tooling support in exchange for running migrations when content types change.

### DDD-First Philosophy

Traditional CMS architecture puts content at the center - everything is a "Content" with fields attached. PsychedCMS inverts this:

**Your domain entities are first-class citizens. Content management is an aspect you apply to them.**

```php
// This is YOUR domain entity - it models YOUR business
#[ORM\Entity]
class Festival
{
    private string $name;
    private \DateTimeImmutable $startDate;
    private \DateTimeImmutable $endDate;
    private Collection $lineUp;      // Domain relation
    private Venue $venue;            // Domain relation

    public function isOngoing(): bool { /* domain logic */ }
    public function addBandToLineup(Band $band): void { /* domain logic */ }
}

// Now add CMS capabilities as an ASPECT
#[ORM\Entity]
#[ContentType(name: 'Festivals')]           // CMS aspect: makes it manageable
class Festival implements ContentInterface   // CMS aspect: common interface
{
    use ContentTrait;                        // CMS aspect: slug, status, timestamps

    #[TextField(label: 'Festival Name')]     // CMS aspect: admin UI hint
    private string $name;

    // ... your domain stays clean
}
```

This means:
- **Domain logic lives in your entities** - not squeezed into CMS hooks
- **Repositories are standard Doctrine** - query your domain, not a generic content table
- **Services operate on typed entities** - `FestivalService::publish(Festival $festival)`
- **CMS is opt-in per entity** - not everything needs to be "content"
- **Testing is straightforward** - unit test your domain without CMS overhead

The `ContentTrait` and field attributes are purely additive. Remove them and you have a standard Symfony/Doctrine application. Keep them and you get an auto-generated admin, publishing workflow, and API introspection for free.

### Target Users

- Symfony developers who need CMS capabilities without sacrificing type safety
- Teams migrating from Bolt CMS who need more flexibility
- Projects requiring headless CMS with strong API-first approach

---

## Architecture

### Package Structure

**Composer packages (PHP/Symfony bundles):**
```
psyched/psyched-cms-core                # Core bundle - content type kernel
psyched/psyched-cms-seo                 # SEO fields and metadata
psyched/psyched-cms-media               # Media management (Flysystem)
psyched/psyched-cms-elasticsearch      # Elasticsearch CQRS read model + search
psyched/psyched-cms-taxonomy            # Taxonomy system
psyched/psyched-cms-workflow            # Content workflow & events (Symfony Workflow)
psyched/psyched-cms-complex-fields      # Set, Collection, Embed fields
psyched/psyched-cms-project             # Full project template
```

**NPM packages (React Admin):**
```
@psyched/psyched-cms-admin-core         # React Admin base package
@psyched/psyched-cms-admin-media        # Media browser component
@psyched/psyched-cms-admin-seo          # SEO form components
```

### Core Bundle (`psyched/psyched-cms-core`)

Provides:
- `ContentTrait` with common content behavior
- `ContentInterface` for type contracts
- Field attribute system (`#[TextField]`, `#[SlugField]`, etc.)
- Content type registry (auto-discovery via attributes)
- Base API Platform integration
- Doctrine mappings and listeners

### Storage Model

Each content type is a standalone Doctrine entity with its own table:

```
posts          → Post entity (id, slug, status, title, body, ...)
pages          → Page entity (id, slug, status, title, body, ...)
news           → News entity (id, slug, status, title, body, ...)
taxonomy_terms → Shared taxonomy storage
content_taxonomies → Polymorphic taxonomy relations
media          → Media files metadata
```

No discriminator columns, no shared content tables. Standard Doctrine ORM.

### Dependencies

```
symfony/symfony: ^7.1
doctrine/orm: ^3.0
api-platform/core: ^4.0
gedmo/doctrine-extensions: ^3.15
php: ^8.3
```

---

## Content Type Definition

### The ContentTrait

```php
<?php

namespace PsychedCms\Core\Content;

use Doctrine\ORM\Mapping as ORM;
use PsychedCms\Core\Attribute\ContentMeta;

trait ContentTrait
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $slug;

    #[ORM\Column(length: 50)]
    private string $status = 'draft';

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $depublishedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $author = null;

    // Getters, setters, status helpers...
}
```

### ContentInterface

```php
<?php

namespace PsychedCms\Core\Content;

interface ContentInterface
{
    public function getId(): ?int;
    public function getSlug(): string;
    public function getStatus(): string;
    public function setStatus(string $status): static;
    public function getCreatedAt(): \DateTimeImmutable;
    public function getUpdatedAt(): \DateTimeImmutable;
    public function getPublishedAt(): ?\DateTimeImmutable;
    public function getDepublishedAt(): ?\DateTimeImmutable;
    public function getAuthor(): ?User;
    public function isPublished(): bool;
    public function isScheduled(): bool;
}
```

### Example Content Type

```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use PsychedCms\Core\Content\ContentInterface;
use PsychedCms\Core\Content\ContentTrait;
use PsychedCms\Core\Attribute\ContentType;
use PsychedCms\Core\Attribute\Field\TextField;
use PsychedCms\Core\Attribute\Field\SlugField;
use PsychedCms\Core\Attribute\Field\HtmlField;
use PsychedCms\Core\Attribute\Field\ImageField;
use PsychedCms\Taxonomy\Attribute\Taxonomy;
use PsychedCms\Seo\Embeddable\SeoMetadata;
use ApiPlatform\Metadata\ApiResource;

#[ORM\Entity]
#[ApiResource]
#[ContentType(
    name: 'News',
    singularName: 'News Item',
    icon: 'fa:newspaper',
    showOnDashboard: true,
    searchable: true,
    defaultStatus: 'draft'
)]
class News implements ContentInterface
{
    use ContentTrait;

    #[ORM\Column(length: 255)]
    #[TextField(
        label: 'Title',
        required: true,
        searchable: true,
        group: 'main',
        class: 'large'
    )]
    private string $title;

    #[ORM\Column(length: 255, unique: true)]
    #[SlugField(uses: 'title')]
    private string $slug;

    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(
        label: 'Content',
        group: 'content',
        height: '400px',
        sanitize: true
    )]
    private ?string $body = null;

    #[ORM\Embedded(class: SeoMetadata::class)]
    #[SeoField(group: 'seo')]
    private SeoMetadata $seo;

    #[ORM\Column(type: 'json', nullable: true)]
    #[ImageField(label: 'Featured Image', group: 'media')]
    private ?array $featuredImage = null;

    #[Taxonomy(type: 'tags', multiple: true)]
    private Collection $tags;

    #[Taxonomy(type: 'categories', multiple: false, required: true)]
    private Collection $categories;

    public function __construct()
    {
        $this->seo = new SeoMetadata();
        $this->tags = new ArrayCollection();
        $this->categories = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    // Getters and setters...
}
```

---

## Field Types

### Core Fields (`psyched-cms-core`)

| Attribute | Doctrine Type | Purpose |
|-----------|---------------|---------|
| `#[TextField]` | `string` | Single-line text input |
| `#[SlugField]` | `string` | URL-friendly slug (auto-generated) |
| `#[TextareaField]` | `text` | Multi-line plain text |
| `#[HtmlField]` | `text` | Rich text with WYSIWYG |
| `#[MarkdownField]` | `text` | Markdown formatted text |
| `#[NumberField]` | `float`/`integer` | Numeric values |
| `#[CheckboxField]` | `boolean` | Boolean toggle |
| `#[DateField]` | `datetime_immutable` | Date/time picker |
| `#[EmailField]` | `string` | Email with validation |
| `#[SelectField]` | `string`/`json` | Dropdown selection |
| `#[HiddenField]` | `string` | Non-visible data |

### Media Fields (`psyched-cms-media`)

| Attribute | Storage | Purpose |
|-----------|---------|---------|
| `#[ImageField]` | `json` | Single image with metadata |
| `#[ImageListField]` | `json` | Multiple images |
| `#[FileField]` | `json` | Single file upload |
| `#[FileListField]` | `json` | Multiple files |

### Complex Fields (`psyched-cms-complex-fields`)

| Attribute | Storage | Purpose |
|-----------|---------|---------|
| `#[SetField]` | `ORM\Embedded` | Grouped sub-fields (embeddable) |
| `#[CollectionField]` | `json` | Repeatable field groups |
| `#[EmbedField]` | `json` | oEmbed content (YouTube, etc.) |
| `#[DataField]` | `json` | Arbitrary structured data |

### Common Field Options

```php
#[TextField(
    label: 'Display Label',           // Admin UI label
    group: 'main',                    // Tab grouping
    required: true,                   // Validation
    readonly: false,                  // Prevent editing
    default: 'Default value',         // Initial value
    placeholder: 'Enter text...',     // Input placeholder
    info: 'Help text tooltip',        // Contextual help
    pattern: '/^[A-Z]/',              // Regex validation
    searchable: true,                 // Include in search index
    translatable: true,               // Enable i18n
    class: 'large',                   // CSS class hint
    prefix: '€',                      // Display prefix
    postfix: 'per month',             // Display postfix
)]
```

### OpenAPI Schema Extension

Field attributes must expose their metadata through API Platform's OpenAPI/Hydra schema so React Admin can introspect them.

**Implementation approach**: Study how `#[ApiFilter]` exposes filter metadata in the schema. The bundle should auto-decorate properties with OpenAPI extensions:

```php
// What the developer writes
#[TextField(label: 'Title', group: 'main', class: 'large')]
private string $title;

// What the bundle generates in OpenAPI schema
{
    "properties": {
        "title": {
            "type": "string",
            "x-psychedcms": {
                "fieldType": "text",
                "label": "Title",
                "group": "main",
                "class": "large"
            }
        }
    }
}
```

This requires implementing an `OpenApiFactory` decorator or `PropertyMetadataFactory` that reads PsychedCMS attributes and injects `x-psyched` extensions into the schema.

**Reference**: `ApiPlatform\Metadata\ApiFilter` → `ApiPlatform\OpenApi\Factory\OpenApiFactory`

---

## Localization (Gedmo Translatable)

### Setup

```php
<?php

namespace App\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Translatable\Translatable;

#[ORM\Entity]
#[ContentType(name: 'Page', locales: ['en', 'fr', 'de'])]
class Page implements ContentInterface, Translatable
{
    use ContentTrait;

    #[Gedmo\Translatable]
    #[ORM\Column(length: 255)]
    #[TextField(label: 'Title', translatable: true)]
    private string $title;

    #[Gedmo\Translatable]
    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Body', translatable: true)]
    private ?string $body = null;

    #[Gedmo\Locale]
    private ?string $locale = null;

    public function setTranslatableLocale(string $locale): void
    {
        $this->locale = $locale;
    }
}
```

### Translation Entity (Auto-generated)

Gedmo creates `PageTranslation` table automatically. Translations are loaded transparently based on request locale.

### API Locale Handling

Locale is determined exclusively via the `Accept-Language` HTTP header:

```http
GET /api/pages/1
Accept-Language: fr

HTTP/1.1 200 OK
Content-Language: fr

{
    "id": 1,
    "title": "Bienvenue",
    "body": "<p>Contenu en français</p>"
}
```

```http
GET /api/pages/1
Accept-Language: en-US,en;q=0.9,fr;q=0.8

HTTP/1.1 200 OK
Content-Language: en

{
    "id": 1,
    "title": "Welcome",
    "body": "<p>English content</p>"
}
```

The `psyched-cms-core` bundle provides an event listener that:
1. Reads `Accept-Language` header
2. Matches against configured locales (with fallback)
3. Sets Gedmo's translatable locale
4. Adds `Content-Language` response header

```php
// Listener auto-registered by bundle
#[AsEventListener(event: KernelEvents::REQUEST, priority: 100)]
class LocaleListener
{
    public function __construct(
        private TranslatableListener $translatableListener,
        private array $supportedLocales,
        private string $defaultLocale
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        $locale = $event->getRequest()->getPreferredLanguage($this->supportedLocales)
            ?? $this->defaultLocale;

        $this->translatableListener->setTranslatableLocale($locale);
    }
}
```

---

## Taxonomy System (`psyched-cms-taxonomy`)

Taxonomies in PsychedCMS are **entity-based** - any entity can serve as a taxonomy. This allows taxonomies to be full domain objects with their own fields, relations, and admin management.

### Two Approaches

#### 1. Classic Taxonomies (Generic Table)

Simple taxonomy table: `taxonomy(id, type, slug, name)`. No custom fields, just classification.

```php
// Built-in entity provided by psychedcms-cms-taxonomy
#[ORM\Entity]
#[ORM\Table(name: 'taxonomy')]
#[ORM\UniqueConstraint(columns: ['type', 'slug'])]
class Taxonomy
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private string $type;  // 'tags', 'categories', etc.

    #[ORM\Column(length: 255)]
    private string $slug;

    #[ORM\Column(length: 255)]
    private string $name;
}
```

Usage in content entities:

```php
#[ORM\Entity]
class Post implements ContentInterface
{
    use ContentTrait;

    #[ORM\ManyToMany(targetEntity: Taxonomy::class)]
    #[ORM\JoinTable(name: 'post_taxonomies')]
    #[Taxonomy(type: 'tags', multiple: true)]
    private Collection $tags;  // Collection<Taxonomy> where type='tags'

    #[ORM\ManyToOne(targetEntity: Taxonomy::class)]
    #[Taxonomy(type: 'categories', required: true)]
    private ?Taxonomy $category = null;  // Single Taxonomy where type='categories'
}
```

The `#[Taxonomy]` attribute filters by `type` column automatically.

#### 2. Entity Taxonomies (Custom Entities)

For taxonomies that need custom fields, use any entity as a taxonomy source:

```php
// Genre is a full entity - manageable in admin
#[ORM\Entity]
#[ContentType(name: 'Genres', singularName: 'Genre', icon: 'fa:music')]
class Genre implements ContentInterface
{
    use ContentTrait;

    #[ORM\Column(length: 100)]
    #[TextField(label: 'Name', required: true)]
    private string $name;

    #[ORM\Column(length: 100, unique: true)]
    #[SlugField(uses: 'name')]
    private string $slug;

    #[ORM\Column(type: 'text', nullable: true)]
    #[TextareaField(label: 'Description')]
    private ?string $description = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[TextField(label: 'Icon CSS Class')]
    private ?string $icon = null;
}

// Band uses Genre as a taxonomy
#[ORM\Entity]
#[ContentType(name: 'Bands')]
class Band implements ContentInterface
{
    use ContentTrait;

    #[ORM\Column(length: 255)]
    #[TextField(label: 'Name')]
    private string $name;

    // Entity taxonomy - categories behavior with Genre entity
    #[ORM\ManyToMany(targetEntity: Genre::class)]
    #[EntityTaxonomy(
        type: 'categories',
        multiple: true,
        required: true,
        label: 'Genres',
        min: 1,
        max: 5
    )]
    private Collection $genres;  // Collection<Genre>

    // Can also have simple taxonomies alongside
    #[Taxonomy(type: 'tags', multiple: true)]
    private Collection $tags;  // Collection<TaxonomyTerm>
}
```

### EntityTaxonomy Attribute

```php
#[Attribute(Attribute::TARGET_PROPERTY)]
class EntityTaxonomy
{
    public function __construct(
        public string $type = 'categories',  // 'tags', 'categories', 'grouping'
        public bool $multiple = true,
        public bool $required = false,
        public string $label = '',
        public ?int $min = null,
        public ?int $max = null,
        public ?string $order = null,              // Order options in admin: 'name', '-createdAt'
        public ?string $filter = null,             // Filter available options: 'status = published'
        public bool $allowCreate = false,          // Allow creating new terms inline in admin
    ) {}
}
```

### Querying by Taxonomy

```php
// Repository method - type-safe
$bands = $bandRepository->findByGenre($rockGenre);
```

```http
# API filter - by slug (human-readable)
GET /api/bands?genres[]=rock&genres[]=blues

# Multiple taxonomies
GET /api/bands?genres[]=metal&tags[]=featured
```

The `psyched-cms-taxonomy` bundle provides an API Platform filter that:
- Resolves slugs to entity IDs
- Supports both simple and entity taxonomies


---

## Content Relations

### Definition

```php
#[ORM\Entity]
#[ContentType(name: 'Entry')]
class Entry implements ContentInterface
{
    use ContentTrait;

    #[ORM\ManyToOne(targetEntity: Author::class)]
    #[ContentRelation(
        label: 'Author',
        required: true,
        linkToRecord: true
    )]
    private ?Author $author = null;

    #[ORM\ManyToMany(targetEntity: Entry::class)]
    #[ContentRelation(
        label: 'Related Entries',
        multiple: true,
        limit: 5,
        order: '-createdAt'
    )]
    private Collection $relatedEntries;

    #[ORM\ManyToOne(targetEntity: Page::class)]
    #[ContentRelation(
        label: 'Parent Page',
        format: '{{ title }} ({{ status }})'
    )]
    private ?Page $parentPage = null;
}
```

Standard Doctrine relations are used. The `#[ContentRelation]` attribute adds metadata for admin UI generation.

---

## Content Workflow (`psyched-cms-workflow`)

Built on **Symfony Workflow** component - provides state machine for content lifecycle with guards, transitions, and events.

### Default Workflow Configuration

```yaml
# config/packages/psyched_cms_workflow.yaml
framework:
    workflows:
        content_publishing:
            type: 'state_machine'
            audit_trail:
                enabled: true
            marking_store:
                type: 'method'
                property: 'status'
            supports:
                - PsychedCms\Core\Content\ContentInterface
            initial_marking: draft
            places:
                - draft
                - review
                - published
                - archived
            transitions:
                submit_for_review:
                    from: draft
                    to: review
                publish:
                    from: [draft, review]
                    to: published
                unpublish:
                    from: published
                    to: draft
                archive:
                    from: [draft, published]
                    to: archived
                restore:
                    from: archived
                    to: draft
```

### Places (Statuses)

| Place | Description |
|-------|-------------|
| `draft` | Work in progress, not visible |
| `review` | Pending approval (optional) |
| `published` | Live and visible |
| `archived` | Soft-deleted, not visible |

### Transitions

```
draft ──submit_for_review──▶ review ──publish──▶ published
  │                                                  │
  └─────────────publish────────────────────────────▶│
  │                                                  │
  │◀────────────unpublish────────────────────────────┘
  │
  └──────────archive──────▶ archived
                              │
  ◀─────────restore───────────┘
```

### Workflow Guards

```php
use Symfony\Component\Workflow\Attribute\AsGuardListener;

#[AsGuardListener(workflow: 'content_publishing', transition: 'publish')]
class PublishGuard
{
    public function __invoke(GuardEvent $event): void
    {
        $content = $event->getSubject();

        // Block if required fields missing
        if (empty($content->getTitle())) {
            $event->setBlocked(true, 'Title is required to publish.');
        }

        // Block if user lacks permission
        if (!$this->security->isGranted('CONTENT_PUBLISH', $content)) {
            $event->setBlocked(true, 'You do not have permission to publish.');
        }
    }
}
```

### Transition Events

```php
use Symfony\Component\Workflow\Attribute\AsTransitionListener;
use Symfony\Component\Workflow\Attribute\AsCompletedListener;

// Before transition completes
#[AsTransitionListener(workflow: 'content_publishing', transition: 'publish')]
class OnPublishTransition
{
    public function __invoke(TransitionEvent $event): void
    {
        $content = $event->getSubject();
        $content->setPublishedAt(new \DateTimeImmutable());
    }
}

// After transition completed
#[AsCompletedListener(workflow: 'content_publishing', transition: 'publish')]
class AfterPublished
{
    public function __invoke(CompletedEvent $event): void
    {
        $content = $event->getSubject();

        // Clear cache
        $this->cache->invalidateTags(['content_' . $content->getId()]);

        // Index in search
        $this->searchIndexer->index($content);

        // Send notifications
        if ($content instanceof Post) {
            $this->notifier->notifySubscribers($content);
        }
    }
}
```

### API Integration

```http
# Get available transitions for a content
GET /api/posts/1/workflow

{
    "currentPlace": "draft",
    "availableTransitions": ["submit_for_review", "publish", "archive"],
    "blockedTransitions": {
        "publish": "Title is required to publish."
    }
}

# Apply a transition
POST /api/posts/1/workflow/publish

HTTP/1.1 200 OK
{
    "id": 1,
    "status": "published",
    "publishedAt": "2026-01-22T10:30:00+00:00"
}
```

### Scheduled Publishing

```php
use Symfony\Component\Scheduler\Attribute\AsSchedule;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;

#[AsSchedule('content')]
class ContentSchedule implements ScheduleProviderInterface
{
    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->add(RecurringMessage::every('1 minute', new ProcessScheduledContent()));
    }
}

// Handler
class ProcessScheduledContentHandler
{
    public function __invoke(ProcessScheduledContent $message): void
    {
        $scheduled = $this->repository->findReadyToPublish();

        foreach ($scheduled as $content) {
            $this->workflow->apply($content, 'publish');
            $this->entityManager->flush();
        }
    }
}
```

### Custom Workflows per Content Type

Override the default workflow for specific content types:

```yaml
framework:
    workflows:
        article_publishing:
            type: 'state_machine'
            marking_store:
                type: 'method'
                property: 'status'
            supports:
                - App\Entity\Article
            initial_marking: draft
            places:
                - draft
                - editor_review
                - legal_review
                - published
                - archived
            transitions:
                submit_to_editor:
                    from: draft
                    to: editor_review
                submit_to_legal:
                    from: editor_review
                    to: legal_review
                publish:
                    from: legal_review
                    to: published
                # ... etc
```

---

## Media Management (`psyched-cms-media`)

### Flysystem Integration

```yaml
# config/packages/flysystem.yaml
flysystem:
    storages:
        default.storage:
            adapter: 'local'
            options:
                directory: '%kernel.project_dir%/public/uploads'

        minio.storage:
            adapter: 'aws'
            options:
                client: 'minio.client'
                bucket: '%env(MINIO_BUCKET)%'

# config/packages/psyched_cms_media.yaml
psyched_cms_media:
    storage: 'minio.storage'  # or 'default.storage'
    public_url: '%env(MEDIA_PUBLIC_URL)%'
    allowed_types:
        images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
        files: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip']
    max_upload_size: '10M'
    image_processing:
        driver: 'imagick'  # or 'gd'
        thumbnails:
            small: [150, 150]
            medium: [300, 300]
            large: [800, 800]
```

### Media Entity

```php
#[ORM\Entity]
#[ApiResource]
class Media
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $filename;

    #[ORM\Column(length: 255)]
    private string $path;

    #[ORM\Column(length: 100)]
    private string $mimeType;

    #[ORM\Column]
    private int $size;

    #[ORM\Column(nullable: true)]
    private ?int $width = null;

    #[ORM\Column(nullable: true)]
    private ?int $height = null;

    #[ORM\Column(type: 'json')]
    private array $metadata = [];

    #[ORM\Column]
    private \DateTimeImmutable $uploadedAt;

    public function getPublicUrl(): string;
    public function getThumbnailUrl(string $size = 'medium'): string;
}
```

---

## Elasticsearch & CQRS (`psyched-cms-elasticsearch`)

This bundle implements **CQRS** (Command Query Responsibility Segregation):
- **Writes** → Doctrine (PostgreSQL)
- **Reads** → Elasticsearch

All API `GET` requests are served from Elasticsearch, providing fast, scalable reads with full-text search capabilities.

### Architecture

```
┌─────────────┐     POST/PUT/DELETE     ┌─────────────┐
│   Client    │ ───────────────────────▶│   Doctrine  │
└─────────────┘                         │ (PostgreSQL)│
       │                                └──────┬──────┘
       │                                       │
       │ GET                                   │ Events
       │                                       ▼
       │                                ┌─────────────┐
       │                                │   Indexer   │
       │                                └──────┬──────┘
       │                                       │
       │                                       ▼
       │                                ┌─────────────┐
       └───────────────────────────────▶│Elasticsearch│
                                        └─────────────┘
```

### Configuration

```yaml
# config/packages/psyched_cms_elasticsearch.yaml
psyched_cms_elasticsearch:
    hosts: ['%env(ELASTICSEARCH_URL)%']
    index_prefix: 'psyched_'
    cqrs: true  # Public API reads from ES, writes to Doctrine

    # Indexing settings
    indexing:
        async: true  # Use Messenger for async indexing
        batch_size: 100
```

### Provider Strategy

`psyched-cms-core` provides a default `PsychedCmsProvider` that uses Doctrine.

`psyched-cms-elasticsearch` extends it with a strategy based on `X-Client-Type` HTTP header:

```
┌─────────────────────────────────────────────────────────┐
│                   PsychedCmsProvider                    │
│                                                         │
│  X-Client-Type: admin  ──▶ DoctrineStrategy (always)    │
│  X-Client-Type: public ──▶ ElasticsearchStrategy        │
│  (no header)           ──▶ ElasticsearchStrategy        │
│                                                         │
│  ES unavailable        ──▶ auto fallback to Doctrine    │
└─────────────────────────────────────────────────────────┘
```

```http
# Admin client - always Doctrine (real-time consistency)
GET /api/posts
X-Client-Type: admin

# Public client - Elasticsearch
GET /api/posts
X-Client-Type: public

# No header - defaults to Elasticsearch (public)
GET /api/posts
```

Writes always go to Doctrine regardless of header.

### Entity Mapping

Use attributes to define how entity properties map to Elasticsearch:

```php
#[ORM\Entity]
#[ContentType(name: 'Posts')]
#[Indexed(index: 'posts')]  // Elasticsearch index name
class Post implements ContentInterface
{
    use ContentTrait;

    #[ORM\Column(length: 255)]
    #[TextField(label: 'Title')]
    #[IndexedField(
        type: 'text',
        analyzer: 'standard',
        boost: 3.0,
        searchable: true
    )]
    private string $title;

    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Body')]
    #[IndexedField(
        type: 'text',
        analyzer: 'html_strip',
        searchable: true
    )]
    private ?string $body = null;

    #[ORM\Column(length: 255)]
    #[SlugField(uses: 'title')]
    #[IndexedField(type: 'keyword')]  // Exact match, filterable
    private string $slug;

    #[ORM\Column]
    #[DateField]
    #[IndexedField(type: 'date')]
    private \DateTimeImmutable $createdAt;

    #[ORM\ManyToMany(targetEntity: Genre::class)]
    #[EntityTaxonomy(type: 'categories', multiple: true)]
    #[IndexedField(
        type: 'nested',
        properties: ['id', 'name', 'slug']  // What to index from relation
    )]
    private Collection $genres;

    #[ORM\ManyToOne(targetEntity: Author::class)]
    #[IndexedField(
        type: 'object',
        properties: ['id', 'name']
    )]
    private ?Author $author = null;

    // Not indexed - only in Doctrine
    #[ORM\Column(type: 'text', nullable: true)]
    #[TextareaField(label: 'Internal Notes')]
    private ?string $internalNotes = null;
}
```

### IndexedField Attribute

```php
#[Attribute(Attribute::TARGET_PROPERTY)]
class IndexedField
{
    public function __construct(
        public string $type = 'text',           // text, keyword, integer, date, boolean, nested, object
        public ?string $analyzer = null,         // ES analyzer: standard, html_strip, french, etc.
        public float $boost = 1.0,               // Search relevance boost
        public bool $searchable = true,          // Include in full-text search
        public bool $filterable = true,          // Allow filtering
        public bool $sortable = false,           // Allow sorting (creates .keyword subfield)
        public ?array $properties = null,        // For nested/object: which properties to index
        public ?string $normalizer = null,       // For keyword fields
        public bool $includeInAll = true,        // Include in _all field
    ) {}
}
```

### API Platform Integration (CQRS)

The bundle extends `PsychedCmsProvider` to add Elasticsearch strategy:

```php
// No explicit provider needed - bundle auto-configures
#[ORM\Entity]
#[ApiResource]
#[Indexed(index: 'posts')]
class Post implements ContentInterface
{
    // ...
}
```

```http
# Read with admin header - Doctrine
GET /api/posts
X-Client-Type: admin

# Read without header or public - Elasticsearch
GET /api/posts
GET /api/posts?genres[]=rock&search=concert

# Writes - always Doctrine, then async indexed
POST /api/posts
PUT /api/posts/1
DELETE /api/posts/1
```

Single API, header-based strategy discrimination.

### Search Endpoint

```http
# Full-text search across all indexed content types
GET /api/search?q=rock+concert

{
    "results": [
        {"type": "post", "id": 1, "title": "Rock Concert Review", "score": 2.45},
        {"type": "band", "id": 5, "name": "The Rockers", "score": 1.82}
    ],
    "total": 42,
    "facets": {
        "type": {"post": 30, "band": 12},
        "genres": {"rock": 35, "blues": 7}
    }
}

# Search within a content type
GET /api/posts?search=concert&genres[]=rock
```

### Indexing Events

```php
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

// Async indexing via Messenger
#[AsMessageHandler]
class IndexContentHandler
{
    public function __invoke(IndexContent $message): void
    {
        $content = $this->repository->find($message->contentId);
        $this->indexer->index($content);
    }
}

// Doctrine listener triggers indexing
class ContentIndexListener
{
    #[AsDoctrineListener(event: Events::postPersist)]
    #[AsDoctrineListener(event: Events::postUpdate)]
    public function onContentChange(PostPersistEventArgs|PostUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if ($entity instanceof ContentInterface && $this->hasIndexedAttribute($entity)) {
            $this->bus->dispatch(new IndexContent($entity->getId(), $entity::class));
        }
    }

    #[AsDoctrineListener(event: Events::postRemove)]
    public function onContentRemove(PostRemoveEventArgs $args): void
    {
        $entity = $args->getObject();

        if ($entity instanceof ContentInterface && $this->hasIndexedAttribute($entity)) {
            $this->bus->dispatch(new RemoveFromIndex($entity->getId(), $entity::class));
        }
    }
}
```

### Console Commands

```bash
# Reindex all content of a type
bin/console psychedcms:es:reindex Post

# Reindex everything
bin/console psychedcms:es:reindex --all

# Create/update index mappings
bin/console psychedcms:es:mapping:update

# Check index health
bin/console psychedcms:es:status
```


---


---

## Project Template (`psyched/psyched-cms-project`)

### Structure

```
psyched-project/
├── backend/
│   ├── config/
│   │   ├── packages/
│   │   │   ├── psyched_cms_core.yaml
│   │   │   ├── psyched_cms_media.yaml
│   │   │   ├── psyched_cms_taxonomy.yaml
│   │   │   └── psyched_cms_elasticsearch.yaml
│   │   └── routes.yaml
│   ├── src/
│   │   └── Entity/
│   │       ├── Post.php
│   │       └── Page.php
│   ├── migrations/
│   ├── public/
│   ├── composer.json
│   └── symfony.lock
├── admin/
│   ├── src/
│   │   ├── App.tsx
│   │   └── resources/
│   ├── package.json
│   └── vite.config.ts
├── .docker/
│   ├── php/Dockerfile
│   ├── nginx/
│   └── postgres/
├── docker-compose.yml
├── Taskfile.yml
└── README.md
```

### Default Content Types

```php
// src/Entity/Page.php
#[ORM\Entity]
#[ApiResource]
#[ContentType(
    name: 'Pages',
    singularName: 'Page',
    icon: 'fa:file',
    singleton: false,
    defaultStatus: 'draft'
)]
class Page implements ContentInterface, Translatable
{
    use ContentTrait;

    #[Gedmo\Translatable]
    #[ORM\Column(length: 255)]
    #[TextField(label: 'Title', required: true, class: 'large')]
    private string $title;

    #[ORM\Column(length: 255, unique: true)]
    #[SlugField(uses: 'title')]
    private string $slug;

    #[Gedmo\Translatable]
    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Body', group: 'content')]
    private ?string $body = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[ImageField(label: 'Featured Image', group: 'media')]
    private ?array $image = null;

    #[ORM\Embedded(class: SeoMetadata::class)]
    private SeoMetadata $seo;
}
```

```php
// src/Entity/Post.php
#[ORM\Entity]
#[ApiResource]
#[ContentType(
    name: 'Posts',
    singularName: 'Post',
    icon: 'fa:pencil',
    searchable: true,
    defaultStatus: 'draft'
)]
class Post implements ContentInterface, Translatable
{
    use ContentTrait;
    use TaxonomizableTrait;

    #[Gedmo\Translatable]
    #[ORM\Column(length: 255)]
    #[TextField(label: 'Title', required: true, searchable: true)]
    private string $title;

    #[ORM\Column(length: 255, unique: true)]
    #[SlugField(uses: 'title')]
    private string $slug;

    #[Gedmo\Translatable]
    #[ORM\Column(type: 'text', nullable: true)]
    #[TextareaField(label: 'Excerpt', group: 'main')]
    private ?string $excerpt = null;

    #[Gedmo\Translatable]
    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Content', group: 'content', searchable: true)]
    private ?string $body = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[ImageField(label: 'Featured Image', group: 'media')]
    private ?array $featuredImage = null;

    #[Taxonomy(type: 'tags', multiple: true)]
    private Collection $tags;

    #[Taxonomy(type: 'categories', required: true)]
    private Collection $categories;

    #[ORM\Embedded(class: SeoMetadata::class)]
    private SeoMetadata $seo;
}
```

---

## Docker Setup

### docker-compose.yml

```yaml
services:
    php:
        build: ./docker/php
        volumes:
            - ./backend:/app
        environment:
            DATABASE_URL: postgresql://psychedcms:psychedcms@postgres:5432/psychedcms
            ELASTICSEARCH_URL: http://elasticsearch:9200
            MINIO_ENDPOINT: http://minio:9000
            MINIO_BUCKET: media
            MINIO_ACCESS_KEY: minioadmin
            MINIO_SECRET_KEY: minioadmin

    nginx:
        image: nginx:alpine
        ports:
            - "8080:80"
        volumes:
            - ./backend/public:/app/public:ro
            - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro

    postgres:
        image: postgres:16-alpine
        environment:
            POSTGRES_USER: psychedcms
            POSTGRES_PASSWORD: psychedcms
            POSTGRES_DB: psychedcms
        volumes:
            - postgres_data:/var/lib/postgresql/data

    admin:
        build: ./admin
        ports:
            - "3000:3000"
        environment:
            VITE_API_URL: http://localhost:8080/api

    # Optional services
    elasticsearch:
        image: elasticsearch:8.11.0
        environment:
            - discovery.type=single-node
            - xpack.security.enabled=false
        profiles: ["search"]

    minio:
        image: minio/minio
        command: server /data --console-address ":9001"
        ports:
            - "9000:9000"
            - "9001:9001"
        profiles: ["storage"]

volumes:
    postgres_data:
```

### Standalone Mode (No Docker)

```bash
# Using Symfony CLI
cd backend
symfony server:start --port=8080

# Using PHP built-in server
php -S localhost:8080 -t public

# Admin dev server
cd admin
npm run dev
```

---

## Inspiration: Bolt CMS

Bolt CMS serves as a reference for feature parity. Key concepts borrowed:

| Bolt Concept | PsychedCMS Equivalent |
|--------------|----------------------|
| `contenttypes.yaml` | PHP Entity + `#[ContentType]` attribute |
| EAV field storage | Doctrine columns with field attributes |
| `taxonomy.yaml` | Entity taxonomies or simple `TaxonomyTerm` |
| Twig templates | Headless API (React/Next.js frontend) |
| Built-in admin | API Platform Admin (React Admin) |
| Draft/Published | Symfony Workflow |

### Bolt YAML vs PsychedCMS Entity

**Bolt approach:**
```yaml
# config/bolt/contenttypes.yaml
news:
    name: News
    singular_name: News Item
    fields:
        title:
            type: text
            class: large
        slug:
            type: slug
            uses: title
        image:
            type: image
        body:
            type: html
    taxonomy: [tags, categories]
```

**PsychedCMS approach:**
```php
#[ORM\Entity]
#[ApiResource]
#[ContentType(name: 'News', singularName: 'News Item')]
class News implements ContentInterface
{
    use ContentTrait;

    #[ORM\Column(length: 255)]
    #[TextField(label: 'Title', class: 'large')]
    private string $title;

    #[ORM\Column(length: 255, unique: true)]
    #[SlugField(uses: 'title')]
    private string $slug;

    #[ORM\Column(type: 'json', nullable: true)]
    #[ImageField]
    private ?array $image = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField]
    private ?string $body = null;

    #[ORM\ManyToMany(targetEntity: Tag::class)]
    #[EntityTaxonomy(type: 'tags', multiple: true)]
    private Collection $tags;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[EntityTaxonomy(type: 'categories')]
    private ?Category $category = null;
}
```

Same capabilities, but type-safe and IDE-friendly.

---

## API Endpoints

### Standard API Platform Endpoints

```
GET    /api/posts              # List posts
POST   /api/posts              # Create post
GET    /api/posts/{id}         # Get post
PUT    /api/posts/{id}         # Update post
DELETE /api/posts/{id}         # Delete post

GET    /api/pages              # List pages
...
```

### Media

```
POST   /api/media/upload       # Upload file
GET    /api/media              # List media
DELETE /api/media/{id}         # Delete media
```

### Search (via `psyched-cms-elasticsearch`)

```
GET    /api/search?q=term              # Global search across all indexed types
GET    /api/search?q=term&type=posts   # Search specific type
GET    /api/posts?search=term          # Search within content type endpoint
```

All `GET` endpoints are served from Elasticsearch (CQRS read model).

### Taxonomy

```
GET    /api/taxonomies/tags            # List all tags
GET    /api/taxonomies/categories      # List categories
GET    /api/posts?tags=symfony         # Filter by taxonomy
```

---

## Implementation Phases

### Phase 1: Core Foundation
- [ ] `psyched-cms-core` bundle with ContentTrait and ContentInterface
- [ ] Field attribute system (Text, Slug, Html, Textarea, Number, Checkbox, Date, Email, Select)
- [ ] Content type registry and auto-discovery
- [ ] Basic API Platform integration
- [ ] Schema introspection endpoint

### Phase 2: Essential Features
- [ ] `psyched-cms-workflow` with statuses and events
- [ ] `psyched-cms-taxonomy` system
- [ ] `psyched-cms-media` with Flysystem
- [ ] Gedmo Translatable integration

### Phase 3: Advanced Features
- [ ] `psyched-cms-complex-fields` (Set, Collection, Embed)
- [ ] `psyched-cms-elasticsearch` CQRS read model + search
- [ ] `psyched-cms-seo` bundle

### Phase 4: Admin
- [ ] `psyched-cms-admin-core` React Admin package
- [ ] `psyched-cms-admin-media` media browser
- [ ] Form auto-generation from schema

### Phase 5: Project Template
- [ ] `psyched-cms-project` full project template
- [ ] Docker setup
- [ ] Migration command from Bolt
- [ ] Documentation

---

## Decisions

1. **Versioning** - Separate bundle (`psyched-cms-versioning`). Hooks on Messenger, stores changes using EventSource pattern in fitting storage (NoSQL/Elasticsearch). Not in v1.

2. **Permissions** - Basic role-based (admin/editor/viewer). Keep it simple.

3. **Preview** - Deferred. Requires frontend theme integration, not applicable for pure headless v1.

4. **Webhooks** - Not in v1.

5. **Import/Export** - Necessary but deferred to post-v1.
