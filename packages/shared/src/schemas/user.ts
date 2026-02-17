import { z } from 'zod';

export const userRoleSchema = z.enum(['tenant', 'technician', 'manager', 'admin']);

export const createUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: userRoleSchema,
  buildingId: z.string().uuid().optional(),
  unitNumber: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: userRoleSchema.optional(),
  buildingId: z.string().uuid().optional(),
  unitNumber: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});