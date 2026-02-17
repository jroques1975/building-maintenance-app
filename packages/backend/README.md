# Building Maintenance Backend API

**Multi-tenant Express.js backend** for the Building Maintenance SaaS platform.

## 🏗️ Architecture Features

- **Multi-tenant SaaS** - Built for commercialization from day one
- **Tenant Isolation** - Row-level security with automatic query filtering
- **Pricing Tiers** - Starter, Professional, Enterprise with plan enforcement
- **Role-based Access** - Within tenant: ADMIN > MANAGER > MAINTENANCE > TENANT
- **Real-time Updates** - WebSocket support for live status tracking
- **File Upload** - Tenant-specific S3 buckets for photos/documents

## 🛠 Tech Stack

- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js with multi-tenant middleware
- **Database:** PostgreSQL with Prisma ORM (tenant isolation)
- **Authentication:** JWT with tenant context + bcrypt
- **Validation:** Zod schemas with custom validators
- **Real-time:** WebSockets for live updates
- **Storage:** AWS S3 with tenant folder structure
- **Monitoring:** Structured logging with tenant context

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Navigate to the backend package:
   ```bash
   cd packages/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 🚀 API Endpoints

### **Tenant Management (Public)**
- `POST /api/tenants/signup` - Create new tenant/organization (14-day trial)
- `GET /api/tenants/check-subdomain/:subdomain` - Check subdomain availability

### **Tenant Administration (Authenticated)**
- `GET /api/tenants/me` - Get current tenant info (ADMIN/MANAGER)
- `PATCH /api/tenants/me` - Update tenant settings (ADMIN)
- `GET /api/tenants/stats` - Get tenant usage statistics
- `GET /api/tenants/users` - List users in tenant
- `GET /api/tenants/buildings` - List buildings in tenant

### **Super Admin (Platform)**
- `GET /api/tenants` - List all tenants (SUPER_ADMIN)
- `GET /api/tenants/:tenantId` - Get specific tenant details
- `PATCH /api/tenants/:tenantId` - Update tenant (suspend, change plan)

### **Authentication (Tenant-scoped)**
- `POST /api/auth/login` - User login (returns JWT with tenant context)
- `POST /api/auth/register` - Register new user within tenant
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### **Users (Tenant-scoped)**
- `GET /api/users` - List users in current tenant
- `POST /api/users` - Create user in current tenant
- `GET /api/users/:id` - Get user profile (within tenant)
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (ADMIN only)

### **Buildings (Tenant-scoped)**
- `GET /api/buildings` - List buildings in current tenant
- `POST /api/buildings` - Create building (subject to plan limits)
- `GET /api/buildings/:id` - Get building details
- `PUT /api/buildings/:id` - Update building
- `DELETE /api/buildings/:id` - Delete building (ADMIN only)

### **Issues (Tenant-scoped)**
- `GET /api/issues` - List issues in current tenant
- `POST /api/issues` - Submit new issue (with photo upload)
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue status
- `DELETE /api/issues/:id` - Delete issue (ADMIN only)

### **Work Orders (Tenant-scoped)**
- `GET /api/work-orders` - List work orders in current tenant
- `POST /api/work-orders` - Create work order
- `GET /api/work-orders/:id` - Get work order details
- `PUT /api/work-orders/:id` - Update work order
- `DELETE /api/work-orders/:id` - Delete work order (ADMIN only)

## 🗄️ Multi-Tenant Database Schema

### **Core Tenant Model**
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String   // Company name
  subdomain String   @unique  // acme-properties.buildingapp.com
  plan      TenantPlan @default(STARTER)
  status    TenantStatus @default(ACTIVE)
  settings  Json     @default("{}") // Tenant-specific configurations
  // ... relations to all tenant-scoped models
}
```

### **Tenant-Scoped Models (all include tenantId)**
- **User:** Tenants, building managers, maintenance staff (within tenant)
- **Building:** Physical buildings belonging to tenant
- **Issue:** Maintenance requests within tenant
- **WorkOrder:** Maintenance work within tenant
- **Attachment:** Photos and documents (tenant-specific storage)
- **Comment:** Discussions within tenant

### **Security Model**
- **Row-level isolation:** All queries filtered by `tenantId`
- **Composite unique constraints:** `@@unique([email, tenantId])`
- **Role hierarchy:** SUPER_ADMIN > ADMIN > MANAGER > MAINTENANCE > TENANT
- **Plan enforcement:** Limits based on subscription tier

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### 🏗️ Project Structure (Multi-tenant)

```
src/
├── index.ts                    # Application entry point with tenant routes
├── middleware/                 # Express middleware
│   ├── errorHandler.ts        # Global error handling
│   ├── notFoundHandler.ts     # 404 handler
│   ├── requestLogger.ts       # Structured logging
│   ├── auth-tenant.combined.ts # Combined auth + tenant middleware
│   └── tenant.middleware.ts   # Tenant context management
├── routes/                    # API route definitions
│   ├── tenant.routes.ts       # Tenant management (signup, admin)
│   ├── auth.routes.ts         # Authentication (tenant-scoped)
│   ├── building.routes.ts     # Building management (tenant-scoped)
│   ├── issue.routes.ts        # Issue management (tenant-scoped)
│   ├── workOrder.routes.ts    # Work order management (tenant-scoped)
│   ├── user.routes.ts         # User management (tenant-scoped)
│   └── health.routes.ts       # Health checks
├── controllers/               # Route controllers
├── services/                  # Business logic
├── utils/                     # Utility functions
│   ├── logger.ts             # Structured logging
│   └── auth.ts               # JWT with tenant context
└── prisma/
    ├── client.ts             # Prisma client instance
    └── schema.prisma         # Multi-tenant database schema
```

## Deployment

### Production Database

For production, update the `DATABASE_URL` in your `.env` file to use PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/building_maintenance"
```

### Build for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
docker build -t building-maintenance-backend .
docker run -p 3001:3001 building-maintenance-backend
```

## License

MIT