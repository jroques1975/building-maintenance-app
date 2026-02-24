export type WorkOrderStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  issueId?: string;
  buildingId: string;
  unitId?: string;
  assignedToId?: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  scheduledDate?: Date | string;
  startDate?: Date | string;
  completedDate?: Date | string;
  estimatedHours?: number;
  actualHours?: number;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations (present when returned from API with selects)
  building?: { id: string; name: string; address: string };
  unit?: { id: string; unitNumber: string; type: string };
  issue?: { id: string; title: string; category: string; priority: string; status: string };
  assignedTo?: { id: string; firstName: string; lastName: string; email: string; phone?: string; role: string };
}

export interface CreateWorkOrderDto {
  title: string;
  description: string;
  buildingId: string;
  issueId?: string;
  unitId?: string;
  assignedToId?: string;
  priority?: WorkOrderPriority;
  scheduledDate?: string;
  estimatedHours?: number;
  estimatedCost?: number;
  notes?: string;
}

export interface UpdateWorkOrderDto {
  title?: string;
  description?: string;
  assignedToId?: string;
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  scheduledDate?: string;
  startDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
}
