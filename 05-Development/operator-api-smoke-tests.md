# Operator API Smoke Tests (Phase 2)

Set variables:

```bash
export BASE_URL="http://localhost:3001/api"
export TOKEN="<JWT>"
export BUILDING_ID="<building_id>"
export PM_ID="<management_company_id>"
export HOA_ID="<hoa_organization_id>"
```

## 1) Portfolio
```bash
curl -sS "$BASE_URL/portfolio/buildings" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 2) Timeline
```bash
curl -sS "$BASE_URL/buildings/$BUILDING_ID/operator-timeline" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 3) Create period (PM)
```bash
curl -sS -X POST "$BASE_URL/buildings/$BUILDING_ID/operator-periods" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operatorType": "PM",
    "toOperatorId": "'"$PM_ID"'",
    "startDate": "2026-03-01T00:00:00.000Z",
    "status": "ACTIVE",
    "closeActivePeriod": true,
    "handoffNotes": "Smoke test PM period"
  }' | jq
```

## 4) Transition helper (to HOA)
```bash
curl -sS -X POST "$BASE_URL/buildings/$BUILDING_ID/transition" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toOperatorType": "HOA",
    "toOperatorId": "'"$HOA_ID"'",
    "effectiveDate": "2026-04-01T00:00:00.000Z",
    "handoffNotes": "Smoke test transition to HOA"
  }' | jq
```

## 5) Building continuity history
```bash
curl -sS "$BASE_URL/buildings/$BUILDING_ID/history" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Expected checks
- Only one `ACTIVE` period after create/transition.
- `building.currentOperatorPeriodId` reflects latest active period.
- History endpoint returns period-grouped issues/work orders.
- Unassigned bucket appears for legacy records with null `operatorPeriodId`.
