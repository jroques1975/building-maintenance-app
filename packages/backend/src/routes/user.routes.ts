import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateWithTenant, authorize } from '../middleware/auth-tenant.combined';
import { UserRole } from '@prisma/client';
import { AuthService } from '../utils/auth';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  buildingId: z.string().optional(),
  unitId: z.string().optional(),
  apartment: z.string().optional(),
  employeeId: z.string().optional(),
  position: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  buildingId: z.string().optional(),
  unitId: z.string().optional(),
  apartment: z.string().optional(),
  employeeId: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
});

const filterUsersSchema = z.object({
  buildingId: z.string().optional(),
  unitId: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * @route GET /api/users
 * @desc Get users with filtering (role-based access)
 * @access MANAGER+ (admins see all, managers see their building users)
 */
router.get('/', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const filters = filterUsersSchema.parse({
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    // Build where clause
    const where: any = {
      tenantId: req.tenant.tenantId,
    };

    // Role-based filtering
    if (req.user.role === 'MANAGER') {
      // Managers can only see users in buildings they manage
      // For now, we'll check if user has buildingId assigned
      if (req.user.buildingId) {
        where.buildingId = req.user.buildingId;
      } else {
        // Manager without building assignment can't see any users
        where.id = 'no-access';
      }
    }

    // Apply filters
    if (filters.buildingId) where.buildingId = filters.buildingId;
    if (filters.unitId) where.unitId = filters.unitId;
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          buildingId: true,
          unitId: true,
          apartment: true,
          employeeId: true,
          position: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          building: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              type: true,
            },
          },
          _count: {
            select: {
              submittedIssues: true,
              assignedWorkOrders: true,
            },
          },
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { users },
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get single user by ID
 * @access Role-based (users can see own, managers/admins based on scope)
 */
router.get('/:id', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Users can always see their own profile
    if (req.user.userId === req.params.id) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.params.id,
          tenantId: req.tenant.tenantId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          buildingId: true,
          unitId: true,
          apartment: true,
          employeeId: true,
          position: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          building: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              type: true,
              squareFeet: true,
              bedrooms: true,
              bathrooms: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      return res.json({
        status: 'success',
        data: { user },
      });
    }

    // For viewing other users, need appropriate permissions
    if (req.user.role === 'TENANT' || req.user.role === 'MAINTENANCE') {
      throw new AppError(403, 'Not authorized to view other users');
    }

    // MANAGER+ can view other users
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        buildingId: true,
        unitId: true,
        apartment: true,
        employeeId: true,
        position: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            type: true,
            squareFeet: true,
            bedrooms: true,
            bathrooms: true,
          },
        },
        _count: {
          select: {
            submittedIssues: true,
            assignedWorkOrders: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Managers can only see users in their building
    if (req.user.role === 'MANAGER') {
      if (req.user.buildingId && user.buildingId !== req.user.buildingId) {
        throw new AppError(403, 'Not authorized to view users in other buildings');
      }
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/users
 * @desc Create a new user (admin function)
 * @access ADMIN+
 */
router.post('/', authenticateWithTenant, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = createUserSchema.parse(req.body);

    // Check if email already exists in tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId: req.tenant.tenantId,
      },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = AuthService.validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.message!);
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(data.password);

    // Validate building/unit if provided
    if (data.buildingId) {
      const building = await prisma.building.findFirst({
        where: {
          id: data.buildingId,
          tenantId: req.tenant.tenantId,
        },
      });

      if (!building) {
        throw new AppError(404, 'Building not found in tenant');
      }

      if (data.unitId) {
        const unit = await prisma.unit.findFirst({
          where: {
            id: data.unitId,
            buildingId: data.buildingId,
          },
        });

        if (!unit) {
          throw new AppError(404, 'Unit not found in building');
        }
      }
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        buildingId: data.buildingId,
        unitId: data.unitId,
        apartment: data.apartment,
        employeeId: data.employeeId,
        position: data.position,
        tenantId: req.tenant.tenantId,
        isActive: true,
        // In real app, store hashedPassword
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        buildingId: true,
        unitId: true,
        apartment: true,
        employeeId: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { user },
      message: 'User created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Role-based (users can update own, admins can update any)
 */
router.put('/:id', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = updateUserSchema.parse(req.body);

    // Get existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
    });

    if (!existingUser) {
      throw new AppError(404, 'User not found');
    }

    // Permission checking
    const isSelf = req.user.userId === req.params.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    // Users can only update their own profile unless they're admin
    if (!isSelf && !isAdmin) {
      throw new AppError(403, 'Not authorized to update other users');
    }

    // Non-admins have restrictions
    if (!isAdmin) {
      // Can't change role
      if (data.role && data.role !== existingUser.role) {
        throw new AppError(403, 'Cannot change your own role');
      }
      // Can't change building/unit without proper permissions
      if (data.buildingId || data.unitId) {
        throw new AppError(403, 'Cannot change building/unit assignment');
      }
      // Can't deactivate/reactivate
      if (data.isActive !== undefined) {
        throw new AppError(403, 'Cannot change active status');
      }
    }

    // If changing email, check for duplicates
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          tenantId: req.tenant.tenantId,
          NOT: { id: req.params.id },
        },
      });

      if (emailExists) {
        throw new AppError(409, 'Email already in use by another user');
      }
    }

    // Validate building/unit if provided
    if (data.buildingId) {
      const building = await prisma.building.findFirst({
        where: {
          id: data.buildingId,
          tenantId: req.tenant.tenantId,
        },
      });

      if (!building) {
        throw new AppError(404, 'Building not found in tenant');
      }

      if (data.unitId) {
        const unit = await prisma.unit.findFirst({
          where: {
            id: data.unitId,
            buildingId: data.buildingId,
          },
        });

        if (!unit) {
          throw new AppError(404, 'Unit not found in building');
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        buildingId: true,
        unitId: true,
        apartment: true,
        employeeId: true,
        position: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      status: 'success',
      data: { user },
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Deactivate a user (soft delete)
 * @access ADMIN+
 */
router.delete('/:id', authenticateWithTenant, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Cannot delete yourself
    if (req.user.userId === req.params.id) {
      throw new AppError(400, 'Cannot delete your own account');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check if user has active issues or work orders
    const activeItems = await prisma.$transaction([
      prisma.issue.count({
        where: {
          OR: [
            { submittedById: req.params.id, status: { in: ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS'] } },
            { assignedToId: req.params.id, status: { in: ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS'] } },
          ],
        },
      }),
      prisma.workOrder.count({
        where: {
          assignedToId: req.params.id,
          status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
    ]);

    if (activeItems[0] > 0 || activeItems[1] > 0) {
      throw new AppError(400, 'Cannot deactivate user with active issues or work orders');
    }

    // Soft delete: set isActive to false
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({
      status: 'success',
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users/stats/summary
 * @desc Get user statistics
 * @access MANAGER+
 */
router.get('/stats/summary', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const stats = await prisma.$transaction([
      // Total users
      prisma.user.count({
        where: { tenantId: req.tenant.tenantId },
      }),
      // Active users
      prisma.user.count({
        where: { tenantId: req.tenant.tenantId, isActive: true },
      }),
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        where: { tenantId: req.tenant.tenantId, isActive: true },
        _count: true,
      }),
      // Users by building
      prisma.user.groupBy({
        by: ['buildingId'],
        where: { tenantId: req.tenant.tenantId, isActive: true, buildingId: { not: null } },
        _count: true,
      }),
      // Recent signups (last 30 days)
      prisma.user.count({
        where: {
          tenantId: req.tenant.tenantId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get building names for building stats
    const buildingStats = await Promise.all(
      stats[3].map(async (stat) => {
        const building = await prisma.building.findUnique({
          where: { id: stat.buildingId! },
          select: { name: true },
        });
        return {
          buildingId: stat.buildingId,
          buildingName: building?.name || 'Unknown',
          count: stat._count,
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        totalUsers: stats[0],
        activeUsers: stats[1],
        usersByRole: stats[2],
        usersByBuilding: buildingStats,
        recentSignups: stats[4],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/users/:id/role
 * @desc Update user role (admin function)
 * @access ADMIN+
 */
router.put('/:id/role', authenticateWithTenant, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const roleSchema = z.object({
      role: z.nativeEnum(UserRole),
    });

    const data = roleSchema.parse(req.body);

    // Cannot change your own role
    if (req.user.userId === req.params.id) {
      throw new AppError(400, 'Cannot change your own role');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      status: 'success',
      data: { user: updatedUser },
      message: 'User role updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export const userRoutes = router;