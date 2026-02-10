# PsychedCMS Documentation

Welcome to PsychedCMS, a modern headless CMS built with API Platform and React.

## What is PsychedCMS?

PsychedCMS is a flexible, API-first content management system designed for developers who need full control over their content architecture. It provides:

- **Dynamic Content Types** - Define your content structure without code changes
- **Flexible Field System** - Rich set of field types with validation and constraints
- **Publishing Workflows** - Draft, review, and publish content with configurable workflows
- **REST API** - Full CRUD operations via API Platform
- **React Admin UI** - Modern admin interface built with React Admin

## Quick Start

1. Clone the repository
2. Run `task setup` to initialize the environment
3. Access the admin at `http://localhost:3000/admin`
4. Access the API at `http://localhost:8000/api`

See [Installation](installation.md) for detailed setup instructions.

## Documentation

### Core Concepts

- [Content Types](content-types.md) - Defining your content structure
- [Fields](fields.md) - Field types and configuration

### Features

- [Workflows](workflows.md) - Publishing workflows
- [Scheduling](scheduling.md) - Content scheduling

### Reference

- [API](api.md) - REST API reference
- [Admin UI](admin-ui.md) - Admin customization

### Extending

- [Extending](extending.md) - Building custom functionality

## Architecture

PsychedCMS follows a monorepo structure:

```
psyched-cms/
├── api/                 # Symfony + API Platform backend
├── admin/               # React Admin frontend
├── packages/            # Shared PHP packages
│   ├── psychedcms-core/       # Core entities and services
│   ├── psychedcms-admin/      # Admin bundle
│   └── psychedcms-workflow/   # Workflow bundle
└── docs/                # This documentation
```

## Getting Help

- Check the documentation topics in the sidebar
- Review the codebase for examples
- Open an issue for bugs or feature requests
