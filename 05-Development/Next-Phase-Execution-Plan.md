# Next Phase Execution Plan (Post Phase-2 UAT Pass)

Status: Approved to proceed after UAT pass.
Baseline tag: `uat-pass-phase2`
Baseline branch: `baseline/phase2-uat-pass`

## Objective
Expand from continuity-focused hardening to complete role-safe functional coverage across tenant-context and full operational workflows.

## Scope (Immediate)

### 1) Tenant-context endpoint alignment
- Unify auth/tenant context assumptions between operator-scoped and tenant-scoped routes.
- Ensure seeded/test users can execute intended role flows without middleware mismatch.
- Preserve building-centric continuity model.

### 2) Full Issues & Work Orders functional UX
- Complete real create/update flows in web UI for:
  - Issues (create, status update, assignment where allowed)
  - Work Orders (create, status update, assignment)
- Keep all calls against live backend endpoints.

### 3) Role-specific dashboard behavior
- Enforce role-aware page actions and visibility:
  - Tenant: submit + own visibility
  - Maintenance: assigned workload + update status
  - Manager/Admin: assignment + operational controls

## Acceptance Criteria
- Role paths pass manual UAT checks without fallback to mock data.
- No auth-context mismatch errors in normal seeded-user flows.
- Continuity history/timeline remains intact across transitions.
- `npm test` and `npm run build` pass for backend and web.

## Delivery Approach
- Small scoped commits by feature slice.
- Validate after each slice on remote URL.
- Update UAT command center scenarios as each slice lands.

## Proposed order
1. Tenant-context alignment fixes
2. Issue create/update UI
3. Work-order create/update UI
4. Role-aware UI guards + final UAT rerun
