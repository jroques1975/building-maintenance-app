# System Architecture - Multi-Tenant SaaS

## 🏗️ High‑Level Overview (Multi-tenant)
```
┌─────────────────────────────────────────────────────────────┐
│                    SaaS PLATFORM                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   TENANT A  │  │   TENANT B  │  │   TENANT C  │        │
│  │  (Acme Co)  │  │ (Beta Prop) │  │ (Gamma Mgmt)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │               │               │                  │
│         ▼               ▼               ▼                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │            MULTI-TENANT BACKEND API                │   │
│  │          (Tenant-aware middleware)                 │   │
│  └────────────────────────────────────────────────────┘   │
│         │               │               │                  │
│         ▼               ▼               ▼                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │          SHARED POSTGRESQL DATABASE               │   │
│  │       (Row-level tenant isolation)                │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                            │
         ▼                            ▼
┌─────────────────┐        ┌─────────────────┐
│   Mobile Apps   │        │  Web Dashboards │
│ (React Native)  │        │    (React)      │
│ • Tenant login  │        │ • Admin portal  │
│ • Issue reports │        │ • Analytics     │
│ • Notifications │        │ • User management│
└─────────────────┘        └─────────────────┘
```

## 🎯 Multi-Tenant Architecture Principles

### **Core Design:**
1. **Tenant Isolation:** Row-level security in shared database
2. **Tenant Context:** JWT includes `tenantId` for all requests
3. **Automatic Filtering:** All queries scoped to current tenant
4. **Plan Enforcement:** Feature gates based on subscription tier

### **Deployment Options:**
- **SaaS Multi-tenant:** Shared infrastructure (default)
- **Dedicated Instance:** Database per tenant (enterprise)
- **On-premise:** Self-hosted Docker/Kubernetes

## 🏢 Component Details

### 1. Frontend (Tenant-aware)
#### Mobile App (React Native)
- **Multi-tenant login:** Users select/organization
- **Tenant context:** All API calls include tenant headers
- **Offline support:** Tenant-specific data caching
- **Push notifications:** Tenant-branded messages

#### Web Dashboard (React)
- **Tenant admin portal:** User/building management
- **Usage analytics:** Tenant-specific metrics
- **Billing portal:** Subscription management
- **White-label options:** Custom branding per tenant

### 2. Backend (Multi-tenant API)
#### Tenant Management Layer
- **Tenant signup:** Self-service with trial period
- **Subdomain routing:** `{tenant}.buildingapp.com`
- **Plan enforcement:** Feature gates based on subscription
- **Usage tracking:** Metrics for billing

### 2. Backend (Node.js + Express)
#### API Layer
- **RESTful endpoints** with JWT authentication
- **Role‑based permissions** (tenant, manager, technician, admin)
- **Rate limiting** and request validation

#### Key Modules
- `auth/` – registration, login, password reset
- `issues/` – create, read, update, delete repair requests
- `work-orders/` – assignment, status updates, history
- `maintenance/` – scheduled tasks, calendar events
- `notifications/` – SMS, email, push notifications
- `analytics/` – reporting, dashboards, exports

### 3. Database (PostgreSQL)
#### Schema Highlights
```sql
-- Core tables
users (id, email, role, building_id, phone, ...)
buildings (id, address, units, manager_id, ...)
issues (id, title, description, priority, status, reporter_id, assignee_id, ...)
work_orders (id, issue_id, technician_id, scheduled_date, completed_date, cost, ...)
maintenance_schedules (id, building_id, equipment_type, frequency, last_performed, ...)
attachments (id, issue_id, url, file_type, uploaded_at, ...)
notifications (id, user_id, type, content, sent_at, read, ...)
```

#### Indexes
- `issues(status, priority, created_at)` – for dashboard sorting
- `work_orders(technician_id, scheduled_date)` – for technician views
- `maintenance_schedules(building_id, next_due_date)` – for calendar alerts

### 4. External Services
#### Cloud Storage (AWS S3)
- **Purpose:** Store photos, PDF invoices, documents
- **Structure:** `/{tenant-id}/{issue-id}/{timestamp}-{filename}.jpg`
- **Access:** Pre‑signed URLs for secure temporary access

#### Notifications
- **SMS:** Twilio (US/Canada) or Vonage (international)
- **Email:** SendGrid or AWS SES
- **Push:** Firebase Cloud Messaging (FCM) for mobile

#### Payments (Future)
- **Vendor payments:** Stripe Connect
- **Tenant fees:** Stripe Subscriptions (for premium features)

### 5. Deployment & Infrastructure
#### Hosting (AWS)
- **Backend:** Elastic Beanstalk or ECS (Docker)
- **Database:** RDS PostgreSQL with read replicas for reporting
- **Storage:** S3 + CloudFront for static assets
- **CDN:** CloudFront for global low‑latency

#### CI/CD
- **GitHub Actions** for automated testing and deployment
- **Docker** for consistent environments
- **Infrastructure as Code:** Terraform or AWS CDK

### 6. Security Considerations
- **Authentication:** JWT with short expiry + refresh tokens
- **Authorization:** Role‑based access control (RBAC)
- **Data Encryption:** TLS everywhere, encrypted at rest (RDS, S3)
- **Audit Logs:** All sensitive operations logged to CloudWatch
- **Compliance:** GDPR, CCPA, HIPAA (if handling health‑related buildings)

### 7. Monitoring & Observability
- **Logging:** Winston → CloudWatch Logs
- **Metrics:** Prometheus + Grafana (or AWS CloudWatch Metrics)
- **APM:** New Relic or AWS X‑Ray for performance tracing
- **Alerts:** CloudWatch Alarms for error rates, latency spikes

---

## Development Environment
### Local Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env  # configure DB, S3, Twilio keys
npm run dev

# Mobile App
cd mobile
npm install
npx react-native run-ios  # or run-android

# Web Dashboard
cd web
npm install
npm start
```

### Testing Strategy
- **Unit Tests:** Jest for backend, React Testing Library for frontend
- **Integration Tests:** Supertest for API endpoints
- **E2E Tests:** Detox for mobile, Cypress for web
- **Load Testing:** k6 for API performance

---
*Architecture version: 1.0. Updated: 2026‑02‑13*