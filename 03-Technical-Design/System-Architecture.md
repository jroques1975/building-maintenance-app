# System Architecture

## High‑Level Overview
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│    Backend      │────▶│   Database      │
│  (React Native) │     │   (Node.js)     │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Dashboard │     │   Cloud Storage │     │   External      │
│    (React)      │     │     (S3)        │     │   Services      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Component Details

### 1. Frontend
#### Mobile App (React Native)
- **Target:** iOS & Android
- **Key Screens:**
  - Login/Registration
  - Report Issue (camera, location picker, form)
  - My Requests (list with status)
  - Notifications
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation

#### Web Dashboard (React)
- **Target:** Building managers, owners
- **Key Screens:**
  - Dashboard (open/closed issues, metrics)
  - Request Queue (sort/filter/assign)
  - Maintenance Calendar
  - Analytics & Reports
- **UI Library:** Material‑UI or Chakra UI
- **Charts:** Recharts or Chart.js

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