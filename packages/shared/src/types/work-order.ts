export interface WorkOrder {
  id: string;
  issueId: string;
  technicianId: string;
  scheduledDate: Date;
  startDate?: Date;
  endDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  laborHours?: number;
  laborCost?: number;
  materialCost?: number;
  totalCost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkOrderDto {
  issueId: string;
  technicianId: string;
  scheduledDate: Date;
  notes?: string;
}

export interface UpdateWorkOrderDto {
  technicianId?: string;
  scheduledDate?: Date;
  startDate?: Date;
  endDate?: Date;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  laborHours?: number;
  laborCost?: number;
  materialCost?: number;
  notes?: string;
}

export interface MaintenanceSchedule {
  id: string;
  buildingId: string;
  equipmentType: string;
  equipmentName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastPerformed?: Date;
  nextDueDate: Date;
  assignedToId?: string;
  notes?: string;
  isActive: boolean;
}