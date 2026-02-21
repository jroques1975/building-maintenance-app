import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/prisma-enums';
import { AuthService, JwtPayload } from '../utils/auth';
import { AppError } from './errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Combined authentication and tenant context
 * This middleware replaces both authenticate and tenantMiddleware
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        tenantId?: string;
        buildingId?: string;
        tenantPlan?: string;
      };
      tenant?: {
        tenantId: string;
        tenantPlan: string;
        userId: string;
        userRole: string;
        buildingId?: string;
      };
    }
  }
}

/**
 * Main authentication middleware with tenant context
 */
export const authenticateWithTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = AuthService.extractToken(req.headers.authorization);

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    // Verify token
    const payload = AuthService.verifyToken(token) as JwtPayload;

    // Set user context (backward compatibility)
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      buildingId: payload.buildingId,
      tenantPlan: payload.tenantPlan,
    };

    // Handle SUPER_ADMIN special case
    if (payload.role === 'SUPER_ADMIN') {
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
      // Super admin without tenantId can proceed (platform-level operations)
      req.tenant = {
        tenantId: 'platform',
        tenantPlan: 'SUPER_ADMIN',
        userId: payload.userId,
        userRole: payload.role,
        buildingId: payload.buildingId,
      };
      return next();
    }

    // Validate tenant for regular users
    if (!payload.tenantId) {
      throw new AppError(403, 'User not associated with any tenant');
    }

    // Verify tenant compatibility entity exists (management company or HOA)
    const [managementCompany, hoaOrganization] = await Promise.all([
      prisma.managementCompany.findUnique({
        where: { id: payload.tenantId },
        select: { id: true, plan: true, status: true },
      }),
      prisma.hoaOrganization.findUnique({
        where: { id: payload.tenantId },
        select: { id: true, status: true },
      }),
    ]);

    if (!managementCompany && !hoaOrganization) {
      throw new AppError(403, 'Tenant not found');
    }

    const status = managementCompany?.status || hoaOrganization?.status;
    if (status !== 'ACTIVE' && status !== 'TRIAL') {
      throw new AppError(403, `Tenant account is ${String(status).toLowerCase()}`);
    }

    // Set tenant context
    req.tenant = {
      tenantId: payload.tenantId,
      tenantPlan: payload.tenantPlan || managementCompany?.plan || 'PROFESSIONAL',
      userId: payload.userId,
      userRole: payload.role,
      buildingId: payload.buildingId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      console.error('Authentication error:', error);
      next(new AppError(401, 'Invalid authentication'));
    }
  }
};

/**
 * Authorization middleware (works with tenant context)
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const hasAccess = allowedRoles.some((role) => 
      AuthService.hasRole(req.user!.role as any, role as any)
    );

    if (!hasAccess) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has access to specific building within tenant
 */
export const authorizeBuildingAccess = (buildingIdParam = 'buildingId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.tenant) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = req.user;
    const requestedBuildingId = req.params[buildingIdParam] || req.body.buildingId;

    // SUPER_ADMIN can access any building
    if (user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Validate building belongs to user's tenant
    try {
      const building = await prisma.building.findFirst({
        where: {
          id: requestedBuildingId,
          currentManagementId: req.tenant.tenantId, // Ensure building belongs to tenant context
        },
      });

      if (!building) {
        return next(new AppError(404, 'Building not found or not accessible'));
      }

      // Admins can access all buildings in their tenant
      if (user.role === 'ADMIN') {
        return next();
      }

      // Managers can access buildings in their tenant context
      if (user.role === 'MANAGER') {
        return next();
      }

      // Maintenance staff can access buildings they're assigned to
      if (user.role === 'MAINTENANCE') {
        // Check if user is assigned to this building
        const assignment = await prisma.user.findFirst({
          where: {
            id: user.userId,
            buildingId: requestedBuildingId,
            managementCompanyId: req.tenant.tenantId,
          },
        });
        
        if (assignment) {
          return next();
        }
        return next(new AppError(403, 'Not assigned to this building'));
      }

      // Tenants can only access their own building
      if (user.role === 'TENANT') {
        if (user.buildingId === requestedBuildingId) {
          return next();
        }
        return next(new AppError(403, 'Not authorized to access this building'));
      }

      next(new AppError(403, 'Insufficient permissions'));
    } catch (error) {
      console.error('Building access check error:', error);
      next(new AppError(500, 'Internal server error'));
    }
  };
};

/**
 * Check if user can access another user's data within same tenant
 */
export const authorizeUserAccess = (userIdParam = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.tenant) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = req.user;
    const requestedUserId = req.params[userIdParam] || req.body.userId;

    // Users can access their own data
    if (user.userId === requestedUserId) {
      return next();
    }

    // SUPER_ADMIN can access any user
    if (user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Validate requested user belongs to same tenant
    try {
      const requestedUser = await prisma.user.findFirst({
        where: {
          id: requestedUserId,
          OR: [
            { managementCompanyId: req.tenant.tenantId },
            { hoaOrganizationId: req.tenant.tenantId },
          ],
        },
      });

      if (!requestedUser) {
        return next(new AppError(404, 'User not found or not accessible'));
      }

      // Admins can access all users in their tenant
      if (user.role === 'ADMIN') {
        return next();
      }

      // Managers can access users in buildings they manage
      if (user.role === 'MANAGER') {
        if (requestedUser.buildingId === user.buildingId) {
          return next();
        }
        return next(new AppError(403, 'Not authorized to access this user'));
      }

      next(new AppError(403, 'Not authorized to access this user'));
    } catch (error) {
      console.error('User access check error:', error);
      next(new AppError(500, 'Internal server error'));
    }
  };
};

/**
 * Optional authentication (for public routes)
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = AuthService.extractToken(req.headers.authorization);

    if (token) {
      const payload = AuthService.verifyToken(token) as JwtPayload;
      
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        buildingId: payload.buildingId,
        tenantPlan: payload.tenantPlan,
      };

      // Set tenant context if tenantId exists
      if (payload.tenantId) {
        const [managementCompany, hoaOrganization] = await Promise.all([
          prisma.managementCompany.findUnique({
            where: { id: payload.tenantId },
            select: { id: true, plan: true, status: true },
          }),
          prisma.hoaOrganization.findUnique({
            where: { id: payload.tenantId },
            select: { id: true, status: true },
          }),
        ]);

        const status = managementCompany?.status || hoaOrganization?.status;
        if ((managementCompany || hoaOrganization) && (status === 'ACTIVE' || status === 'TRIAL')) {
          req.tenant = {
            tenantId: payload.tenantId,
            tenantPlan: payload.tenantPlan || managementCompany?.plan || 'PROFESSIONAL',
            userId: payload.userId,
            userRole: payload.role,
            buildingId: payload.buildingId,
          };
        }
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
};

/**
 * Check tenant plan limits
 */
export const checkTenantPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenant) {
    return next(new AppError(401, 'Authentication required'));
  }

  // Skip for super admin
  if (req.tenant.userRole === 'SUPER_ADMIN') {
    return next();
  }

  try {
    // Check building count limit based on plan
    const buildingCount = await prisma.building.count({
      where: { currentManagementId: req.tenant.tenantId },
    });

    const planLimits: Record<string, number> = {
      STARTER: 5,
      PROFESSIONAL: 50,
      ENTERPRISE: 1000,
      CUSTOM: 10000,
    };

    const limit = planLimits[req.tenant.tenantPlan] || 5;

    if (buildingCount >= limit) {
      return next(new AppError(
        403,
        `Plan limit exceeded. Current plan (${req.tenant.tenantPlan}) allows ${limit} buildings.`
      ));
    }

    next();
  } catch (error) {
    console.error('Plan limit check error:', error);
    next(); // Don't block on error
  }
};

/**
 * Get tenant-scoped Prisma client
 */
export function getTenantPrisma(_tenantId: string) {
  // Compatibility shim: legacy tenant field no longer exists on current schema.
  // Route-level scoping enforces management/HOA context.
  return prisma as any;
}

/**
 * Get Prisma client for current request tenant
 */
export function getRequestPrisma(req: Request) {
  if (!req.tenant) {
    throw new AppError(401, 'Tenant context required');
  }
  return getTenantPrisma(req.tenant.tenantId);
}