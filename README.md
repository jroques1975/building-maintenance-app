# Building Maintenance App

A multi-tenant SaaS platform to streamline repair requests and preventive maintenance for HOA and property management operators.

Tenants submit issues → Managers assign to staff → Staff completes work orders.

---

## Architecture Overview

### Multi-Tenant Model
- Building-centric records that persist across management company transitions
- Tenant isolation at database level (row-level security via `tenantId` on all queries)
- Role-based access: `TENANT`, `MAINTENANCE`, `MANAGER`, `ADMIN`, `SUPER_ADMIN`
- Operator (management company) model with portfolio views across buildings

### Technology Stack

| Layer | Stack |
|---|---|
| Frontend web | React 18, TypeScript, MUI v5, Redux Toolkit, React Query, React Router v6, Vite |
| Backend | Node.js, Express, TypeScript, Prisma v5 |
| Database | PostgreSQL 16 |
| Auth | JWT with tenant context |
| Storage | AWS S3 (presigned PUT/GET, 1hr expiry) |
| Validation | Zod (shared schemas in `packages/shared`) |
| DevOps | Docker Compose, GitHub Actions CI, Husky pre-commit hooks |
| Production | Ubuntu 24.04 VPS, PM2, Nginx, native PostgreSQL |

---

## Project Structure

```
Building Maintenance App/
├── packages/
│   ├── backend/         Express API server (port 3002)
│   ├── web/             React web dashboard (port 3000)
│   ├── mobile/          React Native/Expo (boilerplate only)
│   └── shared/          Shared TypeScript types, Zod schemas, constants
├── 01-Project-Home/     Executive summary, status, vision
├── 02-Functional-Spec/  User stories, use cases, backlog
├── 03-Technical-Design/ Architecture, database, tech decisions
├── 04-UI-UX/            Wireframes, user flows, design system
├── 05-Development/      Sprint plans, implementation status, testing
├── 06-Deployment-Ops/   Hosting, CI/CD, monitoring
├── 07-Marketing-Launch/ Go-to-market, onboarding
└── 08-References/       Competitors, regulations, contacts
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)
- AWS credentials with access to `amzn-building-app` S3 bucket

### Running locally

```bash
# Backend (port 3002)
cd packages/backend
PORT=3002 npm run dev

# Web (port 3000)
cd packages/web
npm run dev -- --host 0.0.0.0 --port 3000
```

### Environment

`packages/web/.env`:
```
VITE_API_URL=http://localhost:3002/api
VITE_ENABLE_MOCK_API=false
```

### Database

```bash
cd packages/backend
npx prisma db push          # Apply schema changes
npx prisma db seed          # Seed test data (60+ users)
npx prisma studio           # Open Prisma Studio GUI
```

### Test credentials (password: `password123`)

| Role | Email |
|---|---|
| Admin | `admin@skylinemanagement.com` |
| Manager | `sarah.johnson@skylinemanagement.com` |
| Manager | `robert.garcia@skylinemanagement.com` |
| Maintenance | `james.wilson@skylinemanagement.com` |
| Maintenance | `maria.rodriguez@skylinemanagement.com` |
| Tenant | `alex.martin@example.com` |
| Tenant | `jennifer.lee@example.com` |

---

## Pages & Routes

| Route | Page | Roles |
|---|---|---|
| `/` | Role-routed dashboard | All |
| `/issues` | Issues list (paginated, server-side search) | MAINTENANCE, MANAGER, ADMIN |
| `/issues/:id` | Issue detail (linked WOs, comments, assign/status/close, link/unlink WO) | All |
| `/work-orders` | Work orders list (paginated) | MANAGER, ADMIN |
| `/work-orders/:id` | Work order detail | MAINTENANCE, MANAGER, ADMIN |
| `/operator-continuity` | Portfolio + per-building timeline | MANAGER, ADMIN |
| `/users` | User management (deactivate/soft-delete) | ADMIN, SUPER_ADMIN |
| `/buildings` | Buildings list | MANAGER, ADMIN |
| `/buildings/:id` | Building detail | MANAGER, ADMIN |
| `/login`, `/register` | Public | — |

### Dashboard routing by role
- `TENANT` → TenantDashboard
- `MAINTENANCE` → MaintenanceDashboard
- `MANAGER` → ManagerDashboard
- `ADMIN` / `SUPER_ADMIN` → AdminDashboard

---

## API

| Environment | Base URL |
|---|---|
| Local dev | `http://localhost:3002/api` |
| Tailscale dev | `http://100.78.107.25:3002/api` |
| Production | `http://159.203.83.145/api` |

- **Auth:** `Authorization: Bearer <jwt>`
- All routes carry tenant context via JWT claims.

### Route groups
| Group | Key endpoints |
|---|---|
| `/api/auth` | `POST /login`, `POST /register` |
| `/api/issues` | CRUD, `POST /:id/assign`, `POST /:id/status`, `POST /:id/close`, `DELETE /:id`, `GET /:id/comments`, `POST /:id/comments` |
| `/api/work-orders` | CRUD (issueId nullable — link/unlink), `POST /:id/comments` |
| `/api/buildings` | CRUD |
| `/api/users` | CRUD, deactivate |
| `/api/uploads` | `POST /presign` (S3 presigned PUT) |
| `/api/operators` | Operator periods |

---

## Design System

**Status: LOCKED** (`05-Development/DESIGN-STYLE-LOCK.md`)

| Token | Value |
|---|---|
| Background | Soft blue gradient `#f0f8ff` → `#e6f2ff` |
| Surface | White cards, 16px border-radius, subtle shadow |
| Primary | iOS blue `#007AFF` |
| Border | `#dee2e6` / input `#ced4da` |
| Typography | System font stack (`-apple-system`, `Segoe UI`, Roboto) |
| Buttons | Blue primary, 8px radius, white text |
| Inputs | 2px border, 10px radius, blue focus |

Canonical UI prototypes (source of truth):
- Tenant: `http://100.78.107.25:8088/prototype-clean.html`
- Manager: `http://100.78.107.25:8088/manager-dashboard/manager-dashboard.html`

---

## What's Working (Feb 2026)

- JWT auth + tenant context on all routes; role-based authorization middleware
- All dashboards wired to live API (no mock data except AdminDashboard system health metrics)
- Issues: full CRUD, server-side search (400ms debounce), photo attachments (up to 4, S3 presigned), assign + status update
- **Issue close flow**: `POST /issues/:id/close` — warns if open WOs exist, accepts `closureNote`, `force` override; creates comment on close
- **Issue delete**: `DELETE /issues/:id` — nulls `issueId` on linked WOs before deleting (no cascade)
- **WO link/unlink**: `PUT /work-orders/:id` accepts `issueId` (nullable); IssueDetailPage has Link/Unlink UI
- Work orders: full CRUD, role-gated actions, optional Related Issue selector on create
- Operator Continuity: portfolio view, per-building timeline, search filter
- Buildings: list + detail pages
- Users: list, deactivate/soft-delete, `isActive` + `lastLoginAt` fields
- Pagination: server-side, 20 items/page on Issues and Work Orders
- Vite code splitting via `React.lazy` (per-page chunks)
- Multi-tenant isolation, Docker dev environment, seed data, CI pipelines
- **Production deployment** live at `http://159.203.83.145` (PM2 + Nginx + PostgreSQL native on 1GB VPS)

---

## Known Issues / Technical Debt

1. **ActivityFeed** — Derived from 8 most recently updated issues; no dedicated activity log table.
2. **AdminDashboard system health** — API response time, DB connections, uptime are hardcoded metrics.

---

## Production

- **URL**: `http://159.203.83.145`
- **Deploy guide**: `06-Deployment-Ops/DEPLOYMENT-PLAN.md`
- Frontend built locally (server 1GB RAM — Vite OOMs), rsync'd to `/var/www/building-maintenance/`
- Backend managed by PM2, auto-restarts on crash/reboot
- S3 CORS must be set manually in AWS Console (IAM user lacks `PutBucketCORS`)

---

## Next Steps

1. **UI polish** — Full visual parity against canonical prototypes across all pages.
2. **Production hardening** — HTTPS/TLS, domain name, monitoring.

---

## Key Reference Files

- `packages/backend/prisma/schema.prisma` — DB schema (11 models, 9 enums)
- `packages/backend/prisma/seed.ts` — Test data
- `packages/web/src/App.tsx` — React Router + protected routes
- `05-Development/DESIGN-STYLE-LOCK.md` — Visual design tokens (locked)
- `05-Development/UI-SOURCE-OF-TRUTH.md` — Canonical prototype references
- `05-Development/PHASE-IMPLEMENTATION-STATUS-2026-02-21.md` — Last sprint status
- `06-Deployment-Ops/DEPLOYMENT-PLAN.md` — Full production deploy guide
- `Agent continuity.md` — Handoff doc with runtime/seed/known issues

---

**Last Updated:** 2026-02-28
**Repository:** https://github.com/jroques1975/building-maintenance-app
**Production:** http://159.203.83.145
