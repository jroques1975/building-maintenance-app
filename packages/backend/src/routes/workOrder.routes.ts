import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateWithTenant, authorize } from '../middleware/auth-tenant.combined';
import { UserRole, WorkOrderStatus, WorkOrderPriority } from '../types/prisma-enums';

const router = Router();

// Validation schemas
const createWorkOrderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  issueId: z.string().optional(),
  buildingId: z.string().min(1, 'Building ID is required'),
  unitId: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.nativeEnum(WorkOrderPriority).default('MEDIUM'),
  status: z.nativeEnum(WorkOrderStatus).default('PENDING'),
  scheduledDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  estimatedCost: z.number().min(0).max(1000000).optional(),
  notes: z.string().max(1000).optional(),
});

const updateWorkOrderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  assignedToId: z.string().optional(),
  priority: z.nativeEnum(WorkOrderPriority).optional(),
  status: z.nativeEnum(WorkOrderStatus).optional(),
  scheduledDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  actualHours: z.number().min(0).max(1000).optional(),
  estimatedCost: z.number().min(0).max(1000000).optional(),
  actualCost: z.number().min(0).max(1000000).optional(),
  notes: z.string().max(1000).optional(),
});

const filterWorkOrdersSchema = z.object({
  buildingId: z.string().optional(),
  unitId: z.string().optional(),
  issueId: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.nativeEnum(WorkOrderPriority).optional(),
  status: z.nativeEnum(WorkOrderStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * @route POST /api/work-orders
 * @desc Create a new work order
 * @access MANAGER+ (Maintenance can't create, only update)
 */
router.post('/', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = createWorkOrderSchema.parse(req.body);

    // Verify building belongs to tenant
    const building = await prisma.building.findFirst({
      where: {
        id: data.buildingId,
        currentManagementId: req.tenant.tenantId,
      },
    });

    if (!building) {
      throw new AppError(404, 'Building not found or not accessible');
    }

    // If unitId provided, verify it belongs to building
    if (data.unitId) {
      const unit = await prisma.unit.findFirst({
        where: {
          id: data.unitId,
          buildingId: data.buildingId,
        },
      });

      if (!unit) {
        throw new AppError(404, 'Unit not found in this building');
      }
    }

    let linkedIssue: { id: string; operatorPeriodId: string | null } | null = null;

    // If issueId provided, verify it exists and belongs to tenant
    if (data.issueId) {
      linkedIssue = await prisma.issue.findFirst({
        where: {
          id: data.issueId,
          building: {
            currentManagementId: req.tenant.tenantId,
          },
        },
        select: {
          id: true,
          operatorPeriodId: true,
        },
      });

      if (!linkedIssue) {
        throw new AppError(404, 'Issue not found or not accessible');
      }
    }

    // If assignedToId provided, verify user belongs to tenant and has appropriate role
    if (data.assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assignedToId,
          managementCompanyId: req.tenant.tenantId,
          role: { in: ['MAINTENANCE', 'MANAGER', 'ADMIN'] },
        },
      });

      if (!assignee) {
        throw new AppError(404, 'Assignee not found or not authorized for work orders');
      }
    }

    const activeOperatorPeriod = await prisma.buildingOperatorPeriod.findFirst({
      where: {
        buildingId: data.buildingId,
        status: 'ACTIVE',
      },
      orderBy: { startDate: 'desc' },
      select: { id: true },
    });

    const workOrder = await prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        issueId: data.issueId,
        buildingId: data.buildingId,
        unitId: data.unitId,
        assignedToId: data.assignedToId,
        operatorPeriodId: linkedIssue?.operatorPeriodId ?? activeOperatorPeriod?.id ?? null,
        priority: data.priority,
        status: data.status,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        estimatedHours: data.estimatedHours,
        estimatedCost: data.estimatedCost,
        notes: data.notes,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        buildingId: true,
        unitId: true,
        issueId: true,
        assignedToId: true,
        scheduledDate: true,
        estimatedHours: true,
        estimatedCost: true,
        notes: true,
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
        issue: {
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            status: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { workOrder },
      message: 'Work order created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/work-orders
 * @desc Get work orders with filtering
 * @access MAINTENANCE+ (role-based filtering)
 */
router.get('/', authenticateWithTenant, authorize(['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const filters = filterWorkOrdersSchema.parse({
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    // Build where clause
    const where: any = {
      building: {
        currentManagementId: req.tenant.tenantId,
      },
    };

    // Role-based filtering
    if (req.user.role === 'MAINTENANCE') {
      // Maintenance can only see work orders assigned to them
      where.assignedToId = req.user.userId;
    }

    // Apply filters
    if (filters.buildingId) where.buildingId = filters.buildingId;
    if (filters.unitId) where.unitId = filters.unitId;
    if (filters.issueId) where.issueId = filters.issueId;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [workOrders, total] = await prisma.$transaction([
      prisma.workOrder.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          buildingId: true,
          unitId: true,
          issueId: true,
          assignedToId: true,
          scheduledDate: true,
          startDate: true,
          completedDate: true,
          estimatedHours: true,
          actualHours: true,
          estimatedCost: true,
          actualCost: true,
          notes: true,
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
          issue: {
            select: {
              id: true,
              title: true,
              category: true,
              priority: true,
              status: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.workOrder.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { workOrders },
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
 * @route GET /api/work-orders/my-work
 * @desc Get work orders assigned to current user
 * @access MAINTENANCE+
 */
router.get('/my-work', authenticateWithTenant, authorize(['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const filters = filterWorkOrdersSchema.parse({
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    const where: any = {
      building: {
        currentManagementId: req.tenant.tenantId,
      },
      assignedToId: req.user.userId,
    };

    // Apply filters
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [workOrders, total] = await prisma.$transaction([
      prisma.workOrder.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          buildingId: true,
          unitId: true,
          issueId: true,
          scheduledDate: true,
          startDate: true,
          completedDate: true,
          estimatedHours: true,
          actualHours: true,
          estimatedCost: true,
          actualCost: true,
          notes: true,
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
          issue: {
            select: {
              id: true,
              title: true,
              category: true,
              priority: true,
              status: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { scheduledDate: 'asc' },
        ],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.workOrder.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { workOrders },
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
 * @route GET /api/work-orders/:id
 * @desc Get single work order by ID
 * @access Role-based (maintenance can only see assigned)
 */
router.get('/:id', authenticateWithTenant, authorize(['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: req.params.id,
        building: {
          currentManagementId: req.tenant.tenantId,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        buildingId: true,
        unitId: true,
        issueId: true,
        assignedToId: true,
        scheduledDate: true,
        startDate: true,
        completedDate: true,
        estimatedHours: true,
        actualHours: true,
        estimatedCost: true,
        actualCost: true,
        notes: true,
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
        issue: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            priority: true,
            status: true,
            submittedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            url: true,
            createdAt: true,
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!workOrder) {
      throw new AppError(404, 'Work order not found or not accessible');
    }

    // Role-based access control
    if (req.user.role === 'MAINTENANCE' && workOrder.assignedToId !== req.user.userId) {
      throw new AppError(403, 'Not authorized to view this work order');
    }

    res.json({
      status: 'success',
      data: { workOrder },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/work-orders/:id
 * @desc Update a work order
 * @access Role-based (maintenance can only update assigned)
 */
router.put('/:id', authenticateWithTenant, authorize(['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = updateWorkOrderSchema.parse(req.body);

    // Get existing work order with tenant validation
    const existingWorkOrder = await prisma.workOrder.findFirst({
      where: {
        id: req.params.id,
        building: {
          currentManagementId: req.tenant.tenantId,
        },
      },
      include: {
        assignedTo: true,
      },
    });

    if (!existingWorkOrder) {
      throw new AppError(404, 'Work order not found or not accessible');
    }

    // Role-based update permissions
    if (req.user.role === 'MAINTENANCE') {
      // Maintenance can only update work orders assigned to them
      if (existingWorkOrder.assignedToId !== req.user.userId) {
        throw new AppError(403, 'Not authorized to update this work order');
      }
      // Maintenance can only update certain fields
      const allowedFields = ['status', 'startDate', 'completedDate', 'actualHours', 'actualCost', 'notes'];
      const invalidFields = Object.keys(data).filter(key => !allowedFields.includes(key));
      if (invalidFields.length > 0) {
        throw new AppError(403, `Maintenance staff cannot update: ${invalidFields.join(', ')}`);
      }
    }

    // If assigning to someone, verify they belong to the same tenant
    if (data.assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assignedToId,
          managementCompanyId: req.tenant.tenantId,
          role: { in: ['MAINTENANCE', 'MANAGER', 'ADMIN'] },
        },
      });

      if (!assignee) {
        throw new AppError(404, 'Assignee not found or not authorized for work orders');
      }
    }

    const workOrder = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: {
        ...data,
        // Convert string dates to Date objects
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        buildingId: true,
        unitId: true,
        issueId: true,
        assignedToId: true,
        scheduledDate: true,
        startDate: true,
        completedDate: true,
        estimatedHours: true,
        actualHours: true,
        estimatedCost: true,
        actualCost: true,
        notes: true,
        updatedAt: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: { workOrder },
      message: 'Work order updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/work-orders/stats/summary
 * @desc Get work order statistics summary
 * @access MANAGER+
 */
router.get('/stats/summary', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const workOrderModel: any = prisma.workOrder;
    const stats = await prisma.$transaction([
      // Total counts
      workOrderModel.count({
        where: {
          building: {
            currentManagementId: req.tenant.tenantId,
          },
        },
      }),
      // Counts by status
      workOrderModel.groupBy({
        by: ['status'],
        where: {
          building: {
            currentManagementId: req.tenant.tenantId,
          },
        },
        _count: true,
      }),
      // Counts by priority
      workOrderModel.groupBy({
        by: ['priority'],
        where: {
          building: {
            currentManagementId: req.tenant.tenantId,
          },
        },
        _count: true,
      }),
      // Total estimated vs actual hours
      workOrderModel.aggregate({
        where: {
          building: {
            currentManagementId: req.tenant.tenantId,
          },
        },
        _sum: {
          estimatedHours: true,
          actualHours: true,
          estimatedCost: true,
          actualCost: true,
        },
      }),
      // Completed in last 30 days
      workOrderModel.count({
        where: {
          building: {
            currentManagementId: req.tenant.tenantId,
          },
          status: 'COMPLETED',
          completedDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        total: stats[0],
        byStatus: stats[1],
        byPriority: stats[2],
        totals: stats[3]._sum,
        recentCompleted: stats[4],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/work-orders/:id/comments
 * @desc Add comment to a work order
 * @access Role-based (must have access to work order)
 */
router.post('/:id/comments', authenticateWithTenant, authorize(['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const commentSchema = z.object({
      content: z.string().min(1, 'Comment content is required').max(5000),
    });

    const data = commentSchema.parse(req.body);

    // Verify work order exists and user has access
    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: req.params.id,
        building: {
          currentManagementId: req.tenant.tenantId,
        },
      },
      select: {
        id: true,
        assignedToId: true,
      },
    });

    if (!workOrder) {
      throw new AppError(404, 'Work order not found or not accessible');
    }

    // Role-based access check
    if (req.user.role === 'MAINTENANCE' && workOrder.assignedToId !== req.user.userId) {
      throw new AppError(403, 'Not authorized to comment on this work order');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        workOrderId: req.params.id,
        authorId: req.user.userId,
        buildingId: req.tenant.tenantId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { comment },
      message: 'Comment added successfully',
    });
  } catch (error) {
    next(error);
  }
});

export const workOrderRoutes = router;