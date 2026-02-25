import { Priority, IssueStatus } from './common';

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: IssueStatus;
  category: string;
  submittedById: string;
  assignedToId?: string;
  buildingId: string;
  unitId?: string;
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date | string;
  completedDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations (present when returned from API)
  submittedBy?: { id: string; firstName: string; lastName: string; email: string };
  assignedTo?: { id: string; firstName: string; lastName: string; email: string };
  building?: { id: string; name: string; address: string };
  unit?: { id: string; unitNumber: string };
  _count?: { attachments: number; comments: number; workOrders: number };

  // Detail-level relations (only in GET /issues/:id)
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    createdAt: Date | string;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    author: { id: string; firstName: string; lastName: string; role: string };
  }>;
  workOrders?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    scheduledDate?: Date | string;
    completedDate?: Date | string;
    estimatedHours?: number;
    actualHours?: number;
    assignedTo?: { id: string; firstName: string; lastName: string };
  }>;
}

export interface CreateIssueDto {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  buildingId: string;
  unitId?: string;
  location?: string;
  estimatedCost?: number;
  scheduledDate?: Date;
  attachments?: Array<{
    filename: string;
    fileType: string;
    fileSize: number;
    url: string;
  }>;
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: IssueStatus;
  category?: string;
  assignedToId?: string;
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
}

export interface IssueWithRelations extends Issue {
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  building: {
    id: string;
    name: string;
    address: string;
  };
}

export interface IssueFilter {
  buildingId?: string;
  status?: IssueStatus;
  priority?: Priority;
  category?: string;
  submittedById?: string;
  assignedToId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}