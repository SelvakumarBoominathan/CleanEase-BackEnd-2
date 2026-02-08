@echo off
REM CleanEase Backend - Docker Quick Start Script for Windows

echo 🐳 CleanEase Backend - Docker Setup
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed!
    echo 📥 Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker detected: 
docker --version
echo.
echo ✅ Docker Compose detected:
docker-compose --version
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo 📋 Creating .env from .env.docker...
    copy .env.docker .env
    echo ✅ Created .env file
    echo 📝 Please update .env with your actual values!
    echo.
)

REM Start services
echo 🚀 Starting Docker services...
docker-compose up -d

echo.
echo ⏳ Waiting for services to become healthy...
echo.
timeout /t 10 /nobreak

echo.
echo ====================================
echo ✅ All services should be starting!
echo ====================================
echo.
echo 📊 Service Status:
docker-compose ps
echo.
echo 🔗 Backend URL: http://localhost:8000
echo 🗄️  MongoDB: localhost:27017
echo 📦 Redis: localhost:6379
echo.
echo 📋 Useful commands:
echo   - View logs:     docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Restart:       docker-compose restart
echo   - Shell access:  docker-compose exec backend sh
echo.
echo ✨ Happy coding!
echo.
pause
