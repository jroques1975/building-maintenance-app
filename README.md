# Building Maintenance App

A **multi-tenant SaaS platform** to streamline repair requests and preventive maintenance for property management companies.

## 🏗️ Architecture Overview

### **Multi-Tenant SaaS Platform**
- **Built for commercialization** from day one
- **Tenant isolation** at database level (row-level security)
- **Pricing tiers:** Starter, Professional, Enterprise
- **Deployment options:** SaaS, Dedicated, On-premise

### **Core Technology Stack**
- **Frontend:** React Native (mobile) + React/TypeScript (web)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with tenant context
- **Real-time:** WebSockets for live updates
- **Storage:** AWS S3 for tenant-specific media

## 📁 Project Structure
```
Building Maintenance App/
├── packages/                  # Monorepo packages
│   ├── backend/              # Multi-tenant API server
│   ├── web/                  # React web dashboard
│   ├── mobile/               # React Native mobile app
│   └── shared/               # Shared types & utilities
├── 01-Project-Home/          # Executive summary, status, vision
├── 02-Functional-Spec/       # User stories, use cases, backlog
├── 03-Technical-Design/      # Architecture, database, tech decisions
├── 04-UI-UX/                 # Wireframes, user flows, design system
├── 05-Development/           # Sprint plans, code, testing
├── 06-Deployment-Ops/        # Hosting, CI/CD, monitoring
├── 07-Marketing-Launch/      # Go‑to‑market, onboarding
└── 08-References/            # Competitors, regulations, contacts
```

## 🚀 Getting Started

### 1. Understand the Architecture
- Read **[Multi-Tenant Architecture](MULTI-TENANT-ARCHITECTURE.md)** for technical overview
- Study **[System Architecture](03-Technical-Design/System-Architecture.md)** for component design
- Review **[Tech Stack Decisions](03-Technical-Design/Tech-Stack-Decisions.md)** for technology choices

### 2. Development Setup
```bash
# Clone repository
git clone https://github.com/jroques1975/building-maintenance-app.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run development
npm run dev
```

### 3. API Documentation
- **Base URL:** `http://localhost:3001/api`
- **Authentication:** JWT Bearer tokens with tenant context
- **Tenant Signup:** `POST /api/tenants/signup`
- **API Health:** `GET /api/health`

## 🎯 Current Status (Sprint 2 Complete)

### **✅ Completed:**
1. **Multi-tenant database schema** with tenant isolation
2. **Authentication middleware** with tenant context
3. **Tenant management API** (signup, admin, super admin)
4. **User research** (1 manager interview + 10 tenant surveys)
5. **Updated personas** with real research data
6. **Development environment** (Docker, CI/CD, testing)

### **🚀 Next Sprint (Sprint 3 - UI/UX Design):**
1. **Wireframe core features** based on research findings
2. **Implement photo upload** (70% of tenants already use photos)
3. **Real-time status tracking** (most requested feature)
4. **SMS notifications** (70% tenant preference)

## 🏢 Multi-Tenant Features

### **Tenant Management:**
- **Self-service signup** with 14-day trial
- **Subdomain routing** (acme-properties.buildingapp.com)
- **Plan enforcement** (Starter: 5 buildings, Pro: 50, Enterprise: unlimited)
- **Usage analytics** per tenant

### **Security & Isolation:**
- **Row-level security** (all queries filtered by tenantId)
- **Role-based access control** within tenant
- **Audit logging** with tenant context
- **Data export** for compliance

### **Commercialization Ready:**
- **Pricing tiers** with feature gates
- **Billing integration** ready (Stripe/Paddle)
- **White-label option** for enterprise
- **On-premise deployment** path

## 📊 Research Insights (Validated)

### **Tenant Needs (10 surveys):**
- **Top frustration:** Having to be home (60%)
- **Communication preference:** SMS (70%)
- **Tech readiness:** 80% comfortable with apps
- **Photo usage:** 70% already take photos of issues

### **Manager Needs (1 interview):**
- **Visibility** into open/overdue tasks
- **Real-time tracking** of maintenance status
- **Miami-specific:** AC tracking, hurricane workflows
- **Bilingual support** (English/Spanish)

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:backend      # Backend only
npm run dev:web          # Web dashboard
npm run dev:mobile       # Mobile app

# Database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Testing
npm run test             # Run all tests
npm run test:backend     # Backend tests
npm run test:web         # Web tests

# Production
npm run build            # Build all packages
npm run start            # Start production
```

## 📈 Deployment Options

### **Option 1: SaaS Multi-tenant (Recommended)**
- Shared PostgreSQL database
- Tenant isolation at application level
- Lowest operational cost
- Fastest time to market

### **Option 2: Dedicated Instances**
- Database per tenant (or tenant group)
- Better isolation for enterprise clients
- Higher cost, higher margin

### **Option 3: On-premise**
- Docker/Kubernetes deployment
- Full control for large organizations
- Highest margin, most complex

## 📞 Contact & Updates

- **Project Lead:** Javier
- **Technical Lead:** Orion (AI assistant)
- **Repository:** https://github.com/jroques1975/building-maintenance-app
- **Last Updated:** 2026‑02‑16
- **Status:** Sprint 2 Complete - Multi-tenant foundation built

---
*This is a commercial-grade multi-tenant SaaS platform ready for MVP development and customer acquisition.*