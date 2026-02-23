# Agent continuity.md

> Purpose: make it possible for any agent (or future me) to pick up the Building Maintenance App work immediately with minimal context loss.

## 0) Product goal (current directive)
- Build the **final functional system** that matches the validated UI prototypes (no style drift).
- Priority lane right now: **Tenant end‑to‑end** (login → my issues → create issue → issue detail) then Manager actions.

## 1) Canonical UI “source of truth” (validated by Javier)
- App shell / tenant-facing prototype (clean):
  - `http://100.78.107.25:8088/prototype-clean.html`
- Manager dashboard prototype:
  - `http://100.78.107.25:8088/manager-dashboard/manager-dashboard.html`

Design governance:
- `05-Development/UI-SOURCE-OF-TRUTH.md`
- `05-Development/DESIGN-STYLE-LOCK.md`

## 2) Repository + structure
- Repo: `https://github.com/jroques1975/building-maintenance-app`
- Local path (primary dev machine):
  - `/Users/test/Documents/Application Development/Building Maintenance App`

Monorepo packages:
- `packages/backend` (Express + Prisma)
- `packages/web` (React + Vite + TS + MUI)
- `packages/shared` (shared types/constants)

## 3) Dev runtime (single source of truth)
### Web UI
- Dev server (Vite) should be **packages/web**.
- Current chosen dev UI port: **3000**
- URL (Tailscale): `http://100.78.107.25:3000/`

Start:
```bash
cd "packages/web"
npm run dev -- --host 0.0.0.0 --port 3000
```

### Backend API
- Dev API port: **3002** (3001 was sometimes already in use)
- URL (Tailscale): `http://100.78.107.25:3002/api`
- Health: `http://100.78.107.25:3002/api/health`

Start:
```bash
cd "packages/backend"
PORT=3002 npm run dev
```

### Web → API config
- `packages/web/.env`
  - `VITE_API_URL=http://100.78.107.25:3002/api`
  - `VITE_ENABLE_MOCK_API=false`

## 4) Authentication (current dev behavior)
Backend login currently **simulates password verification**:
- `packages/backend/src/routes/auth.routes.ts`
- Password accepted for all users: `password123`

## 5) Seed data / test users
Seed file:
- `packages/backend/prisma/seed.ts`

Example logins (password `password123`):
- Admin: `admin@skylinemanagement.com`
- Managers: `sarah.johnson@skylinemanagement.com`, `robert.garcia@skylinemanagement.com`
- Maintenance: `james.wilson@skylinemanagement.com`, `maria.rodriguez@skylinemanagement.com`, `david.smith@skylinemanagement.com`
- Tenants:
  - `alex.martin@example.com`
  - `jennifer.lee@example.com`
  - `thomas.brown@example.com`
  - `emily.williams@example.com`
  - `daniel.miller@example.com`
  - `olivia.davis@example.com`
  - `william.moore@example.com`
  - `sophia.taylor@example.com`

## 6) Current tenant flow status (what works)
### ✅ Working
- Login
- Tenant dashboard loads “My Issues” (API-backed)
- Issue detail route/page exists: `/issues/:id` (API-backed)

### Known route mismatch fixed
- Backend route: `GET /api/issues/my-issues`
- Web previously used shared constant `/issues/my` → caused runtime crash/blank screen.
- Web now calls the correct backend route.

## 7) Recent commits (important milestones)
- `73e8452` — refactor(web): align dashboard types with shared models
- `9d57070` — feat(web): add issue detail route/page
- `2b1e576` — fix(web): use backend my-issues route
- `93ef623` — chore(web): add UI error boundary for crash visibility
- `4c95832` — fix(web): normalize my-issues API response
- `ecae33f` — fix(web): tenant create issue infer building from my issues

## 8) Known issues / technical debt
1) **Tenant create issue building inference** is currently pragmatic:
   - UI infers `buildingId` (and optionally `unitId`) from the tenant’s existing issues.
   - This is NOT ideal because a brand-new tenant with no issues cannot submit.

   Proper fix (next):
   - Include `unitId` + `unit.buildingId` (or `buildingId`) in `/api/auth/me` response.
   - Update frontend to use that, not “first existing issue”.

2) Types vs UI expectations:
   - Shared types use `assignedToId`, `unitId`, and enums like `URGENT`, `IN_PROGRESS`.
   - Avoid reintroducing prototype-only fields like `assigneeId`, `unitNumber`, `priority: 'high'`.

3) Vite chunk warning (>500KB):
   - Not a functional blocker; can be addressed later with code splitting.

## 9) Next concrete steps (recommended order)
### Tenant lane (finish end-to-end)
1) Fix tenant building/unit context properly via `/auth/me` shape.
2) Issue creation should support optional `location` + validate required fields.
3) Add attachment upload UX (up to 4) to match prior feature direction.

### Manager lane
1) Manager dashboard should load real issues from API (replace Redux mock).
2) Wire assign and status update actions:
   - `POST /api/issues/:id/assign`
   - `POST /api/issues/:id/status`
3) Work order create/update flows.

## 10) “If UI goes blank” debug checklist
- ErrorBoundary is installed; capture on-screen error.
- Confirm API is reachable:
  - `curl http://100.78.107.25:3002/api/health`
- Confirm web is using correct API base in `.env`.
- Check dev servers:
  - Only keep `packages/web` Vite on 3000.
  - Only one backend watcher on 3002.

---
Last updated: 2026-02-22
