import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthService } from '../utils/auth';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        buildingId?: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = AuthService.extractToken(req.headers.authorization);

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const payload = AuthService.verifyToken(token);
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid or expired token'));
    }
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const hasAccess = allowedRoles.some(role => 
      AuthService.hasRole(req.user!.role, role)
    );

    if (!hasAccess) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};

export const authorizeBuildingAccess = (buildingIdParam = 'buildingId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = req.user;
    const requestedBuildingId = req.params[buildingIdParam] || req.body.buildingId;

    // Admins can access all buildings
    if (user.role === 'ADMIN') {
      return next();
    }

    // Managers can access their managed buildings
    if (user.role === 'MANAGER') {
      if (user.buildingId === requestedBuildingId) {
        return next();
      }
      return next(new AppError(403, 'Not authorized to access this building'));
    }

    // Maintenance staff can access buildings they're assigned to
    if (user.role === 'MAINTENANCE') {
      // In a real app, we'd check if user is assigned to this building
      // For now, allow access if buildingId matches
      if (user.buildingId === requestedBuildingId) {
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
  };
};

export const authorizeSelfOrAdmin = (userIdParam = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = req.user;
    const requestedUserId = req.params[userIdParam] || req.body.userId;

    // Users can access their own data
    if (user.userId === requestedUserId) {
      return next();
    }

    // Admins can access all user data
    if (user.role === 'ADMIN') {
      return next();
    }

    // Managers can access tenant data in their building
    if (user.role === 'MANAGER') {
      // In a real app, we'd check if the requested user is in manager's building
      // For now, allow managers to access any user (will be refined later)
      return next();
    }

    next(new AppError(403, 'Not authorized to access this user'));
  };
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = AuthService.extractToken(req.headers.authorization);

    if (token) {
      const payload = AuthService.verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};