export const UserRole = {
  TENANT: 'TENANT',
  MAINTENANCE: 'MAINTENANCE',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  BUILDING_OWNER: 'BUILDING_OWNER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const IssueCategory = {
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  HVAC: 'HVAC',
  APPLIANCE: 'APPLIANCE',
  STRUCTURAL: 'STRUCTURAL',
  SECURITY: 'SECURITY',
  CLEANING: 'CLEANING',
  PEST_CONTROL: 'PEST_CONTROL',
  OTHER: 'OTHER',
} as const;

export type IssueCategory = (typeof IssueCategory)[keyof typeof IssueCategory];

export const IssuePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type IssuePriority = (typeof IssuePriority)[keyof typeof IssuePriority];

export const IssueStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type IssueStatus = (typeof IssueStatus)[keyof typeof IssueStatus];

export const WorkOrderStatus = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type WorkOrderStatus = (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus];

export const WorkOrderPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type WorkOrderPriority = (typeof WorkOrderPriority)[keyof typeof WorkOrderPriority];
