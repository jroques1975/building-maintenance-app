# Seed Update Draft — Operator Scenarios (MVP)

## Goal
Provide deterministic demo data for HOA/PM operator transitions.

## Scenario A: PM-managed building (single operator)
- Building: Ocean View Towers
- Operator period: PM Acme Properties (ACTIVE)
- Issues/work orders tagged to same operator period

## Scenario B: PM transition (continuity)
- Building: Brickell Financial Center
- Operator period 1: PM Alpha Management (ENDED)
- Operator period 2: PM Beacon Management (ACTIVE)
- Historical issues remain linked to period 1
- New issues/work orders linked to period 2

## Scenario C: HOA self-managed then PM
- Building: Coral Gables Villas
- Operator period 1: HOA Coral Gables Board (ENDED)
- Operator period 2: PM Acme Properties (ACTIVE)
- Timeline shows HOA -> PM handoff with notes

## Validation expectations
- Exactly one ACTIVE `BuildingOperatorPeriod` per building
- `Building.currentOperatorPeriodId` populated
- No null `operatorPeriodId` for seeded `Issue`/`WorkOrder`
