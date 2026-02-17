import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload } from '../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tenant context for multi-tenant isolation
 */
export interface TenantContext {
  tenantId: string;
  tenantPlan: string;
  userId: string;
  userRole: string;
  buildingId?: string;
}

/**
 * Extend Express Request to include tenant context
 */
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Tenant middleware - extracts and validates tenant context from JWT
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = AuthService.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const payload = AuthService.verifyToken(token) as JwtPayload;

    // For SUPER_ADMIN, allow bypassing tenant restrictions (with caution)
    if (payload.role === 'SUPER_ADMIN') {
      // Super admin can access any tenant via query parameter
      const requestedTenantId = req.query.tenantId as string;
      if (requestedTenantId) {
        req.tenant = {
          tenantId: requestedTenantId,
          tenantPlan: 'SUPER_ADMIN',
          userId: payload.userId,
          userRole: payload.role,
          buildingId: payload.buildingId,
        };
        return next();
      }
    }

    // Validate that user has a tenantId (should always be present for non-super-admin)
    if (!payload.tenantId) {
      return res.status(403).json({ error: 'User not associated with any tenant' });
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
      select: { id: true, plan: true, status: true, name: true },
    });

    if (!tenant) {
      return res.status(403).json({ error: 'Tenant not found' });
    }

    // Check tenant status
    if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
      return res.status(403).json({ 
        error: `Tenant account is ${tenant.status.toLowerCase()}`,
        status: tenant.status,
      });
    }

    // Set tenant context on request
    req.tenant = {
      tenantId: payload.tenantId,
      tenantPlan: payload.tenantPlan || tenant.plan,
      userId: payload.userId,
      userRole: payload.role,
      buildingId: payload.buildingId,
    };

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

/**
 * Tenant-scoped Prisma client wrapper
 * Automatically adds tenantId filter to all queries
 */
export class TenantScopedPrisma {
  private prisma: PrismaClient;
  private tenantId: string;

  constructor(tenantId: string) {
    this.prisma = new PrismaClient();
    this.tenantId = tenantId;
  }

  // User operations
  user = {
    findMany: (args: any) => this.prisma.user.findMany({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    findUnique: (args: any) => this.prisma.user.findUnique({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    create: (args: any) => this.prisma.user.create({
      ...args,
      data: { ...args.data, tenantId: this.tenantId },
    }),
    update: (args: any) => this.prisma.user.update({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    delete: (args: any) => this.prisma.user.delete({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
  };

  // Building operations
  building = {
    findMany: (args: any) => this.prisma.building.findMany({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    findUnique: (args: any) => this.prisma.building.findUnique({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    create: (args: any) => this.prisma.building.create({
      ...args,
      data: { ...args.data, tenantId: this.tenantId },
    }),
    update: (args: any) => this.prisma.building.update({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    delete: (args: any) => this.prisma.building.delete({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
  };

  // Issue operations
  issue = {
    findMany: (args: any) => this.prisma.issue.findMany({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    findUnique: (args: any) => this.prisma.issue.findUnique({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    create: (args: any) => this.prisma.issue.create({
      ...args,
      data: { ...args.data, tenantId: this.tenantId },
    }),
    update: (args: any) => this.prisma.issue.update({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    delete: (args: any) => this.prisma.issue.delete({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
  };

  // WorkOrder operations
  workOrder = {
    findMany: (args: any) => this.prisma.workOrder.findMany({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    findUnique: (args: any) => this.prisma.workOrder.findUnique({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    create: (args: any) => this.prisma.workOrder.create({
      ...args,
      data: { ...args.data, tenantId: this.tenantId },
    }),
    update: (args: any) => this.prisma.workOrder.update({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
    delete: (args: any) => this.prisma.workOrder.delete({
      ...args,
      where: { ...args?.where, tenantId: this.tenantId },
    }),
  };

  // Raw Prisma access (use with caution - no tenant filtering)
  get raw() {
    return this.prisma;
  }

  // Helper to get tenant context
  get tenantContext() {
    return { tenantId: this.tenantId };
  }

  // Disconnect
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

/**
 * Get tenant-scoped Prisma client from request
 */
export function getTenantPrisma(req: Request): TenantScopedPrisma {
  if (!req.tenant) {
    throw new Error('Tenant context not found in request');
  }
  return new TenantScopedPrisma(req.tenant.tenantId);
}

/**
 * Middleware to check if user has specific role within tenant
 */
export const requireTenantRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roleHierarchy: Record<string, number> = {
      TENANT: 1,
      MAINTENANCE: 2,
      MANAGER: 3,
      ADMIN: 4,
      SUPER_ADMIN: 5,
    };

    const userRoleLevel = roleHierarchy[req.tenant.userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Required role: ${requiredRole}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check tenant plan limits
 */
export const checkTenantPlanLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenant) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Skip for super admin
  if (req.tenant.userRole === 'SUPER_ADMIN') {
    return next();
  }

  try {
    const prisma = new PrismaClient();
    
    // Check building count limit based on plan
    const buildingCount = await prisma.building.count({
      where: { tenantId: req.tenant.tenantId },
    });

    const planLimits: Record<string, number> = {
      STARTER: 5,      // 5 buildings max
      PROFESSIONAL: 50, // 50 buildings max
      ENTERPRISE: 1000, // 1000 buildings max
      CUSTOM: 10000,    // 10,000 buildings max
    };

    const limit = planLimits[req.tenant.tenantPlan] || 5;

    if (buildingCount >= limit) {
      return res.status(403).json({
        error: `Plan limit exceeded. Current plan (${req.tenant.tenantPlan}) allows ${limit} buildings.`,
        limit,
        current: buildingCount,
      });
    }

    next();
  } catch (error) {
    console.error('Plan limit check error:', error);
    next(); // Don't block on error, just continue
  }
};