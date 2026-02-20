# UAT Plan — Next Cycle (Phase 2 / Early Hardening)

## 1) UAT Goal
Validate that the MVP + operator continuity flows are stable for role-based real-world usage before broader frontend integration.

## 2) Scope for This UAT Cycle
### In Scope
- Core backend flows already implemented:
  - Auth/login
  - Buildings
  - Issues
  - Work orders
  - Users
- Operator continuity flows:
  - `GET /api/portfolio/buildings`
  - `GET /api/buildings/:buildingId/operator-timeline`
  - `POST /api/buildings/:buildingId/operator-periods`
  - `POST /api/buildings/:buildingId/transition`
  - `GET /api/buildings/:buildingId/history`
- Continuity behavior:
  - `operatorPeriodId` auto-binding on issue/work-order creation
  - History retention across operator changes

### Out of Scope
- Broad schema redesign
- Phase 3 analytics/vendor portal items
- Non-critical UI polish

## 3) Entry Criteria
- `packages/backend` passes:
  - `npm test`
  - `npm run build`
- Seed/environment ready for repeatable checks
- UAT participants identified (Manager, Maintenance, Tenant, Admin viewpoints)

## 4) Exit Criteria
- No P0/P1 defects open
- All critical continuity scenarios pass
- Authorization boundaries verified for restricted actions
- UAT sign-off checklist completed

## 5) Test Matrix (Must Pass)

## A. Authentication & Authorization
1. Tenant cannot access operator portfolio/history endpoints requiring elevated roles
2. Maintenance cannot create/transition operator periods
3. Manager/Admin can execute operator period writes

## B. Operator Continuity
4. Create operator period closes existing ACTIVE period only when requested
5. Transition endpoint ends prior active period and opens new active period
6. Building history shows period-grouped issues/work-orders + unassigned legacy bucket
7. History filters work (`status`, `from`, `to`, `periodLimit`, `periodOffset`, `includeUnassigned`)

## C. Core Workflow Safety
8. Issue creation auto-binds `operatorPeriodId` to current active period
9. Work-order creation binds from linked issue first, else active period
10. Existing building records remain intact after operator transition (building-centric continuity)

## 6) Suggested Execution Sequence (1-2 days)
- **Day 1 AM**: Environment sanity + automated regression (`npm test`, `npm run build`)
- **Day 1 PM**: Role auth + operator transition scenarios
- **Day 2 AM**: Continuity/history verification with filters/pagination
- **Day 2 PM**: Defect triage + re-test + sign-off decision

## 7) Defect Severity
- **P0**: Data loss, broken continuity, auth bypass
- **P1**: Business-critical flow blocked (cannot transition/create required records)
- **P2**: Non-blocking functional issue with workaround
- **P3**: Cosmetic/documentation

## 8) Runbook Commands
From `packages/backend`:

```bash
npm test
npm run build
```

Optional smoke guidance:
- `05-Development/operator-api-smoke-tests.md`

## 9) UAT Sign-off Checklist
- [ ] Auth boundaries confirmed by role
- [ ] Operator transition continuity confirmed
- [ ] History endpoint filters/pagination confirmed
- [ ] No P0/P1 defects open
- [ ] Stakeholder sign-off recorded

---
Owner: Product + Engineering
Status: Ready for execution
Updated: 2026-02-20
