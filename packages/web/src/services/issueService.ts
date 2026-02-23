import { API_ENDPOINTS } from '@shared/constants';
import { Issue, CreateIssueDto, UpdateIssueDto, PaginatedResponse, IssueFilter } from '@shared/types';
import { tokenService } from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_API === 'true' || false;

// Mock data for development
const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'AC not cooling properly',
    description: 'The air conditioner is blowing warm air.',
    category: 'HVAC',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    location: 'Living room',
    buildingId: 'building-1',
    submittedById: 'user-1',
    assignedToId: 'user-3',
    estimatedCost: 350,
    actualCost: undefined,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completedDate: undefined,
    createdAt: new Date('2024-02-19'),
    updatedAt: new Date('2024-02-19'),
  },
  // Add more mock issues as needed
];

const issueService = {
  async getIssues(filter: IssueFilter = {}): Promise<PaginatedResponse<Issue>> {

    if (ENABLE_MOCK) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Apply simple filtering
      let filtered = mockIssues;
      if (filter.priority) {
        filtered = filtered.filter(issue => issue.priority === filter.priority);
      }
      if (filter.status) {
        filtered = filtered.filter(issue => issue.status === filter.status);
      }
      
      return {
        data: filtered,
        meta: {
          page: 1,
          limit: 20,
          total: filtered.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Build query string from filter
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.issues.base}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch issues' }));
      throw new Error(error.message || 'Failed to fetch issues');
    }

    const data = await response.json();
    return data.data; // Assuming backend returns { status: 'success', data: PaginatedResponse }
  },

  async getIssue(id: string): Promise<Issue> {
    if (ENABLE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const issue = mockIssues.find(i => i.id === id);
      if (!issue) throw new Error('Issue not found');
      return issue;
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.issues.byId(id)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch issue' }));
      throw new Error(error.message || 'Failed to fetch issue');
    }

    const data = await response.json();
    return data.data.issue;
  },

  async createIssue(issueData: CreateIssueDto): Promise<Issue> {
    if (ENABLE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newIssue: Issue = {
        ...issueData,
        id: `mock-${Date.now()}`,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        actualCost: undefined,
        completedDate: undefined,
        scheduledDate: issueData.scheduledDate,
        assignedToId: undefined,
        submittedById: 'current-user',
      };
      mockIssues.push(newIssue);
      return newIssue;
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.issues.base}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create issue' }));
      throw new Error(error.message || 'Failed to create issue');
    }

    const data = await response.json();
    return data.data.issue;
  },

  async updateIssue(id: string, updateData: UpdateIssueDto): Promise<Issue> {
    if (ENABLE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockIssues.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Issue not found');
      mockIssues[index] = { ...mockIssues[index], ...updateData, updatedAt: new Date() };
      return mockIssues[index];
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.issues.byId(id)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update issue' }));
      throw new Error(error.message || 'Failed to update issue');
    }

    const data = await response.json();
    return data.data.issue;
  },

  async assignIssue(id: string, assigneeId: string): Promise<Issue> {
    if (ENABLE_MOCK) {
      return this.updateIssue(id, { assignedToId: assigneeId });
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.issues.assign(id)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assigneeId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to assign issue' }));
      throw new Error(error.message || 'Failed to assign issue');
    }

    const data = await response.json();
    return data.data.issue;
  },

  async updateIssueStatus(id: string, status: string): Promise<Issue> {
    if (ENABLE_MOCK) {
      return this.updateIssue(id, { status } as any);
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.issues.status(id)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update issue status' }));
      throw new Error(error.message || 'Failed to update issue status');
    }

    const data = await response.json();
    return data.data.issue;
  },

  async getMyIssues(): Promise<PaginatedResponse<Issue>> {
    if (ENABLE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Filter issues submitted by current user
      const myIssues = mockIssues.filter(issue => issue.submittedById === 'current-user');
      return {
        data: myIssues,
        meta: {
          page: 1,
          limit: 20,
          total: myIssues.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Backend route is /api/issues/my-issues (note: differs from shared constant)
    const response = await fetch(`${API_BASE}/issues/my-issues`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch my issues' }));
      throw new Error(error.message || 'Failed to fetch my issues');
    }

    const json = await response.json();

    // Backend shape: { status: 'success', data: { issues: Issue[] }, meta: { total, page, limit, pages } }
    const issues = json?.data?.issues ?? [];
    const meta = json?.meta;

    return {
      data: issues,
      meta: {
        page: meta?.page ?? 1,
        limit: meta?.limit ?? 20,
        total: meta?.total ?? issues.length,
        totalPages: meta?.pages ?? 1,
        hasNext: meta?.page ? meta.page < (meta.pages ?? 1) : false,
        hasPrev: meta?.page ? meta.page > 1 : false,
      },
    };
  },
};

export default issueService;