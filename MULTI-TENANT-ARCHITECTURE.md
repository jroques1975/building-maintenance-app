# Multi-Tenant Architecture - Building Maintenance App

## 🏗️ Architecture Overview

### **Core Principle:**
**"Build for multi-tenant from day one, evolve to hybrid when needed"**

### **Database Schema Design:**
```
Tenant (Organization)
├── User (belongs to Tenant)
├── Building (belongs to Tenant)
├── Issue (belongs to Tenant)
└── WorkOrder (belongs to Tenant)
```

### **Key Design Decisions:**

1. **Tenant Isolation at Database Level:**
   - Every table has `tenantId` column
   - All queries include `WHERE tenantId = ?`
   - Composite unique constraints: `@@unique([email, tenantId])`

2. **Authentication & Authorization:**
   - JWT tokens include `tenantId`
   - Middleware validates tenant context on every request
   - Role-based access control within tenant boundaries

3. **Data Security:**
   - Row-level security enforced by application
   - No cross-tenant data leakage possible
   - Tenant-specific encryption keys (future)

---

## 📊 Database Schema Updates

### **New Models:**

#### **1. Tenant Model**
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String   // Company name
  subdomain String   @unique  // acme-properties.buildingapp.com
  plan      TenantPlan @default(STARTER)
  status    TenantStatus @default(ACTIVE)
  settings  Json     @default("{}") // Tenant-specific configurations
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  users      User[]
  buildings  Building[]
  issues     Issue[]
  workOrders WorkOrder[]
}
```

#### **2. Updated User Model**
```prisma
model User {
  // ... existing fields ...
  tenantId  String  // Foreign key to Tenant
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  
  // Composite unique: email must be unique within tenant
  @@unique([email, tenantId])
}
```

### **Tenant Context Flow:**

```
1. User signs up → Creates Tenant + Admin User
2. User logs in → JWT includes tenantId
3. API Request → Middleware extracts tenantId from JWT
4. Database Query → Automatically filters by tenantId
5. Response → Only tenant's data returned
```

---

## 🔐 Security Implementation

### **Authentication Middleware:**
```typescript
// 1. Extract JWT token
const payload = AuthService.verifyToken(token);

// 2. Validate tenant exists and is active
const tenant = await prisma.tenant.findUnique({
  where: { id: payload.tenantId, status: 'ACTIVE' }
});

// 3. Set tenant context on request
req.tenant = {
  tenantId: payload.tenantId,
  tenantPlan: tenant.plan,
  userId: payload.userId,
  userRole: payload.role
};
```

### **Tenant-Scoped Database Queries:**
```typescript
// All queries automatically include tenant filter
const tenantPrisma = getTenantPrisma(req.tenant.tenantId);

// This query only returns buildings for this tenant
const buildings = await tenantPrisma.building.findMany({
  where: { /* automatically adds tenantId filter */ }
});
```

### **Role Hierarchy within Tenant:**
```
SUPER_ADMIN (Platform) > ADMIN (Tenant) > MANAGER > MAINTENANCE > TENANT
```

---

## 🚀 API Endpoints

### **Public Endpoints (No Authentication):**
```
POST   /api/tenants/signup          # Create new tenant/organization
GET    /api/tenants/check-subdomain/:subdomain
```

### **Tenant Admin Endpoints:**
```
GET    /api/tenants/me              # Get current tenant info
PATCH  /api/tenants/me              # Update tenant settings
GET    /api/tenants/stats           # Get tenant usage statistics
GET    /api/tenants/users           # List users in tenant
GET    /api/tenants/buildings       # List buildings in tenant
```

### **Super Admin Endpoints:**
```
GET    /api/tenants/                # List all tenants (platform view)
GET    /api/tenants/:tenantId       # Get specific tenant details
PATCH  /api/tenants/:tenantId       # Update tenant (suspend, change plan)
```

### **Tenant-Scoped Resource Endpoints:**
```
# All these automatically scope to current tenant
GET    /api/users                   # Only users in current tenant
POST   /api/buildings              # Building created in current tenant
GET    /api/issues                 # Only issues in current tenant
```

---

## 💰 Pricing & Plans

### **Plan Tiers:**

#### **Starter Plan ($0.75/unit/month)**
- Up to 5 buildings
- Up to 100 units
- Basic features
- Email support
- 14-day free trial

#### **Professional Plan ($1.50/unit/month)**
- Up to 50 buildings
- Up to 1,000 units
- Advanced reporting
- API access
- Priority support
- Custom branding

#### **Enterprise Plan (Custom Pricing)**
- Unlimited buildings/units
- Dedicated instance option
- SSO integration
- Custom development
- SLA guarantee
- On-premise deployment

### **Plan Enforcement:**
```typescript
// Middleware checks plan limits
const checkTenantPlanLimit = async (req, res, next) => {
  const buildingCount = await prisma.building.count({
    where: { tenantId: req.tenant.tenantId }
  });
  
  const limit = planLimits[req.tenant.tenantPlan];
  if (buildingCount >= limit) {
    throw new Error('Plan limit exceeded');
  }
  next();
};
```

---

## 🏢 Tenant Onboarding Flow

### **Step 1: Sign Up**
```
POST /api/tenants/signup
{
  "name": "Acme Properties",
  "subdomain": "acme-properties",
  "adminEmail": "admin@acme.com",
  "adminPassword": "secure123",
  "adminFirstName": "John",
  "adminLastName": "Doe"
}
```

### **Step 2: Automatic Setup**
1. Creates Tenant record
2. Creates Admin User
3. Creates default Building
4. Sets up trial period (14 days)
5. Returns JWT token

### **Step 3: First Login**
1. User logs in with admin credentials
2. Directed to onboarding wizard
3. Sets up first building details
4. Invites team members
5. Configures notification preferences

---

## 🔧 Technical Implementation

### **Prisma Client Extension:**
```typescript
// Automatically adds tenantId to all queries
const tenantPrisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (['findMany', 'findUnique', 'findFirst'].includes(operation)) {
          args.where = { ...args.where, tenantId };
        }
        if (operation === 'create') {
          args.data = { ...args.data, tenantId };
        }
        return query(args);
      }
    }
  }
});
```

### **Environment Configuration:**
```env
# Multi-tenant settings
TENANT_DEFAULT_PLAN=STARTER
TENANT_TRIAL_DAYS=14
TENANT_SUBDOMAIN_PATTERN=/^[a-z0-9-]+$/

# Database (shared for multi-tenant)
DATABASE_URL=postgresql://user:pass@localhost:5432/building_app

# Future: Separate databases per tenant
# DATABASE_URL_PREFIX=postgresql://user:pass@localhost:5432/
```

### **Migration Strategy:**
```sql
-- Add tenantId to existing tables
ALTER TABLE users ADD COLUMN tenant_id VARCHAR(255);
ALTER TABLE buildings ADD COLUMN tenant_id VARCHAR(255);
ALTER TABLE issues ADD COLUMN tenant_id VARCHAR(255);

-- Create tenants table
CREATE TABLE tenants (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'STARTER',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📈 Scaling Considerations

### **Phase 1: Shared Database (Now)**
- Single PostgreSQL database
- All tenants share tables
- Row-level isolation via `tenantId`
- Simple to manage, lower cost

### **Phase 2: Database per Tenant (Future)**
```typescript
// Dynamic database connections
function getTenantDatabase(tenantId: string) {
  const databaseUrl = `${DATABASE_URL_PREFIX}tenant_${tenantId}`;
  return new PrismaClient({ datasourceUrl: databaseUrl });
}
```

### **Phase 3: Hybrid Approach (Enterprise)**
- Small tenants: Shared database
- Medium tenants: Database pool
- Large tenants: Dedicated database
- Enterprise: On-premise deployment

---

## 🛡️ Security & Compliance

### **Data Isolation Guarantees:**
1. **Application Level:** All queries filtered by `tenantId`
2. **Database Level:** Row-level security (PostgreSQL RLS)
3. **Network Level:** Tenant-specific database users
4. **Encryption:** Tenant-specific encryption keys

### **Compliance Features:**
- **GDPR:** Data export per tenant
- **HIPAA:** Audit logging per tenant  
- **SOC2:** Tenant isolation documentation
- **ISO27001:** Access controls per tenant

### **Audit Logging:**
```typescript
// Log all tenant actions
const auditLog = {
  tenantId: req.tenant.tenantId,
  userId: req.user.userId,
  action: req.method,
  resource: req.path,
  timestamp: new Date(),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
};
```

---

## 🚀 Deployment & Operations

### **Development:**
```bash
# Single database for all tenants
docker-compose up -d postgres
npm run dev
```

### **Production (Multi-tenant SaaS):**
```bash
# Shared infrastructure
AWS RDS (PostgreSQL) - 1 database
AWS ECS/EKS - Containerized app
AWS S3 - Tenant-specific folders
CloudFront - Tenant subdomains
```

### **Monitoring:**
```typescript
// Tenant-aware metrics
const metrics = {
  tenantId: req.tenant.tenantId,
  endpoint: req.path,
  responseTime: Date.now() - startTime,
  statusCode: res.statusCode,
  plan: req.tenant.tenantPlan
};

// Send to monitoring system
sendMetrics(metrics);
```

---

## 🔄 Migration Path to Single-Tenant

### **Option 1: Database Export**
```sql
-- Export tenant data
COPY (SELECT * FROM issues WHERE tenant_id = 'tenant-123') 
TO '/backups/tenant-123-issues.csv';
```

### **Option 2: Containerized Deployment**
```dockerfile
# Single-tenant Docker image
FROM node:18
COPY --from=builder /app .
ENV TENANT_ID=client-123
ENV DATABASE_URL=postgresql://client-123:pass@db:5432/client-123
CMD ["npm", "start"]
```

### **Option 3: Kubernetes Namespace**
```yaml
# Tenant-specific namespace
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-acme-properties
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: building-app
  namespace: tenant-acme-properties
```

---

## ✅ Success Metrics

### **Technical Metrics:**
- Query performance with 100+ tenants
- Database connection pooling efficiency
- Tenant isolation validation (security audits)
- Migration time from shared to dedicated

### **Business Metrics:**
- Time to onboard new tenant: < 5 minutes
- Tenant churn rate: < 5% monthly
- Average revenue per tenant: $500/month
- Support tickets per tenant: < 2/month

### **Operational Metrics:**
- Uptime: 99.9% SLA
- Incident response time: < 15 minutes
- Backup/restore time: < 1 hour
- Tenant data export time: < 10 minutes

---

## 🎯 Next Steps

### **Immediate (Week 1-2):**
1. ✅ Update database schema with `tenantId`
2. ✅ Implement tenant middleware
3. ✅ Create tenant signup flow
4. ✅ Update existing APIs for tenant context

### **Short-term (Month 1):**
1. Implement tenant admin dashboard
2. Add plan enforcement middleware
3. Create tenant usage analytics
4. Set up tenant billing system

### **Medium-term (Month 2-3):**
1. Add tenant-specific customizations
2. Implement tenant data export
3. Create super admin portal
4. Add multi-region support

### **Long-term (Month 4-6):**
1. Database-per-tenant option
2. On-premise deployment option
3. White-label branding
4. Marketplace for tenant apps

---

## 📚 References

### **Prisma Multi-tenancy:**
- [Prisma Data Guide: Multi-tenancy](https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#multi-tenancy)
- [Row-level Security](https://www.prisma.io/docs/orm/prisma-client/security/row-level-security)

### **AWS Multi-tenant SaaS:**
- [AWS SaaS Factory](https://aws.amazon.com/solutions/implementations/saas-factory/)
- [SaaS Storage Strategies](https://d1.awsstatic.com/whitepapers/saas-storage-strategies.pdf)

### **Security Best Practices:**
- [OWASP SaaS Security](https://owasp.org/www-project-saas-security/)
- [NIST Cloud Security](https://csrc.nist.gov/projects/cloud-computing)

---

**Last Updated:** February 16, 2026  
**Architecture Version:** 1.0 (Multi-tenant Foundation)  
**Next Review:** Sprint 3 Planning (February 20, 2026)