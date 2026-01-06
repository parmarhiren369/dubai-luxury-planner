# Deployment Guide

This guide explains how to deploy the WTB Tourism Management System using Docker.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 2GB of free disk space
- Ports 3000, 5000, and 27017 available

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd 2f
```

### 2. Configure Environment Variables

The backend requires environment variables. Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` if needed. The default values work for Docker deployment.

### 3. Build and Start All Services

```bash
# Build all Docker images
docker-compose build

# Start all services in detached mode
docker-compose up -d
```

This will start:
- **MongoDB** on port 27017
- **Backend API** on port 5000
- **Frontend** on port 3000

### 4. Verify Deployment

Check that all containers are running:

```bash
docker-compose ps
```

You should see three containers: `wtb-mongo`, `wtb-backend`, and `wtb-frontend`.

Test the backend health:

```bash
curl http://localhost:5000/health
```

Open your browser to [http://localhost:3000](http://localhost:3000)

## Data Persistence

MongoDB data is stored in a Docker volume named `mongo_data`. This means:

- ✅ Data persists across container restarts
- ✅ Data persists when you stop and start services
- ✅ Data persists when you rebuild images

To completely reset the database:

```bash
docker-compose down -v  # WARNING: This deletes all data!
```

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services

```bash
# Stop all services (data persists)
docker-compose stop

# Stop and remove containers (data persists in volume)
docker-compose down
```

### Rebuild After Code Changes

```bash
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

## Troubleshooting

### Issue: 404 Error on Page Reload

**Solution**: This should be fixed with the nginx configuration. If you still see 404s:

1. Check nginx logs: `docker-compose logs frontend`
2. Verify nginx config is copied: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf`

### Issue: Cannot Connect to Backend

**Symptoms**: API calls fail, network errors in browser console

**Solution**:

1. Verify backend is running: `docker-compose ps backend`
2. Check backend logs: `docker-compose logs backend`
3. Test backend directly: `curl http://localhost:5000/health`
4. Verify CORS configuration allows `http://localhost:3000`

### Issue: Data Not Persisting

**Symptoms**: Data disappears after restart

**Solution**:

1. Verify volume exists: `docker volume ls | grep mongo_data`
2. Check MongoDB logs: `docker-compose logs mongo`
3. Ensure you're not using `docker-compose down -v` which deletes volumes

### Issue: Port Already in Use

**Symptoms**: Error: "port is already allocated"

**Solution**:

```bash
# Find what's using the port (e.g., 3000)
lsof -i :3000

# Kill the process or change the port in docker-compose.yml
# For example, change "3000:80" to "3001:80"
```

### Issue: Container Keeps Restarting

**Solution**:

1. Check logs: `docker-compose logs <service-name>`
2. Common causes:
   - Backend: MongoDB connection failed
   - Frontend: Build failed
   - MongoDB: Insufficient disk space

## Production Deployment

### Environment Variables

For production, update these environment variables:

**Backend (`server/.env`)**:
```env
NODE_ENV=production
MONGODB_URI=mongodb://mongo:27017/wtb-tourism
FRONTEND_URL=https://your-domain.com
```

**Docker Compose**:
```yaml
environment:
  VITE_API_URL: https://api.your-domain.com/api
```

### Security Considerations

1. **Use HTTPS**: Deploy behind a reverse proxy (nginx, Caddy, Traefik)
2. **Secure MongoDB**: 
   - Enable authentication
   - Use strong passwords
   - Don't expose port 27017 publicly
3. **Environment Variables**: Use Docker secrets or environment files
4. **Regular Backups**: Backup the MongoDB volume regularly

### Reverse Proxy Example (nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/docker-build.yml`) that:

- ✅ Runs on every push to main/master
- ✅ Tests backend and frontend builds
- ✅ Builds Docker images
- ✅ Validates docker-compose configuration

To enable Docker Hub publishing:

1. Add secrets to your GitHub repository:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password/token

2. Uncomment the `push-docker` job in `.github/workflows/docker-build.yml`

## Monitoring

### Health Checks

- Backend: `http://localhost:5000/health`
- Frontend: `http://localhost:3000/health`

### Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## Backup and Restore

### Backup MongoDB Data

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose exec -T mongo mongodump --archive > backups/backup-$(date +%Y%m%d-%H%M%S).archive
```

### Restore MongoDB Data

```bash
# Restore from backup
docker-compose exec -T mongo mongorestore --archive < backups/backup-20260106-123456.archive
```

## Support

For issues and questions:

1. Check the logs: `docker-compose logs`
2. Review this troubleshooting guide
3. Check GitHub Issues
4. Refer to application documentation in the repository

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)
- [Nginx Docker Documentation](https://hub.docker.com/_/nginx)
