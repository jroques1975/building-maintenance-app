export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueStatus = 'PENDING' | 'IN_REVIEW' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'TENANT' | 'MAINTENANCE' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN' | 'BUILDING_OWNER';

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}