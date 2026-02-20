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
  scheduledDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
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
}