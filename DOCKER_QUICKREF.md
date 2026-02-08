# 🐳 Docker Quick Reference Guide

## Installation & Verification

```bash
# Install Docker Desktop
# Windows/Mac: https://www.docker.com/products/docker-desktop
# Linux: https://docs.docker.com/engine/install/

# Verify installation
docker --version
docker-compose --version
```

---

## ⚡ Quick Start (Recommended)

### Windows (PowerShell)

```powershell
# Navigate to backend directory
cd CleanEase-BackEnd-2

# Run one of these:

# Option 1: Use batch script
./start-docker.bat

# Option 2: Manual commands
docker-compose up -d
```

### Mac/Linux

```bash
# Navigate to backend directory
cd CleanEase-BackEnd-2

# Option 1: Use shell script
chmod +x start-docker.sh
./start-docker.sh

# Option 2: Manual commands
docker-compose up -d
```

---

## 📊 Essential Commands

| Command                          | Purpose                          |
| -------------------------------- | -------------------------------- |
| `docker-compose up -d`           | Start all services in background |
| `docker-compose down`            | Stop and remove containers       |
| `docker-compose ps`              | View service status              |
| `docker-compose logs -f`         | View real-time logs              |
| `docker-compose logs backend`    | View backend logs only           |
| `docker-compose restart`         | Restart all services             |
| `docker-compose exec backend sh` | Get shell access                 |
| `docker-compose pull`            | Update images                    |
| `docker-compose up -d --build`   | Rebuild and start                |

---

## 🔍 Troubleshooting

### Services won't start?

```bash
# Check logs
docker-compose logs

# Check what's using ports
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000

# Clean restart
docker-compose down -v
docker-compose up -d
```

### Want local databases instead?

Edit `docker-compose.yml`:

- Comment out `mongodb` service
- Comment out `redis` service
- Update backend `ATLAS_URI` in environment
- Update backend `REDIS_URL` in environment

### How to access containers?

```bash
# Backend shell
docker-compose exec backend sh

# MongoDB CLI
docker-compose exec mongodb mongosh cleanease

# Redis CLI
docker-compose exec redis redis-cli

# Run npm commands in backend
docker-compose exec backend npm list
docker-compose exec backend npm install package-name
```

---

## 🔐 Production Deployment

### Build image

```bash
docker build -t cleanease-backend:v1.0 .
```

### Push to registry

```bash
docker tag cleanease-backend:v1.0 username/cleanease-backend:v1.0
docker push username/cleanease-backend:v1.0
```

### Run on server

```bash
# Pull latest image
docker pull username/cleanease-backend:v1.0

# Use docker-compose with your image
docker-compose pull
docker-compose up -d
```

---

## 💾 Data Backup & Restore

### Backup MongoDB

```bash
docker-compose exec mongodb mongodump --out /bak
docker cp $(docker-compose ps -q mongodb):/bak ./backup
```

### Restore MongoDB

```bash
docker cp ./backup mongodb:/bak
docker-compose exec mongodb mongorestore /bak
```

### Backup Redis

```bash
docker-compose exec redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb ./backup/
```

---

## 📈 Performance Metrics

```bash
# CPU and Memory usage
docker stats

# Detailed resource info
docker inspect cleanease-backend

# Network stats
docker network stats cleanease-network
```

---

## 🔒 Security Tips

1. **Never commit secrets**

   ```bash
   # .env is in .gitignore
   ```

2. **Use strong JWT_SECRET**

   ```bash
   # Generate: openssl rand -base64 32
   ```

3. **Scan images**

   ```bash
   docker scan cleanease-backend:latest
   ```

4. **Update regularly**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📋 Configuration Files

- **Dockerfile** - Backend image specification
- **docker-compose.yml** - Service orchestration
- **.dockerignore** - Exclude files from image
- **.env** - Environment variables (don't commit!)
- **.env.docker** - Template for Docker env vars

---

## ✅ Verify Everything Works

```bash
# 1. Services running?
docker-compose ps

# 2. Logs clean?
docker-compose logs

# 3. API responds?
curl http://localhost:8000

# 4. Can register user?
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "username": "test",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

---

## 🚀 One-Liner Commands

```bash
# Complete setup from scratch
docker-compose down -v && docker-compose up -d --build

# View everything at once
docker-compose logs -f

# Clean everything
docker system prune -a --volumes

# Backup entire setup
docker-compose exec mongodb mongodump --out /bak && docker cp $(docker-compose ps -q mongodb):/bak ./backup

# Update all images
docker-compose pull && docker-compose up -d
```

---

**For detailed information**, see [DOCKER_SETUP.md](DOCKER_SETUP.md)
