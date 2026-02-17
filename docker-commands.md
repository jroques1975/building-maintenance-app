# Docker Commands for Building Maintenance App

## Quick Start

### 1. Start all services (development mode)
```bash
docker-compose up
```

### 2. Start services in background
```bash
docker-compose up -d
```

### 3. View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f web
```

### 4. Stop services
```bash
docker-compose down
```

### 5. Stop and remove volumes (cleans database)
```bash
docker-compose down -v
```

## Individual Service Management

### Backend API
```bash
# Build backend image
docker-compose build backend

# Run backend only
docker-compose up backend

# Run backend with dependencies
docker-compose up backend postgres

# Access backend container
docker-compose exec backend sh
```

### Database (PostgreSQL)
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U building_user -d building_maintenance

# Backup database
docker-compose exec postgres pg_dump -U building_user building_maintenance > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U building_user -d building_maintenance
```

### Prisma Studio (Database GUI)
```bash
# Open Prisma Studio at http://localhost:5555
docker-compose up prisma-studio
```

### Web Frontend
```bash
# Build web image
docker-compose build web

# Run web only
docker-compose up web
```

## Development Workflow

### 1. First-time setup
```bash
# Clone the repository
git clone <repository-url>
cd building-maintenance-app

# Start all services
docker-compose up -d

# Wait for services to start, then run database migrations
docker-compose exec backend npm run prisma:migrate

# Seed database (if seed script exists)
docker-compose exec backend npm run prisma:seed
```

### 2. Development with hot reload
```bash
# Start development environment
docker-compose up

# Make code changes - they will automatically reload
```

### 3. Running tests
```bash
# Run backend tests
docker-compose exec backend npm run test

# Run web tests
docker-compose exec web npm run test
```

### 4. Database operations
```bash
# Create new migration
docker-compose exec backend npx prisma migrate dev --name migration_name

# Reset database
docker-compose exec backend npx prisma migrate reset

# Open Prisma Studio (database GUI)
# Visit http://localhost:5555
```

## Production Deployment

### 1. Build production images
```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Run production environment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. View production logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   lsof -i :5432
   lsof -i :5173
   
   # Or change ports in docker-compose.yml
   ```

2. **Database connection issues**
   ```bash
   # Check if database is running
   docker-compose ps postgres
   
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres pg_isready -U building_user -d building_maintenance
   ```

3. **Container won't start**
   ```bash
   # Rebuild images
   docker-compose build --no-cache
   
   # Remove all containers and volumes
   docker-compose down -v
   docker system prune -a
   
   # Start fresh
   docker-compose up
   ```

4. **Prisma migration issues**
   ```bash
   # Reset database
   docker-compose exec backend npx prisma migrate reset --force
   
   # Generate fresh Prisma client
   docker-compose exec backend npx prisma generate
   ```

### Useful Docker Commands

```bash
# List all containers
docker ps -a

# List all images
docker images

# Remove unused containers, networks, images
docker system prune

# View resource usage
docker stats

# Clean everything (warning: removes all containers, images, volumes)
docker system prune -a --volumes
```

## Service URLs

- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/health
- **Web Frontend:** http://localhost:5173
- **Prisma Studio:** http://localhost:5555
- **PostgreSQL:** localhost:5432

## Environment Variables

Create `.env` files in each service directory:

### Backend (.env)
```env
DATABASE_URL=postgresql://building_user:building_password@postgres:5432/building_maintenance
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3001
```

### Web (.env)
```env
VITE_API_URL=http://localhost:3001/api
```