# Shared Library

Shared TypeScript types, utilities, and constants used across backend, web, and mobile.

## Purpose
- Avoid duplication of types/interfaces
- Share validation schemas
- Common utility functions
- API client configuration

## Contents

### Types
```typescript
// Example: Issue type used across all platforms
export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  // ...
}
```

### Validation Schemas
```typescript
// Zod schemas shared between frontend and backend
export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
});
```

### Constants
```typescript
export const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  emergency: '#F44336',
};

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
```

### Utilities
```typescript
// Format dates consistently
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
```

## Usage

### Installation in Other Packages
```bash
# In backend, web, or mobile package
npm install @building-maintenance-app/shared
```

### Importing
```typescript
import { Issue, PRIORITY_COLORS, createIssueSchema } from '@building-maintenance-app/shared';
```

## Development

### Building
```bash
cd packages/shared
npm run build
```

### Watching for Changes
```bash
npm run dev
```

## Project Structure
```
shared/
├── src/
│   ├── types/         # TypeScript interfaces
│   ├── schemas/       # Zod validation schemas
│   ├── constants/     # App-wide constants
│   ├── utils/         # Utility functions
│   └── api/          # API client configuration
├── dist/              # Compiled output
└── tests/             # Unit tests
```