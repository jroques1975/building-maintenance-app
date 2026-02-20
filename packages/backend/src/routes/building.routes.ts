import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateWithTenant, authorize } from '../middleware/auth-tenant.combined';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation schemas
const createBuildingSchema = z.object({
  name: z.string().min(1, 'Building name is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().min(5, 'Zip code is required').max(10),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  floors: z.number().int().min(1).max(200).optional(),
  totalUnits: z.number().int().min(1).max(5000).optional(),
  ownerId: z.string().optional(), // Building owner (different from manager)
  notes: z.string().max(1000).optional(),
});

const updateBuildingSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(2).max(2).optional(),
  zipCode: z.string().min(5).max(10).optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  floors: z.number().int().min(1).max(200).optional(),
  totalUnits: z.number().int().min(1).max(5000).optional(),
  ownerId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * @route GET /api/buildings
 * @desc Get all buildings for current tenant
 * @access MANAGER+
 */
router.get('/', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const buildings = await prisma.building.findMany({
      where: {
        tenantId: req.tenant.tenantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        yearBuilt: true,
        floors: true,
        totalUnits: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            units: true,
            issues: true,
            workOrders: true,
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      status: 'success',
      data: { buildings },
      meta: {
        count: buildings.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/buildings/:id
 * @desc Get single building by ID
 * @access MANAGER+ (must be in same tenant)
 */
router.get('/:id', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const building = await prisma.building.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        yearBuilt: true,
        floors: true,
        totalUnits: true,
        ownerId: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        units: {
          select: {
            id: true,
            unitNumber: true,
            type: true,
            squareFeet: true,
            bedrooms: true,
            bathrooms: true,
            currentTenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            unitNumber: 'asc',
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            phone: true,
          },
          orderBy: {
            lastName: 'asc',
          },
        },
        issues: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            status: true,
            createdAt: true,
          },
        },
        workOrders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            scheduledDate: true,
            completedDate: true,
          },
        },
      },
    });

    if (!building) {
      throw new AppError(404, 'Building not found or not accessible');
    }

    res.json({
      status: 'success',
      data: { building },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/buildings
 * @desc Create a new building
 * @access ADMIN+
 */
router.post('/', authenticateWithTenant, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const data = createBuildingSchema.parse(req.body);

    // Check if building with same address already exists in tenant
    const existingBuilding = await prisma.building.findFirst({
      where: {
        tenantId: req.tenant.tenantId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    });

    if (existingBuilding) {
      throw new AppError(409, 'A building with this address already exists');
    }

    const building = await prisma.building.create({
      data: {
        ...data,
        tenantId: req.tenant.tenantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        yearBuilt: true,
        floors: true,
        totalUnits: true,
        ownerId: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { building },
      message: 'Building created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/buildings/:id
 * @desc Update a building
 * @access ADMIN+
 */
router.put('/:id', authenticateWithTenant, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const data = updateBuildingSchema.parse(req.body);

    // Verify building exists and belongs to tenant
    const existingBuilding = await prisma.building.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
    });

    if (!existingBuilding) {
      throw new AppError(404, 'Building not found or not accessible');
    }

    const building = await prisma.building.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        yearBuilt: true,
        floors: true,
        totalUnits: true,
        ownerId: true,
        notes: true,
        updatedAt: true,
      },
    });

    res.json({
      status: 'success',
      data: { building },
      message: 'Building updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/buildings/:id
 * @desc Delete a building (soft delete via status)
 * @access ADMIN+
 */
router.delete('/:id', authenticateWithTenant, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    // Verify building exists and belongs to tenant
    const existingBuilding = await prisma.building.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
    });

    if (!existingBuilding) {
      throw new AppError(404, 'Building not found or not accessible');
    }

    // Check if building has active issues or work orders
    const activeItems = await prisma.$transaction([
      prisma.issue.count({
        where: {
          buildingId: req.params.id,
          status: { in: ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
      prisma.workOrder.count({
        where: {
          buildingId: req.params.id,
          status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
    ]);

    if (activeItems[0] > 0 || activeItems[1] > 0) {
      throw new AppError(400, 'Cannot delete building with active issues or work orders');
    }

    // In a real app, we'd soft delete or archive
    // For now, we'll delete (cascading deletes handled by Prisma)
    await prisma.building.delete({
      where: { id: req.params.id },
    });

    res.json({
      status: 'success',
      message: 'Building deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/buildings/:id/stats
 * @desc Get building statistics
 * @access MANAGER+
 */
router.get('/:id/stats', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    // Verify building exists and belongs to tenant
    const building = await prisma.building.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.tenant.tenantId,
      },
      select: { id: true },
    });

    if (!building) {
      throw new AppError(404, 'Building not found or not accessible');
    }

    const stats = await prisma.$transaction([
      // Issue counts by status
      prisma.issue.groupBy({
        by: ['status'],
        where: { buildingId: req.params.id },
        _count: true,
      }),
      // Work order counts by status
      prisma.workOrder.groupBy({
        by: ['status'],
        where: { buildingId: req.params.id },
        _count: true,
      }),
      // User counts by role
      prisma.user.groupBy({
        by: ['role'],
        where: { buildingId: req.params.id },
        _count: true,
      }),
      // Unit occupancy
      prisma.unit.count({
        where: { buildingId: req.params.id, currentTenantId: { not: null } },
      }),
      prisma.unit.count({
        where: { buildingId: req.params.id },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        issueStats: stats[0],
        workOrderStats: stats[1],
        userStats: stats[2],
        occupiedUnits: stats[3],
        totalUnits: stats[4],
        occupancyRate: stats[4] > 0 ? (stats[3] / stats[4]) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const buildingRoutes = router;