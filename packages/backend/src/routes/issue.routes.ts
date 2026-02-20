import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateWithTenant, authorize } from '../middleware/auth-tenant.combined';
import { UserRole, IssueCategory, IssuePriority, IssueStatus } from '@prisma/client';

const router = Router();

// Validation schemas
const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  category: z.nativeEnum(IssueCategory),
  priority: z.nativeEnum(IssuePriority).default('MEDIUM'),
  location: z.string().max(200).optional(),
  buildingId: z.string().min(1, 'Building ID is required'),
  unitId: z.string().optional(),
  estimatedCost: z.number().min(0).max(1000000).optional(),
  scheduledDate: z.string().datetime().optional(),
});

const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  category: z.nativeEnum(IssueCategory).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  location: z.string().max(200).optional(),
  assignedToId: z.string().optional(),
  estimatedCost: z.number().min(0).max(1000000).optional(),
  actualCost: z.number().min(0).max(1000000).optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
});

const filterIssuesSchema = z.object({
  buildingId: z.string().optional(),
  unitId: z.string().optional(),
  category: z.nativeEnum(IssueCategory).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  assignedToId: z.string().optional(),
  submittedById: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * @route POST /api/issues
 * @desc Create a new issue (Tenant or Manager+)
 * @access TENANT+ (Tenants can only create in their building/unit)
 */
router.post('/', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = createIssueSchema.parse(req.body);

    // Verify building belongs to tenant
    const building = await prisma.building.findFirst({
      where: {
        id: data.buildingId,
        tenantId: req.tenant.tenantId,
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

      // If user is TENANT, verify they live in this unit
      if (req.user.role === 'TENANT') {
        const userUnit = await prisma.user.findFirst({
          where: {
            id: req.user.userId,
            unitId: data.unitId,
          },
        });

        if (!userUnit) {
          throw new AppError(403, 'Not authorized to create issues for this unit');
        }
      }
    }

    // If user is TENANT, verify they are in the building
    if (req.user.role === 'TENANT') {
      const userBuilding = await prisma.user.findFirst({
        where: {
          id: req.user.userId,
          buildingId: data.buildingId,
        },
      });

      if (!userBuilding) {
        throw new AppError(403, 'Not authorized to create issues for this building');
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        location: data.location,
        buildingId: data.buildingId,
        unitId: data.unitId,
        submittedById: req.user.userId,
        estimatedCost: data.estimatedCost,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        status: 'PENDING',
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        location: true,
        buildingId: true,
        unitId: true,
        estimatedCost: true,
        scheduledDate: true,
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
    });

    res.status(201).json({
      status: 'success',
      data: { issue },
      message: 'Issue created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/issues
 * @desc Get issues with filtering (role-based access)
 * @access MAINTENANCE+ (different filters based on role)
 */
router.get('/', authenticateWithTenant, authorize(['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const filters = filterIssuesSchema.parse({
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    // Build where clause based on tenant and user role
    const where: any = {
      building: {
        tenantId: req.tenant.tenantId,
      },
    };

    // Role-specific filters
    if (req.user.role === 'MAINTENANCE') {
      // Maintenance staff can only see issues assigned to them
      where.assignedToId = req.user.userId;
    } else if (req.user.role === 'TENANT') {
      // Tenants can only see their own issues (this route doesn't allow TENANT role)
      where.submittedById = req.user.userId;
    }

    // Apply filters
    if (filters.buildingId) {
      where.buildingId = filters.buildingId;
    }
    if (filters.unitId) {
      where.unitId = filters.unitId;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }
    if (filters.submittedById) {
      where.submittedById = filters.submittedById;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [issues, total] = await prisma.$transaction([
      prisma.issue.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          location: true,
          buildingId: true,
          unitId: true,
          estimatedCost: true,
          actualCost: true,
          scheduledDate: true,
          completedDate: true,
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
          submittedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              comments: true,
              workOrders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { issues },
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
 * @route GET /api/issues/my-issues
 * @desc Get current user's issues (for tenants)
 * @access TENANT+
 */
router.get('/my-issues', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const filters = filterIssuesSchema.parse({
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    const where: any = {
      building: {
        tenantId: req.tenant.tenantId,
      },
    };

    // User can only see their own submitted issues
    where.submittedById = req.user.userId;

    // Apply additional filters
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [issues, total] = await prisma.$transaction([
      prisma.issue.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          location: true,
          buildingId: true,
          unitId: true,
          estimatedCost: true,
          actualCost: true,
          scheduledDate: true,
          completedDate: true,
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
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              comments: true,
              workOrders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { issues },
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
 * @route GET /api/issues/:id
 * @desc Get single issue by ID
 * @access Role-based (tenants can only see their own)
 */
router.get('/:id', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const issue = await prisma.issue.findFirst({
      where: {
        id: req.params.id,
        building: {
          tenantId: req.tenant.tenantId,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        location: true,
        buildingId: true,
        unitId: true,
        estimatedCost: true,
        actualCost: true,
        scheduledDate: true,
        completedDate: true,
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
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
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
            mimeType: true,
            size: true,
            createdAt: true,
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
        workOrders: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            scheduledDate: true,
            startDate: true,
            completedDate: true,
            estimatedHours: true,
            actualHours: true,
            estimatedCost: true,
            actualCost: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!issue) {
      throw new AppError(404, 'Issue not found or not accessible');
    }

    // Role-based access control
    if (req.user.role === 'TENANT' && issue.submittedBy.id !== req.user.userId) {
      throw new AppError(403, 'Not authorized to view this issue');
    }

    if (req.user.role === 'MAINTENANCE' && issue.assignedTo?.id !== req.user.userId) {
      // Maintenance can see if assigned, but also let managers/admins see
      if (req.user.role === 'MAINTENANCE') {
        throw new AppError(403, 'Not authorized to view this issue');
      }
    }

    res.json({
      status: 'success',
      data: { issue },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/issues/:id
 * @desc Update an issue
 * @access Role-based (tenants can only update their own before assignment)
 */
router.put('/:id', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = updateIssueSchema.parse(req.body);

    // Get existing issue with tenant validation
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: req.params.id,
        building: {
          tenantId: req.tenant.tenantId,
        },
      },
      include: {
        submittedBy: true,
        assignedTo: true,
      },
    });

    if (!existingIssue) {
      throw new AppError(404, 'Issue not found or not accessible');
    }

    // Role-based update permissions
    if (req.user.role === 'TENANT') {
      // Tenants can only update their own issues if not yet assigned
      if (existingIssue.submittedById !== req.user.userId) {
        throw new AppError(403, 'Not authorized to update this issue');
      }
      if (existingIssue.assignedToId) {
        throw new AppError(403, 'Cannot update issue after it has been assigned');
      }
      // Tenants can only update certain fields
      const allowedFields = ['title', 'description', 'location', 'priority'];
      const invalidFields = Object.keys(data).filter(key => !allowedFields.includes(key));
      if (invalidFields.length > 0) {
        throw new AppError(403, `Tenants cannot update: ${invalidFields.join(', ')}`);
      }
    }

    if (req.user.role === 'MAINTENANCE') {
      // Maintenance can only update issues assigned to them
      if (existingIssue.assignedToId !== req.user.userId) {
        throw new AppError(403, 'Not authorized to update this issue');
      }
      // Maintenance can only update certain fields
      const allowedFields = ['status', 'actualCost', 'completedDate'];
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
          tenantId: req.tenant.tenantId,
        },
      });

      if (!assignee) {
        throw new AppError(404, 'Assignee not found in tenant');
      }
    }

    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        ...data,
        // Convert string dates to Date objects
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        location: true,
        buildingId: true,
        unitId: true,
        estimatedCost: true,
        actualCost: true,
        scheduledDate: true,
        completedDate: true,
        assignedToId: true,
        createdAt: true,
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
      data: { issue },
      message: 'Issue updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/issues/:id/comments
 * @desc Get comments for an issue
 * @access Role-based (must have access to issue)
 */
router.get('/:id/comments', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Verify issue exists and user has access
    const issue = await prisma.issue.findFirst({
      where: {
        id: req.params.id,
        building: {
          tenantId: req.tenant.tenantId,
        },
      },
      select: {
        id: true,
        submittedById: true,
        assignedToId: true,
      },
    });

    if (!issue) {
      throw new AppError(404, 'Issue not found or not accessible');
    }

    // Role-based access check
    if (req.user.role === 'TENANT' && issue.submittedById !== req.user.userId) {
      throw new AppError(403, 'Not authorized to view comments for this issue');
    }

    if (req.user.role === 'MAINTENANCE' && issue.assignedToId !== req.user.userId) {
      throw new AppError(403, 'Not authorized to view comments for this issue');
    }

    const comments = await prisma.comment.findMany({
      where: {
        issueId: req.params.id,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({
      status: 'success',
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/issues/:id/comments
 * @desc Add comment to an issue
 * @access Role-based (must have access to issue)
 */
router.post('/:id/comments', authenticateWithTenant, authorize(['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const commentSchema = z.object({
      content: z.string().min(1, 'Comment content is required').max(5000),
    });

    const data = commentSchema.parse(req.body);

    // Verify issue exists and user has access
    const issue = await prisma.issue.findFirst({
      where: {
        id: req.params.id,
        building: {
          tenantId: req.tenant.tenantId,
        },
      },
      select: {
        id: true,
        submittedById: true,
        assignedToId: true,
      },
    });

    if (!issue) {
      throw new AppError(404, 'Issue not found or not accessible');
    }

    // Role-based access check
    if (req.user.role === 'TENANT' && issue.submittedById !== req.user.userId) {
      throw new AppError(403, 'Not authorized to comment on this issue');
    }

    if (req.user.role === 'MAINTENANCE' && issue.assignedToId !== req.user.userId) {
      throw new AppError(403, 'Not authorized to comment on this issue');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        issueId: req.params.id,
        authorId: req.user.userId,
        buildingId: req.tenant.tenantId, // Store tenant context for filtering
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

/**
 * @route GET /api/issues/stats/summary
 * @desc Get issue statistics summary
 * @access MANAGER+
 */
router.get('/stats/summary', authenticateWithTenant, authorize(['MANAGER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    if (!req.tenant) {
      throw new AppError(401, 'Tenant context required');
    }

    const stats = await prisma.$transaction([
      // Total counts
      prisma.issue.count({
        where: {
          building: {
            tenantId: req.tenant.tenantId,
          },
        },
      }),
      // Counts by status
      prisma.issue.groupBy({
        by: ['status'],
        where: {
          building: {
            tenantId: req.tenant.tenantId,
          },
        },
        _count: true,
      }),
      // Counts by priority
      prisma.issue.groupBy({
        by: ['priority'],
        where: {
          building: {
            tenantId: req.tenant.tenantId,
          },
        },
        _count: true,
      }),
      // Counts by category
      prisma.issue.groupBy({
        by: ['category'],
        where: {
          building: {
            tenantId: req.tenant.tenantId,
          },
        },
        _count: true,
      }),
      // Recent issues (last 30 days)
      prisma.issue.count({
        where: {
          building: {
            tenantId: req.tenant.tenantId,
          },
          createdAt: {
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
        byCategory: stats[3],
        recent30Days: stats[4],
      },
    });
  } catch (error) {
    next(error);
  }
});

export const issueRoutes = router;