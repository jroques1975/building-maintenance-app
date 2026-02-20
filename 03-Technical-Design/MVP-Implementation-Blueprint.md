# MVP Implementation Blueprint

## Context
This blueprint implements the locked MVP scope:
- Multi-tenant SaaS for HOA + Property Management operators
- Building is canonical source of truth
- Building history persists across PM/operator transitions
- End-to-end workflows for tenant, maintenance, manager/operator, and admin

---

## 1) Data Model Spec (MVP only)

### Core Entities
1. **Building** (canonical, permanent)
   - `id, name, address, city, state, zipCode`
   - `currentOperatorPeriodId` (nullable)
   - standard audit fields

2. **ManagementCompany**
   - `id, name, subdomain, status`

3. **HoaOrganization**
   - `id, name, status`

4. **BuildingOperatorPeriod** (temporal ownership/operation)
   - `id`
   - `buildingId`
   - `operatorType` enum: `PM | HOA`
   - `managementCompanyId` nullable
   - `hoaOrganizationId` nullable
   - `startDate, endDate` (nullable end)
   - `status` enum: `ACTIVE | ENDED | PENDING`
   - `handoffNotes` nullable
   - **Constraint:** max one ACTIVE period per building

5. **Unit**
   - `id, buildingId, unitNumber, ...`
   - unique `(buildingId, unitNumber)`

6. **Issue**
   - `id, buildingId, unitId, reporterId, assigneeId`
   - `operatorPeriodId` (for continuity context)
   - `status, priority, category, description`

7. **WorkOrder**
   - `id, issueId, buildingId, assigneeId`
   - `operatorPeriodId`
   - `status, estimatedHours, actualHours, estimatedCost, actualCost`

8. **User**
   - role enum: `TENANT | MAINTENANCE | MANAGER | ADMIN`
   - association to PM/HOA context where applicable

### Migration Plan
1. Add `HoaOrganization` + `BuildingOperatorPeriod`
2. Backfill existing management history into operator periods (`operatorType=PM`)
3. Populate `operatorPeriodId` on existing issues/work orders via issue/building timestamps
4. Add ACTIVE uniqueness guard per building
5. Run seed updates with HOA + PM + transition examples

---

## 2) API Contract (MVP)

### Auth & Access
- JWT auth required
- Role + operator-period scoped authorization
- Tenants restricted to own unit/building data

### Endpoints

#### Portfolio / Operator Views
- `GET /api/portfolio/buildings`
  - Returns buildings for current operator (HOA/PM)

- `GET /api/buildings/:buildingId/operator-timeline`
  - Returns ordered operator periods (HOA/PM transitions)

#### Operator Transition
- `POST /api/buildings/:buildingId/operator-periods`
  - Create new period (usually closes previous ACTIVE)

- `POST /api/buildings/:buildingId/transition`
  - Transition helper endpoint
  - Body: `fromOperatorPeriodId`, `toOperatorType`, `toOperatorId`, `effectiveDate`, `handoffNotes`

#### Maintenance Core
- Existing endpoints stay, but all writes bind `operatorPeriodId` at write time:
  - `POST /api/issues`
  - `PATCH /api/issues/:id`
  - `POST /api/work-orders`
  - `PATCH /api/work-orders/:id`

#### Continuity Read
- `GET /api/buildings/:buildingId/history`
  - Returns issues/work orders grouped by operator period

---

## 3) UAT Acceptance Checklist (Pass/Fail)

### A. Core Workflow
- Tenant submits issue with photo + priority
- Manager/operator sees issue in queue
- Manager assigns work order
- Maintenance updates to completed
- Tenant receives status notifications

### B. Multi-Building Portfolio
- HOA user sees all assigned buildings
- PM user sees only current managed portfolio
- Filters/search work across buildings

### C. Building Continuity
- Transition PM A -> PM B completed
- Historical issues/work orders remain visible for building
- New issues are tagged to new operator period
- Old operator can only read permitted historical scope

### D. Access Control
- Tenant cannot view other units
- Maintenance cannot access unauthorized buildings
- Admin/operator role restrictions enforced consistently

### E. Reliability Baseline
- Health endpoint OK
- Audit/history queries return operator-period context
- Backups/logging configured for UAT environment

---

## 4) Execution Plan

### Phase 1 — Backend foundation (Day 1-2)
1. Prisma schema updates (HOA + operator period)
2. Migration/backfill scripts
3. Seed data for HOA/PM transition scenarios
4. Role-policy updates for operator scoped access

### Phase 2 — API layer (Day 2-3)
1. Portfolio + operator timeline endpoints
2. Transition endpoint + validations
3. Continuity history endpoint
4. Update issue/work-order writes to persist `operatorPeriodId`

### Phase 3 — Frontend integration (Day 3-4)
1. Portfolio view (HOA/PM)
2. Building timeline panel
3. Dashboard filtering across multiple buildings
4. Auth role UX checks

### Phase 4 — UAT hardening (Day 4-5)
1. Run full UAT checklist
2. Fix blockers
3. Freeze MVP release candidate

---

## 5) Immediate Next Task (now)
Start with **Phase 1 / Task 1**:
- implement Prisma schema changes for `HoaOrganization` and `BuildingOperatorPeriod`
- define DB constraints
- prepare migration + seed update draft
