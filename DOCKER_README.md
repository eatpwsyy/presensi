# Docker Setup for Presensi

This directory contains Docker configuration for the Presensi school attendance system.

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Development Environment
```bash
# Start development environment with hot reloading
./docker-setup.sh dev

# View logs
./docker-setup.sh logs

# Stop development environment
./docker-setup.sh stop
```

### Production Environment
```bash
# Start production environment
./docker-setup.sh prod

# Stop production environment
./docker-setup.sh stop
```

## Services

### Backend (Go + Gin)
- **Port**: 8080
- **Health Check**: `http://localhost:8080/api/health`
- **Database**: SQLite (persistent volume)
- **Hot Reload**: Enabled in development mode using Air

### Frontend (Next.js 15)
- **Port**: 3000
- **Health Check**: `http://localhost:3000`
- **Hot Reload**: Enabled in development mode

## Environment Variables

### Backend
- `DATABASE_PATH`: Path to SQLite database file
- `JWT_SECRET`: Secret key for JWT tokens
- `GIN_MODE`: Gin framework mode (debug/release)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time features

## Data Persistence

- Backend database is stored in Docker volumes
- Development: `backend_dev_data`
- Production: `backend_data`

## Available Commands

```bash
./docker-setup.sh dev      # Start development environment
./docker-setup.sh prod     # Start production environment
./docker-setup.sh build    # Build all Docker images
./docker-setup.sh stop     # Stop all containers
./docker-setup.sh clean    # Remove all containers and images
./docker-setup.sh logs     # Show logs from all services
./docker-setup.sh help     # Show help message
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   ./docker-setup.sh dev
   ```

2. **Make Changes**
   - Backend changes trigger automatic rebuild (via Air)
   - Frontend changes trigger hot reload (via Next.js dev mode)

3. **View Logs**
   ```bash
   # All services
   ./docker-setup.sh logs
   
   # Specific service
   docker logs -f presensi-backend-dev-1
   docker logs -f presensi-frontend-dev-1
   ```

4. **Stop Environment**
   ```bash
   ./docker-setup.sh stop
   ```

## Production Deployment

1. **Build Images**
   ```bash
   ./docker-setup.sh build
   ```

2. **Start Production**
   ```bash
   ./docker-setup.sh prod
   ```

3. **Monitor**
   ```bash
   ./docker-setup.sh logs
   ```

## Troubleshooting

### Container Won't Start
- Check logs: `docker logs <container-name>`
- Verify ports are not in use: `netstat -tlnp | grep :3000`
- Clean and rebuild: `./docker-setup.sh clean && ./docker-setup.sh build`

### Database Issues
- Check volume mounts: `docker volume ls`
- Reset database: `docker volume rm presensi_backend_data`

### Network Issues
- Check if services can communicate: `docker network ls`
- Restart Docker daemon if needed

## Security Notes

- Change `JWT_SECRET` in production
- Use environment files for sensitive data
- Consider using Docker secrets for production deployment
- Regularly update base images for security patches