# Synset Explorer

ImageNet taxonomy browser built with Fastify, React, and PostgreSQL.

> **Note:** This project is for demonstration purposes only, showcasing my software development skills as of 2026. It is not actively maintained.

## Features

- 🗂️ **Hierarchical tree visualization** with lazy loading
- 🔍 **Full-text search** with path expansion
- 📊 **Size visualization** for each synset
- 🐳 **Docker Compose** for local development
- ⚡ **Fast API** with Fastify and Prisma ORM

## Tech Stack

### Monorepo Structure

- **npm workspaces** - Monorepo management
- **Shared types** - Common TypeScript types between frontend and backend

### Backend

- **Fastify** - High-performance web framework
- **Prisma ORM** - Type-safe database access
- **PostgreSQL 18** - Database
- **TypeScript** - Type safety

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 22+

### Quick Setup

Run the automated setup script:

```bash
./setup.sh
```

This script will:

1. Create `.env` from `.env.example` (if needed)
2. Start Docker services (PostgreSQL + Backend)
3. Run database migrations
4. Seed the database with ImageNet data
5. Install all workspace dependencies locally (for IDE support)

Then start the frontend:

```bash
npm run -w frontend dev
```

**Access the application:**

- Frontend: http://localhost:5173 (or your configured port)
- Backend API: http://localhost:3000 (or your configured port)
- Prisma Studio: http://localhost:51212 (or your configured port)

**Configuration:** All settings are in the root `.env` file. See `.env.example` for available options.

## Development Commands

### Backend

**Note:** Backend runs in Docker, but dependencies are installed locally for IDE support.

**Docker commands:**

```bash
docker-compose up -d                                                       # Start backend (in Docker)
docker-compose exec backend npx prisma studio --port 51212 --browser none  # Open Prisma Studio
docker-compose logs -f backend                                             # View logs
docker-compose restart backend                                             # Restart backend
```
