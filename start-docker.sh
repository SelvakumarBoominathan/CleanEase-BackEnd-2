#!/bin/bash
# CleanEase Backend - Docker Quick Start Script

echo "🐳 CleanEase Backend - Docker Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "📥 Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "📥 Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker detected: $(docker --version)"
echo "✅ Docker Compose detected: $(docker-compose --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📋 Creating .env from .env.docker..."
    cp .env.docker .env
    echo "✅ Created .env file"
    echo "📝 Please update .env with your actual values!"
    echo ""
fi

# Start services
echo "🚀 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to become healthy..."
echo ""

# Check MongoDB
echo "Checking MongoDB..."
for i in {1..30}; do
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MongoDB failed to start"
        docker-compose logs mongodb
        exit 1
    fi
    sleep 1
done

# Check Redis
echo "Checking Redis..."
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        echo "✅ Redis is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Redis failed to start"
        docker-compose logs redis
        exit 1
    fi
    sleep 1
done

# Check Backend
echo "Checking Backend API..."
for i in {1..30}; do
    if curl -s http://localhost:8000 > /dev/null; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        docker-compose logs backend
        exit 1
    fi
    sleep 1
done

echo ""
echo "===================================="
echo "✅ All services are running!"
echo "===================================="
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🔗 Backend URL: http://localhost:8000"
echo "🗄️  MongoDB: localhost:27017"
echo "📦 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  - View logs:     docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart:       docker-compose restart"
echo "  - Shell access:  docker-compose exec backend sh"
echo ""
echo "✨ Happy coding!"
