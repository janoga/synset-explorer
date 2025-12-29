#!/bin/bash
# Quick setup script for Synset Explorer

set -e

echo "🚀 Synset Explorer - Quick Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "✅ Created .env file"
else
  echo "✅ .env file already exists"
fi

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Set defaults if not defined
BACKEND_PORT=${BACKEND_PORT:-3000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo ""
echo "🐳 Starting Docker services (PostgreSQL + Backend)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-postgres} > /dev/null 2>&1; do
  sleep 1
done

echo ""
echo "🗄️ Running database migrations..."
docker-compose exec -T backend npx prisma migrate dev

echo ""
echo "🧬 Generating Prisma client..."
docker-compose exec -T backend npx prisma generate

echo ""
echo "🌱 Seeding database with ImageNet data..."
docker-compose exec -T backend npx prisma db seed

echo ""
echo "📦 Installing workspace dependencies..."
npm install

echo ""
echo "🧬 Generating Prisma client locally for IDE..."
npm run -w backend db:generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start frontend:  npm run -w frontend dev"
echo "  2. Open browser:    http://localhost:${FRONTEND_PORT}"
echo "  3. Check health:    http://localhost:${BACKEND_PORT}/health"
echo ""
