import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateWithTenant, authorize, getRequestPrisma } from '../middleware/auth-tenant.combined';
import { AppError } from '../middleware/errorHandler';
import { AuthService } from '../utils/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM']).optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM']).optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED', 'ARCHIVED']).optional(),
  settings: z.record(z.any()).optional(),
});

/**
 * PUBLIC ROUTES
 */

// Create new tenant (sign up)
router.post('/signup', async (req, res, next) => {
  try {
    // Validate request
    const validatedData = createTenantSchema.parse(req.body);

    // Check if subdomain is available
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain: validatedData.subdomain },
    });

    if (existingTenant) {
      throw new AppError(400, 'Subdomain already taken');
    }

    // Check if email is already used
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.adminEmail },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.name,
          subdomain: validatedData.subdomain,
          plan: validatedData.plan || 'STARTER',
          status: 'TRIAL', // Start with trial
          settings: {
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            createdAt: new Date().toISOString(),
          },
        },
      });

      // Create admin user
      const hashedPassword = await AuthService.hashPassword(validatedData.adminPassword);
      
      const adminUser = await tx.user.create({
        data: {
          email: validatedData.adminEmail,
          firstName: validatedData.adminFirstName,
          lastName: validatedData.adminLastName,
          role: 'ADMIN',
          tenantId: tenant.id,
          // Password will be stored separately in a real app
          // For now, we'll store a placeholder
        },
      });

      // Create default building
      const defaultBuilding = await tx.building.create({
        data: {
          name: `${validatedData.name} Main Building`,
          address: 'To be updated',
          city: 'To be updated',
          state: 'To be updated',
          zipCode: '00000',
          managerId: adminUser.id,
          tenantId: tenant.id,
        },
      });

      // Update admin user with building
      await tx.user.update({
        where: { id: adminUser.id },
        data: { buildingId: defaultBuilding.id },
      });

      return { tenant, adminUser, defaultBuilding };
    });

    // Generate JWT token for the new admin
    const token = AuthService.generateToken({
      userId: result.adminUser.id,
      email: result.adminUser.email,
      role: result.adminUser.role,
      tenantId: result.tenant.id,
      tenantPlan: result.tenant.plan,
    });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
        plan: result.tenant.plan,
        status: result.tenant.status,
      },
      user: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        firstName: result.adminUser.firstName,
        lastName: result.adminUser.lastName,
        role: result.adminUser.role,
      },
      building: {
        id: result.defaultBuilding.id,
        name: result.defaultBuilding.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
});

// Check subdomain availability
router.get('/check-subdomain/:subdomain', async (req, res, next) => {
  try {
    const { subdomain } = req.params;
    
    if (!subdomain.match(/^[a-z0-9-]+$/)) {
      throw new AppError(400, 'Subdomain can only contain lowercase letters, numbers, and hyphens');
    }

    const existing = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    res.json({
      available: !existing,
      subdomain,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * TENANT-ADMIN ROUTES (require authentication)
 */

// Get current tenant info
router.get('/me', authenticateWithTenant, authorize(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenant.tenantId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        plan: true,
        status: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            buildings: true,
            issues: true,
            workOrders: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

// Update tenant
router.patch('/me', authenticateWithTenant, authorize(['ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const validatedData = updateTenantSchema.parse(req.body);

    // Don't allow changing subdomain via this route
    if (validatedData.subdomain) {
      delete validatedData.subdomain;
    }

    const tenant = await prisma.tenant.update({
      where: { id: req.tenant.tenantId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        subdomain: true,
        plan: true,
        status: true,
        settings: true,
        updatedAt: true,
      },
    });

    res.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
});

// Get tenant usage statistics
router.get('/stats', authenticateWithTenant, authorize(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const tenantPrisma = getRequestPrisma(req);

    const [
      userCount,
      buildingCount,
      activeIssues,
      completedIssuesThisMonth,
      activeWorkOrders,
      completedWorkOrdersThisMonth,
    ] = await Promise.all([
      tenantPrisma.user.count(),
      tenantPrisma.building.count(),
      tenantPrisma.issue.count({ where: { status: { not: 'COMPLETED' } } }),
      tenantPrisma.issue.count({
        where: {
          status: 'COMPLETED',
          completedDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      tenantPrisma.workOrder.count({ where: { status: { not: 'COMPLETED' } } }),
      tenantPrisma.workOrder.count({
        where: {
          status: 'COMPLETED',
          completedDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    res.json({
      users: userCount,
      buildings: buildingCount,
      activeIssues,
      completedIssuesThisMonth,
      activeWorkOrders,
      completedWorkOrdersThisMonth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Get tenant users
router.get('/users', authenticateWithTenant, authorize(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const { page = 1, limit = 20, role, buildingId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const tenantPrisma = getRequestPrisma(req);

    const where: any = {};
    if (role) where.role = role;
    if (buildingId) where.buildingId = buildingId;

    const [users, total] = await Promise.all([
      tenantPrisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          buildingId: true,
          apartment: true,
          createdAt: true,
          building: {
            select: {
              name: true,
            },
          },
        },
      }),
      tenantPrisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get tenant buildings
router.get('/buildings', authenticateWithTenant, authorize(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const tenantPrisma = getRequestPrisma(req);

    const buildings = await tenantPrisma.building.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        units: true,
        managerId: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
            issues: true,
            workOrders: true,
          },
        },
      },
    });

    res.json(buildings);
  } catch (error) {
    next(error);
  }
});

/**
 * SUPER ADMIN ROUTES
 */

// List all tenants (super admin only)
router.get('/', authenticateWithTenant, authorize(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, plan } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (plan) where.plan = plan;

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          subdomain: true,
          plan: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              buildings: true,
              issues: true,
              workOrders: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    res.json({
      tenants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get specific tenant (super admin)
router.get('/:tenantId', authenticateWithTenant, authorize(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        plan: true,
        status: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            buildings: true,
            issues: true,
            workOrders: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

// Update tenant (super admin)
router.patch('/:tenantId', authenticateWithTenant, authorize(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const validatedData = updateTenantSchema.parse(req.body);

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        subdomain: true,
        plan: true,
        status: true,
        settings: true,
        updatedAt: true,
      },
    });

    res.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
});

export default router;