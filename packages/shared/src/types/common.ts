export type Priority = 'low' | 'medium' | 'high' | 'emergency';
export type IssueStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'closed';
export type UserRole = 'tenant' | 'technician' | 'manager' | 'admin';

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