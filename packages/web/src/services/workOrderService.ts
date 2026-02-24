import { WorkOrder, CreateWorkOrderDto, UpdateWorkOrderDto } from '@shared/types';
import { tokenService } from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function authFetch(path: string, options: RequestInit = {}) {
  const token = tokenService.getToken();
  if (!token) throw new Error('Authentication required');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }

  return res.json();
}

export interface WorkOrdersResponse {
  data: WorkOrder[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const workOrderService = {
  async getWorkOrders(filter: Record<string, string> = {}): Promise<WorkOrdersResponse> {
    const params = new URLSearchParams(filter);
    const json = await authFetch(`/work-orders?${params}`);
    const workOrders: WorkOrder[] = json?.data?.workOrders ?? [];
    const meta = json?.meta ?? {};
    return {
      data: workOrders,
      meta: {
        total: meta.total ?? workOrders.length,
        page: meta.page ?? 1,
        limit: meta.limit ?? 20,
        totalPages: meta.pages ?? 1,
      },
    };
  },

  async getMyWorkOrders(): Promise<WorkOrdersResponse> {
    const json = await authFetch('/work-orders/my-work');
    const workOrders: WorkOrder[] = json?.data?.workOrders ?? [];
    const meta = json?.meta ?? {};
    return {
      data: workOrders,
      meta: {
        total: meta.total ?? workOrders.length,
        page: meta.page ?? 1,
        limit: meta.limit ?? 20,
        totalPages: meta.pages ?? 1,
      },
    };
  },

  async getWorkOrder(id: string): Promise<WorkOrder> {
    const json = await authFetch(`/work-orders/${id}`);
    return json.data.workOrder;
  },

  async createWorkOrder(data: CreateWorkOrderDto): Promise<WorkOrder> {
    const json = await authFetch('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data.workOrder;
  },

  async updateWorkOrder(id: string, data: UpdateWorkOrderDto): Promise<WorkOrder> {
    const json = await authFetch(`/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return json.data.workOrder;
  },

  async getBuildings(): Promise<{ id: string; name: string; address: string }[]> {
    const json = await authFetch('/buildings');
    return json?.data?.buildings ?? [];
  },
};

export default workOrderService;
