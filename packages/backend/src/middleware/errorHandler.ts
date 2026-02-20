import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
// Prisma-specific error narrowing disabled until client/schema alignment is restored.
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details: any = undefined,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle Prisma-like errors without tight client coupling
  const prismaCode = (err as any)?.code as string | undefined;
  if (prismaCode) {
    if (prismaCode === 'P2002') {
      const target = ((err as any)?.meta?.target as string[]) || ['field'];
      return res.status(409).json({
        status: 'error',
        message: `A record with this ${target.join(', ')} already exists`,
      });
    }

    if (prismaCode === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Record not found',
      });
    }

    return res.status(400).json({
      status: 'error',
      message: 'Database error occurred',
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle generic errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};