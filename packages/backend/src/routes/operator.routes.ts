import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const transitionSchema = z.object({
  fromOperatorPeriodId: z.string().optional(),
  toOperatorType: z.enum(['PM', 'HOA']),
  toOperatorId: z.string().min(1),
  effectiveDate: z.string().datetime(),
  handoffNotes: z.string().max(2000).optional(),
});

const dateRange = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const createOperatorPeriodSchema = z.object({
  operatorType: z.enum(['PM', 'HOA']),
  toOperatorId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'ENDED', 'TERMINATED', 'RENEWED']).optional(),
  handoffNotes: z.string().max(2000).optional(),
  closeActivePeriod: z.boolean().optional(),
});

router.get('/portfolio/buildings', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const actor = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        role: true,
        managementCompanyId: true,
        hoaOrganizationId: true,
      },
    });

    if (!actor) {
      throw new AppError(404, 'Authenticated user not found');
    }

    const where = actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN'
      ? {}
      : {
          currentOperatorPeriod: {
            status: 'ACTIVE' as const,
            OR: [
              actor.managementCompanyId
                ? { managementCompanyId: actor.managementCompanyId }
                : undefined,
              actor.hoaOrganizationId
                ? { hoaOrganizationId: actor.hoaOrganizationId }
                : undefined,
            ].filter(Boolean),
          },
        };

    const buildings = await prisma.building.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        totalUnits: true,
        currentOperatorPeriod: {
          select: {
            id: true,
            operatorType: true,
            status: true,
            startDate: true,
            endDate: true,
            managementCompany: {
              select: { id: true, name: true },
            },
            hoaOrganization: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            issues: true,
            workOrders: true,
            units: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }],
    });

    res.json({
      status: 'success',
      data: { buildings },
      meta: { count: buildings.length },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/buildings/:buildingId/operator-timeline', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { buildingId } = req.params;
    const range = dateRange.parse(req.query);

    const where: {
      buildingId: string;
      startDate?: { gte?: Date; lte?: Date };
    } = { buildingId };

    if (range.from || range.to) {
      where.startDate = {
        ...(range.from ? { gte: new Date(range.from) } : {}),
        ...(range.to ? { lte: new Date(range.to) } : {}),
      };
    }

    const [building, timeline] = await Promise.all([
      prisma.building.findUnique({
        where: { id: buildingId },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          currentOperatorPeriodId: true,
        },
      }),
      prisma.buildingOperatorPeriod.findMany({
        where,
        select: {
          id: true,
          operatorType: true,
          status: true,
          startDate: true,
          endDate: true,
          handoffNotes: true,
          createdAt: true,
          managementCompany: {
            select: { id: true, name: true },
          },
          hoaOrganization: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              issues: true,
              workOrders: true,
            },
          },
        },
        orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    if (!building) {
      throw new AppError(404, 'Building not found');
    }

    res.json({
      status: 'success',
      data: {
        building,
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/buildings/:buildingId/operator-periods', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { buildingId } = req.params;
    const payload = createOperatorPeriodSchema.parse(req.body);
    const startDate = new Date(payload.startDate);
    const endDate = payload.endDate ? new Date(payload.endDate) : null;
    const newStatus = payload.status ?? 'ACTIVE';

    if (endDate && endDate <= startDate) {
      throw new AppError(400, 'endDate must be later than startDate');
    }

    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      select: { id: true, name: true, currentOperatorPeriodId: true },
    });

    if (!building) {
      throw new AppError(404, 'Building not found');
    }

    const [managementCompany, hoaOrganization, activePeriod] = await Promise.all([
      payload.operatorType === 'PM'
        ? prisma.managementCompany.findUnique({
            where: { id: payload.toOperatorId },
            select: { id: true, name: true },
          })
        : Promise.resolve(null),
      payload.operatorType === 'HOA'
        ? prisma.hoaOrganization.findUnique({
            where: { id: payload.toOperatorId },
            select: { id: true, name: true },
          })
        : Promise.resolve(null),
      prisma.buildingOperatorPeriod.findFirst({
        where: { buildingId, status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    if (payload.operatorType === 'PM' && !managementCompany) {
      throw new AppError(404, 'Target management company not found');
    }

    if (payload.operatorType === 'HOA' && !hoaOrganization) {
      throw new AppError(404, 'Target HOA organization not found');
    }

    const shouldCloseActive = payload.closeActivePeriod ?? true;

    if (newStatus === 'ACTIVE' && activePeriod && !shouldCloseActive) {
      throw new AppError(409, 'An ACTIVE operator period already exists for this building');
    }

    const result = await prisma.$transaction(async (tx) => {
      let closedPeriod = null;

      if (newStatus === 'ACTIVE' && activePeriod && shouldCloseActive) {
        if (startDate <= activePeriod.startDate) {
          throw new AppError(400, 'startDate must be after current ACTIVE period startDate');
        }

        closedPeriod = await tx.buildingOperatorPeriod.update({
          where: { id: activePeriod.id },
          data: {
            status: 'ENDED',
            endDate: startDate,
          },
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            operatorType: true,
          },
        });
      }

      const newPeriod = await tx.buildingOperatorPeriod.create({
        data: {
          buildingId,
          operatorType: payload.operatorType,
          managementCompanyId: payload.operatorType === 'PM' ? payload.toOperatorId : null,
          hoaOrganizationId: payload.operatorType === 'HOA' ? payload.toOperatorId : null,
          startDate,
          endDate,
          status: newStatus,
          handoffNotes: payload.handoffNotes,
        },
        select: {
          id: true,
          operatorType: true,
          status: true,
          startDate: true,
          endDate: true,
          handoffNotes: true,
          managementCompany: { select: { id: true, name: true } },
          hoaOrganization: { select: { id: true, name: true } },
        },
      });

      if (newStatus === 'ACTIVE') {
        await tx.building.update({
          where: { id: buildingId },
          data: {
            currentOperatorPeriodId: newPeriod.id,
            currentManagementId: payload.operatorType === 'PM' ? payload.toOperatorId : null,
          },
        });
      }

      return { closedPeriod, newPeriod };
    });

    res.status(201).json({
      status: 'success',
      message: 'Operator period created',
      data: {
        building,
        ...result,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/buildings/:buildingId/history', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { buildingId } = req.params;

    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        currentOperatorPeriodId: true,
      },
    });

    if (!building) {
      throw new AppError(404, 'Building not found');
    }

    const periods = await prisma.buildingOperatorPeriod.findMany({
      where: { buildingId },
      select: {
        id: true,
        operatorType: true,
        status: true,
        startDate: true,
        endDate: true,
        handoffNotes: true,
        managementCompany: { select: { id: true, name: true } },
        hoaOrganization: { select: { id: true, name: true } },
        issues: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            category: true,
            createdAt: true,
            completedDate: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        workOrders: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            completedDate: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ startDate: 'asc' }],
    });

    const [unassignedIssues, unassignedWorkOrders] = await Promise.all([
      prisma.issue.findMany({
        where: { buildingId, operatorPeriodId: null },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
          completedDate: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.workOrder.findMany({
        where: { buildingId, operatorPeriodId: null },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          completedDate: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        building,
        periods: periods.map((period) => ({
          ...period,
          totals: {
            issues: period.issues.length,
            workOrders: period.workOrders.length,
          },
        })),
        unassigned: {
          issues: unassignedIssues,
          workOrders: unassignedWorkOrders,
          totals: {
            issues: unassignedIssues.length,
            workOrders: unassignedWorkOrders.length,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/buildings/:buildingId/transition', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { buildingId } = req.params;
    const payload = transitionSchema.parse(req.body);
    const effectiveDate = new Date(payload.effectiveDate);

    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      select: {
        id: true,
        name: true,
        currentOperatorPeriodId: true,
      },
    });

    if (!building) {
      throw new AppError(404, 'Building not found');
    }

    const activePeriod = await prisma.buildingOperatorPeriod.findFirst({
      where: {
        buildingId,
        status: 'ACTIVE',
      },
      orderBy: { startDate: 'desc' },
    });

    if (payload.fromOperatorPeriodId && activePeriod?.id !== payload.fromOperatorPeriodId) {
      throw new AppError(409, 'fromOperatorPeriodId does not match current ACTIVE period');
    }

    if (activePeriod && effectiveDate <= activePeriod.startDate) {
      throw new AppError(400, 'effectiveDate must be after current period startDate');
    }

    const [managementCompany, hoaOrganization] = await Promise.all([
      payload.toOperatorType === 'PM'
        ? prisma.managementCompany.findUnique({
            where: { id: payload.toOperatorId },
            select: { id: true, name: true },
          })
        : Promise.resolve(null),
      payload.toOperatorType === 'HOA'
        ? prisma.hoaOrganization.findUnique({
            where: { id: payload.toOperatorId },
            select: { id: true, name: true },
          })
        : Promise.resolve(null),
    ]);

    if (payload.toOperatorType === 'PM' && !managementCompany) {
      throw new AppError(404, 'Target management company not found');
    }

    if (payload.toOperatorType === 'HOA' && !hoaOrganization) {
      throw new AppError(404, 'Target HOA organization not found');
    }

    const result = await prisma.$transaction(async (tx) => {
      let previousPeriod = null;

      if (activePeriod) {
        previousPeriod = await tx.buildingOperatorPeriod.update({
          where: { id: activePeriod.id },
          data: {
            status: 'ENDED',
            endDate: effectiveDate,
          },
          select: {
            id: true,
            operatorType: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        });
      }

      const nextPeriod = await tx.buildingOperatorPeriod.create({
        data: {
          buildingId,
          operatorType: payload.toOperatorType,
          managementCompanyId: payload.toOperatorType === 'PM' ? payload.toOperatorId : null,
          hoaOrganizationId: payload.toOperatorType === 'HOA' ? payload.toOperatorId : null,
          startDate: effectiveDate,
          status: 'ACTIVE',
          handoffNotes: payload.handoffNotes,
        },
        select: {
          id: true,
          operatorType: true,
          status: true,
          startDate: true,
          endDate: true,
          handoffNotes: true,
          managementCompany: {
            select: { id: true, name: true },
          },
          hoaOrganization: {
            select: { id: true, name: true },
          },
        },
      });

      await tx.building.update({
        where: { id: buildingId },
        data: {
          currentOperatorPeriodId: nextPeriod.id,
          currentManagementId: payload.toOperatorType === 'PM' ? payload.toOperatorId : null,
        },
      });

      const [issueCount, workOrderCount] = await Promise.all([
        tx.issue.count({ where: { buildingId } }),
        tx.workOrder.count({ where: { buildingId } }),
      ]);

      return {
        previousPeriod,
        nextPeriod,
        continuity: {
          issuesInBuildingHistory: issueCount,
          workOrdersInBuildingHistory: workOrderCount,
        },
      };
    });

    res.status(201).json({
      status: 'success',
      message: 'Operator transition completed with building-level continuity preserved',
      data: {
        building,
        ...result,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const operatorRoutes = router;
