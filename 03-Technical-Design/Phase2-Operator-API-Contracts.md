# Phase 2 Operator API Contracts (Locked MVP)

Base path: `/api`
Auth: `Authorization: Bearer <JWT>`

## Implementation Status (2026-02-20)
- ✅ Implemented and wired in backend:
  - `GET /api/portfolio/buildings`
  - `GET /api/buildings/:buildingId/operator-timeline`
  - `POST /api/buildings/:buildingId/operator-periods`
  - `POST /api/buildings/:buildingId/transition`
  - `GET /api/buildings/:buildingId/history`
- ✅ Continuity persistence on writes:
  - `POST /api/issues` auto-binds `operatorPeriodId` from active building period
  - `POST /api/work-orders` binds `operatorPeriodId` from linked issue or active building period
- ✅ Test/build baseline currently green in `packages/backend`:
  - `npm test`
  - `npm run build`

---

## GET `/portfolio/buildings`
Returns operator-scoped current portfolio.

### Success 200
```json
{
  "status": "success",
  "data": {
    "buildings": [
      {
        "id": "bld_123",
        "name": "Ocean View Towers",
        "city": "Miami",
        "currentOperatorPeriod": {
          "id": "op_1",
          "operatorType": "PM",
          "status": "ACTIVE"
        },
        "_count": { "issues": 10, "workOrders": 8, "units": 120 }
      }
    ]
  },
  "meta": { "count": 1 }
}
```

---

## GET `/buildings/:buildingId/operator-timeline`
Returns ordered operator periods (HOA/PM timeline).

### Query params (optional)
- `from` (ISO datetime)
- `to` (ISO datetime)

### Success 200
```json
{
  "status": "success",
  "data": {
    "building": { "id": "bld_123", "name": "Ocean View Towers" },
    "timeline": [
      {
        "id": "op_1",
        "operatorType": "PM",
        "status": "ENDED",
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2026-01-01T00:00:00.000Z",
        "_count": { "issues": 14, "workOrders": 11 }
      }
    ]
  }
}
```

---

## POST `/buildings/:buildingId/operator-periods`
Creates a new operator period for the building.

### Request body
```json
{
  "operatorType": "PM",
  "toOperatorId": "mgmt_abc",
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": null,
  "status": "ACTIVE",
  "handoffNotes": "Transition after contract renewal",
  "closeActivePeriod": true
}
```

### Rules
- `ACTIVE` + existing `ACTIVE` period:
  - if `closeActivePeriod=true`, previous ACTIVE is closed as `ENDED` with `endDate=startDate`
  - else returns `409`
- If `endDate` present, must be `> startDate`

### Success 201
```json
{
  "status": "success",
  "message": "Operator period created",
  "data": {
    "building": { "id": "bld_123", "name": "Ocean View Towers" },
    "closedPeriod": { "id": "op_1", "status": "ENDED" },
    "newPeriod": { "id": "op_2", "status": "ACTIVE", "operatorType": "PM" }
  }
}
```

---

## POST `/buildings/:buildingId/transition`
Transition helper endpoint for switching active operator in one action.

### Request body
```json
{
  "fromOperatorPeriodId": "op_1",
  "toOperatorType": "HOA",
  "toOperatorId": "hoa_xyz",
  "effectiveDate": "2026-04-01T00:00:00.000Z",
  "handoffNotes": "Board requested direct HOA control"
}
```

### Success 201
Returns previous period, next period, and building continuity totals.

---

## GET `/buildings/:buildingId/history`
Building continuity read model grouped by operator period.

### Query params (optional)
- `status`: `ACTIVE | PENDING | ENDED | TERMINATED | RENEWED`
- `from`: ISO datetime (`startDate >= from`)
- `to`: ISO datetime (`startDate <= to`)
- `periodLimit`: integer `1..100`
- `periodOffset`: integer `>= 0`
- `includeUnassigned`: `true | false` (default `true`)

### Success 200
```json
{
  "status": "success",
  "data": {
    "building": { "id": "bld_123", "name": "Ocean View Towers" },
    "periods": [
      {
        "id": "op_1",
        "operatorType": "PM",
        "issues": [],
        "workOrders": [],
        "totals": { "issues": 4, "workOrders": 3 }
      }
    ],
    "unassigned": {
      "issues": [],
      "workOrders": [],
      "totals": { "issues": 1, "workOrders": 0 }
    }
  },
  "meta": {
    "statusFilter": "ACTIVE",
    "from": "2026-01-01T00:00:00.000Z",
    "to": null,
    "periodLimit": 20,
    "periodOffset": 0,
    "includeUnassigned": true,
    "periodsReturned": 1
  }
}
```
