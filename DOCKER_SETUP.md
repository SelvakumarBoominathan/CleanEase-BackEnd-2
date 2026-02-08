# CleanEase Backend - Docker Setup Guide

## 📦 Docker Installation & Setup

### Prerequisites

1. **Install Docker Desktop**
   - **Windows**: https://docs.docker.com/desktop/install/windows-install/
   - **Mac**: https://docs.docker.com/desktop/install/mac-install/
   - **Linux**: https://docs.docker.com/engine/install/

2. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

---

## 🚀 Quick Start with Docker

### 1. Build and Start All Services

```bash
# Navigate to backend directory
cd CleanEase-BackEnd-2

# Start all services (MongoDB, Redis, Backend)
docker-compose up -d

# Check if all services are running
docker-compose ps

# Expected output:
# NAME                    STATUS
# cleanease-mongodb       Up (healthy)
# cleanease-redis         Up (healthy)
# cleanease-backend       Up (healthy)
```

### 2. Verify Services are Running

```bash
# Check backend logs
docker-compose logs -f backend

# Expected output:
# ✅ Database connected successfully
# ✅ Connected to Redis
# 🚀 Server running on http://localhost:8000
```

### 3. Test the API

```bash
# Health check
curl http://localhost:8000

# Expected response:
# {"success":true,"message":"CleanEase Backend Server Running","environment":"production"}
```

---

## 📋 Docker Compose Services

### MongoDB (Port 27017)

- **Image**: mongo:7.0-alpine
- **Data Volume**: `mongodb_data`
- **Database**: cleanease
- **Health Check**: Every 10 seconds

### Redis (Port 6379)

- **Image**: redis:7-alpine
- **Data Volume**: `redis_data`
- **Health Check**: Every 10 seconds

### Backend API (Port 8000)

- **Build**: Local Dockerfile
- **Depends On**: MongoDB, Redis
- **Health Check**: Every 30 seconds
- **Restart**: Unless stopped

---

## 🔧 Useful Docker Commands

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100
```

### Stop Services

```bash
# Stop all services (keep data)
docker-compose stop

# Stop specific service
docker-compose stop backend

# Restart services
docker-compose restart
```

### Remove Services

```bash
# Stop and remove containers (keep data volumes)
docker-compose down

# Remove everything including data
docker-compose down -v

# Remove and rebuild
docker-compose down
docker-compose up -d --build
```

### Access Container Shell

```bash
# Backend shell
docker-compose exec backend sh

# MongoDB shell
docker-compose exec mongodb mongosh cleanease

# Redis CLI
docker-compose exec redis redis-cli

# Run npm commands
docker-compose exec backend npm list
```

### View Service Status

```bash
# Detailed information
docker-compose ps

# Resource usage
docker stats

# Network information
docker network ls
docker network inspect cleanease-network
```

---

## 📊 Manage Volumes

### View Volumes

```bash
docker volume ls | grep cleanease

# Output:
# cleanease-mongodb
# cleanease-redis
# etc.
```

### Inspect Volume

```bash
docker volume inspect cleanease-mongodb_data
```

### Backup Data

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /tmp/backup

# Backup Redis
docker-compose exec redis redis-cli BGSAVE
docker cpui cleanease-redis:/data/dump.rdb ./backup/
```

### Clean Unused Volumes

```bash
docker volume prune

# WARNING: This will delete unused volumes
```

---

## 🔐 Environment Variables

Create a `.env` file for sensitive data:

```env
# .env file (DO NOT commit to git)
NODE_ENV=production
JWT_SECRET=your-strong-secret-key-here
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

Docker Compose will automatically load variables from `.env` file.

---

## 🧪 Testing in Docker

### 1. Test User Registration

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

### 3. Test Employee List

```bash
curl http://localhost:8000/api/employees?page=1&limit=10
```

---

## 🐛 Troubleshooting

### Services Won't Start

**Check logs:**

```bash
docker-compose logs

# Look for errors in output
```

**Common Issues:**

1. **Port Already in Use**

   ```bash
   # Change ports in docker-compose.yml
   # Or kill process using the port
   lsof -i :8000  # Find process
   kill -9 <PID>  # Kill it
   ```

2. **Out of Disk Space**

   ```bash
   # Clean up unused Docker resources
   docker system prune -a
   ```

3. **Health Check Failing**
   ```bash
   # Wait longer for startup
   docker-compose up -d
   sleep 10
   docker-compose ps
   ```

### Can't Connect to Services

**Check networking:**

```bash
# Inspect network
docker network inspect cleanease-network

# Test connection from backend container
docker-compose exec backend ping redis
docker-compose exec backend ping mongodb
```

### Data Loss Issues

**Volumes deleted accidentally:**

```bash
# Restore from backup
docker-compose down
docker volume create cleanease-mongodb_data
# Restore backup files into volume
docker-compose up -d
```

---

## 📈 Performance Optimization

### 1. Memory Limits

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

### 2. Database Connection Pooling

```javascript
// Already configured in the code
// MongoDB connection reuse
// Redis connection pooling
```

### 3. Image Optimization

```dockerfile
# Using alpine base image (smaller)
FROM node:18-alpine

# Multi-stage build (if needed)
FROM node:18-alpine AS builder
# ... build steps ...

FROM node:18-alpine
COPY --from=builder /app/dist /app/dist
```

---

## 📚 Development Workflow

### Option 1: Docker for All Services

```bash
# Start everything in Docker
docker-compose up -d

# Edit code locally (hot reload needed in Dockerfile)
# Logs available via docker-compose logs -f
```

### Option 2: Docker for Database Only

```bash
# Start only MongoDB and Redis
docker-compose up -d mongodb redis

# Run backend locally for development
npm install
npm start

# MongoDB: localhost:27017
# Redis: localhost:6379
# Backend: localhost:8000
```

### Option 3: Local Development

```bash
# All services local
npm install
npm start

# Requires:
# - MongoDB running locally
# - Redis running locally
```

---

## 🔄 Update Dependencies

To update dependencies while using Docker:

```bash
# Update package.json locally
npm update

# Rebuild Docker image with new dependencies
docker-compose down
docker-compose up -d --build

# Verify update
docker-compose exec backend npm list
```

---

## 📦 Production Deployment

### 1. Build for Production

```bash
# Build optimized image
docker build -t cleanease-backend:latest .

# Test locally
docker run -p 8000:8000 cleanease-backend:latest
```

### 2. Push to Registry

```bash
# Tag for registry
docker tag cleanease-backend:latest yourusername/cleanease-backend:latest

# Push to Docker Hub
docker push yourusername/cleanease-backend:latest
```

### 3. Deploy to Server

```bash
# Pull image
docker pull yourusername/cleanease-backend:latest

# Use docker-compose on server
docker-compose pull
docker-compose up -d
```

---

## 🔍 Monitoring

### View Logs

```bash
# Real-time logs
docker-compose logs -f backend

# With timestamps
docker logs --timestamps cleanease-backend
```

### Check Health

```bash
# All services
docker-compose ps

# Specific service
docker inspect cleanease-backend --format='{{.State.Status}}'
```

### Monitor Resources

```bash
# CPU and Memory usage
docker stats

# Network I/O
docker network inspect cleanease-network
```

---

## 📝 Security Best Practices

1. **Never commit secrets**

   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use environment variables**

   ```bash
   # Create .env file
   cp .env.example .env
   # Update with real values
   ```

3. **Run as non-root**

   ```dockerfile
   # In Dockerfile
   RUN useradd -m -u 1000 node
   USER node
   ```

4. **Scan images for vulnerabilities**
   ```bash
   docker scan cleanease-backend:latest
   ```

---

## 🎯 Summary

**With Docker you get:**

- ✅ Consistent environments (dev, staging, prod)
- ✅ Easy dependency management
- ✅ No installation hassles
- ✅ Isolated services
- ✅ Easy scaling
- ✅ Production-ready setup

**Command Reference:**

```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose ps              # Status
docker-compose exec backend sh # Shell access
docker-compose restart         # Restart services
```

---

**Next Step**: Run `docker-compose up -d` and start developing! 🚀
