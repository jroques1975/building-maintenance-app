// API configuration
// Guard against browser runtime where `process` is undefined.
const processEnv = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env)
  ? (globalThis as any).process.env
  : undefined;

export const API_BASE_URL = processEnv?.API_BASE_URL || 'http://localhost:3001';
export const API_TIMEOUT = 30000; // 30 seconds

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  issues: {
    base: '/issues',
    byId: (id: string) => `/issues/${id}`,
    byBuilding: (buildingId: string) => `/issues?buildingId=${buildingId}`,
    myIssues: '/issues/my',
    assign: (id: string) => `/issues/${id}/assign`,
    status: (id: string) => `/issues/${id}/status`,
  },
  buildings: {
    base: '/buildings',
    byId: (id: string) => `/buildings/${id}`,
    units: (id: string) => `/buildings/${id}/units`,
  },
  users: {
    base: '/users',
    byId: (id: string) => `/users/${id}`,
    profile: '/users/profile',
  },
  workOrders: {
    base: '/work-orders',
    byId: (id: string) => `/work-orders/${id}`,
    myAssignments: '/work-orders/my',
  },
} as const;