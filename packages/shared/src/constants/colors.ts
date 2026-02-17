export const PRIORITY_COLORS = {
  low: '#4CAF50',      // Green
  medium: '#FFC107',   // Amber
  high: '#FF9800',     // Orange
  emergency: '#F44336', // Red
} as const;

export const STATUS_COLORS = {
  open: '#2196F3',      // Blue
  assigned: '#9C27B0',  // Purple
  in_progress: '#FF9800', // Orange
  completed: '#4CAF50',  // Green
  closed: '#9E9E9E',    // Gray
} as const;

export const ROLE_COLORS = {
  tenant: '#2196F3',     // Blue
  technician: '#FF9800', // Orange
  manager: '#9C27B0',    // Purple
  admin: '#F44336',      // Red
} as const;