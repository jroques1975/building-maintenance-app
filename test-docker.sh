#!/bin/bash

echo "🧪 Testing Docker setup for Building Maintenance App"
echo "====================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is installed: $(docker-compose --version)"

# Check Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker."
    exit 1
fi

echo "✅ Docker daemon is running"

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Failed to build Docker images"
    exit 1
fi

# Start services in background
echo ""
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check if services are running
echo ""
echo "📊 Checking service status..."
docker-compose ps

# Test backend health endpoint
echo ""
echo "🌡️  Testing backend health endpoint..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "000")

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend API is healthy (HTTP 200)"
    
    # Get detailed health info
    echo ""
    echo "📋 Backend health details:"
    curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
    
else
    echo "❌ Backend API is not responding (HTTP $BACKEND_HEALTH)"
    echo "🔍 Checking backend logs..."
    docker-compose logs backend --tail=20
fi

# Test database connection
echo ""
echo "🗄️  Testing database connection..."
DB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health/database || echo "000")

if [ "$DB_HEALTH" = "200" ]; then
    echo "✅ Database connection is healthy (HTTP 200)"
else
    echo "❌ Database connection failed (HTTP $DB_HEALTH)"
    echo "🔍 Checking database logs..."
    docker-compose logs postgres --tail=20
fi

# Test Prisma Studio (optional)
echo ""
echo "🎨 Testing Prisma Studio availability..."
PRISMA_UP=$(docker-compose ps prisma-studio 2>/dev/null | grep -c "Up" || echo "0")

if [ "$PRISMA_UP" = "1" ]; then
    echo "✅ Prisma Studio is running at http://localhost:5555"
else
    echo "⚠️  Prisma Studio is not running (optional service)"
fi

# Summary
echo ""
echo "====================================================="
echo "📋 TEST SUMMARY:"
echo "====================================================="

if [ "$BACKEND_HEALTH" = "200" ] && [ "$DB_HEALTH" = "200" ]; then
    echo "🎉 SUCCESS: All critical services are running!"
    echo ""
    echo "🌐 Service URLs:"
    echo "   Backend API:      http://localhost:3001"
    echo "   API Documentation: http://localhost:3001/api/health"
    echo "   Prisma Studio:    http://localhost:5555 (if running)"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Run database migrations: docker-compose exec backend npm run prisma:migrate"
    echo "   2. Seed database: docker-compose exec backend npm run prisma:seed"
    echo "   3. View logs: docker-compose logs -f"
    echo "   4. Stop services: docker-compose down"
else
    echo "⚠️  WARNING: Some services may not be fully functional"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check logs: docker-compose logs"
    echo "   2. Rebuild: docker-compose build --no-cache"
    echo "   3. Restart: docker-compose down && docker-compose up -d"
fi

echo "====================================================="