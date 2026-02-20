# UAT Execution Sheet — Next Cycle

Use this sheet to execute and record UAT outcomes for the current Phase 2 / early hardening scope.

## Session Info
- Date:
- Environment:
- Build/Commit:
- Tester(s):
- Notes:

## Pre-Run Gate
- [ ] `npm test` passes (`packages/backend`)
- [ ] `npm run build` passes (`packages/backend`)
- [ ] Seed/test data ready
- [ ] Remote URL reachable

---

## Test Case Log

| ID | Area | Scenario | Steps (short) | Expected | Actual | Status (Pass/Fail/Blocked) | Defect ID | Owner |
|---|---|---|---|---|---|---|---|---|
| UAT-A01 | AuthZ | Tenant denied operator portfolio | Login as tenant, call `GET /api/portfolio/buildings` | 403 insufficient permissions |  |  |  |  |
| UAT-A02 | AuthZ | Maintenance denied operator period write | Login as maintenance, call `POST /api/buildings/:id/operator-periods` | 403 insufficient permissions |  |  |  |  |
| UAT-A03 | AuthZ | Manager allowed operator period write | Login as manager, valid `operator-periods` payload | 201 created |  |  |  |  |
| UAT-B01 | Continuity | Transition handoff closes current active period | Call `POST /api/buildings/:id/transition` with effective date > active start | old period ENDED, new ACTIVE, building points to new period |  |  |  |  |
| UAT-B02 | Continuity | Building history grouped by period | Call `GET /api/buildings/:id/history` | periods grouped, totals present |  |  |  |  |
| UAT-B03 | Continuity | Legacy unassigned bucket present | Call history with default query | `unassigned` included with totals |  |  |  |  |
| UAT-B04 | Continuity | History filter by status/date | Call history with `status/from/to` | filtered periods only |  |  |  |  |
| UAT-B05 | Continuity | History pagination | Call history with `periodLimit/periodOffset` | returns paged periods + meta |  |  |  |  |
| UAT-B06 | Continuity | Disable unassigned payload | Call history with `includeUnassigned=false` | no unassigned query load, unassigned empty |  |  |  |  |
| UAT-C01 | Workflow | Issue create auto-binds operator period | Create issue in building with active period | issue has `operatorPeriodId` set |  |  |  |  |
| UAT-C02 | Workflow | Work order binds from issue period | Create work order linked to issue | work order inherits issue period |  |  |  |  |
| UAT-C03 | Workflow | Work order fallback to active period | Create work order without linked issue | binds to current active period |  |  |  |  |

---

## Defect Tracker

| Defect ID | Severity (P0-P3) | Summary | Repro Steps | Expected | Actual | Status | Owner |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

---

## Sign-off
- [ ] No P0/P1 defects open
- [ ] Critical continuity scenarios pass
- [ ] Auth boundaries validated by role
- [ ] Stakeholder sign-off captured

Signed by:
- Product:
- Engineering:
- QA/UAT:
