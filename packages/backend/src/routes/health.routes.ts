import { Router } from 'express';
import { prisma } from '../prisma/client';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Building Maintenance API',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/database', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/routes', (req, res) => {
  const routes = [
    { path: '/api/health', methods: ['GET'], description: 'Health check' },
    { path: '/api/health/database', methods: ['GET'], description: 'Database health check' },
    { path: '/api/health/routes', methods: ['GET'], description: 'List all API routes' },
    { path: '/api/auth/register', methods: ['POST'], description: 'Register new user' },
    { path: '/api/auth/login', methods: ['POST'], description: 'User login' },
    { path: '/api/users', methods: ['GET', 'POST'], description: 'List/Create users' },
    { path: '/api/users/:id', methods: ['GET', 'PUT', 'DELETE'], description: 'User CRUD' },
    { path: '/api/buildings', methods: ['GET', 'POST'], description: 'List/Create buildings' },
    { path: '/api/buildings/:id', methods: ['GET', 'PUT', 'DELETE'], description: 'Building CRUD' },
    { path: '/api/issues', methods: ['GET', 'POST'], description: 'List/Create issues' },
    { path: '/api/issues/:id', methods: ['GET', 'PUT', 'DELETE'], description: 'Issue CRUD' },
    { path: '/api/work-orders', methods: ['GET', 'POST'], description: 'List/Create work orders' },
    { path: '/api/work-orders/:id', methods: ['GET', 'PUT', 'DELETE'], description: 'Work order CRUD' },
  ];
  
  res.json({
    status: 'ok',
    routes,
  });
});

export const healthRoutes = router;