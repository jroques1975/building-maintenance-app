import { z } from 'zod';

export const prioritySchema = z.enum(['low', 'medium', 'high', 'emergency']);
export const issueStatusSchema = z.enum(['open', 'assigned', 'in_progress', 'completed', 'closed']);

export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  priority: prioritySchema,
  category: z.string().min(1).max(100),
  buildingId: z.string().uuid(),
  unitNumber: z.string().optional(),
  locationDetails: z.string().max(500).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  priority: prioritySchema.optional(),
  status: issueStatusSchema.optional(),
  category: z.string().min(1).max(100).optional(),
  assigneeId: z.string().uuid().optional(),
  locationDetails: z.string().max(500).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
});

export const issueFilterSchema = z.object({
  buildingId: z.string().uuid().optional(),
  status: issueStatusSchema.optional(),
  priority: prioritySchema.optional(),
  category: z.string().optional(),
  reporterId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});