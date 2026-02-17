import { Priority, IssueStatus } from './common';

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: IssueStatus;
  category: string;
  reporterId: string;
  assigneeId?: string;
  buildingId: string;
  unitNumber?: string;
  locationDetails?: string;
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
  unitNumber?: string;
  locationDetails?: string;
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: IssueStatus;
  category?: string;
  assigneeId?: string;
  locationDetails?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
}

export interface IssueWithRelations extends Issue {
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignee?: {
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
  reporterId?: string;
  assigneeId?: string;
  startDate?: Date;
  endDate?: Date;
}