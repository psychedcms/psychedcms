# Installation

This guide covers setting up PsychedCMS for local development.

## Requirements

- PHP 8.2+
- Node.js 18+
- Docker & Docker Compose
- Task (task runner)

## Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd psyched-cms

# Run the setup task
task setup
```

This will:
1. Start Docker containers (PostgreSQL, etc.)
2. Install PHP dependencies
3. Install Node.js dependencies
4. Run database migrations
5. Load fixtures (optional)

## Manual Setup

### Backend (API)

```bash
# Install PHP dependencies
cd api
composer install

# Configure environment
cp .env .env.local
# Edit .env.local with your database credentials

# Create database and run migrations
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Start the Symfony server
symfony serve
```

### Frontend (Admin)

```bash
# Install Node dependencies
cd admin
npm install

# Start the development server
npm run dev
```

## Accessing the Application

- **Admin UI**: http://localhost:3000/admin
- **API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs

## Task Commands

PsychedCMS uses [Task](https://taskfile.dev) for common operations:

```bash
task setup          # Full setup
task api:serve      # Start API server
task admin:dev      # Start admin dev server
task api:migrate    # Run migrations
task api:update     # Update dependencies
task test           # Run all tests
```

## Next Steps

- [Content Types](content-types.md) - Learn how to define content structures
- [API](api.md) - Explore the REST API
