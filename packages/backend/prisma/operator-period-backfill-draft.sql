-- Phase 1 Backfill Draft: BuildingOperatorPeriod
-- Target runtime: PostgreSQL
-- Purpose: backfill operator periods from existing ManagementContract records

BEGIN;

-- 1) Create PM operator periods from management contracts
INSERT INTO "BuildingOperatorPeriod" (
  "id",
  "buildingId",
  "operatorType",
  "managementCompanyId",
  "startDate",
  "endDate",
  "status",
  "handoffNotes",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  mc."buildingId",
  'PM',
  mc."managementCompanyId",
  mc."startDate",
  mc."endDate",
  CASE
    WHEN mc."status" = 'ACTIVE' THEN 'ACTIVE'
    WHEN mc."status" = 'PENDING' THEN 'PENDING'
    ELSE 'ENDED'
  END,
  'Backfilled from ManagementContract',
  NOW(),
  NOW()
FROM "ManagementContract" mc;

-- 2) Link current operator period on Building
UPDATE "Building" b
SET "currentOperatorPeriodId" = bop."id"
FROM "BuildingOperatorPeriod" bop
WHERE b."id" = bop."buildingId"
  AND bop."status" = 'ACTIVE';

-- 3) Backfill issues/work orders into matching operator period by createdAt window
UPDATE "Issue" i
SET "operatorPeriodId" = bop."id"
FROM "BuildingOperatorPeriod" bop
WHERE i."buildingId" = bop."buildingId"
  AND i."createdAt" >= bop."startDate"
  AND (bop."endDate" IS NULL OR i."createdAt" <= bop."endDate");

UPDATE "WorkOrder" w
SET "operatorPeriodId" = bop."id"
FROM "BuildingOperatorPeriod" bop
WHERE w."buildingId" = bop."buildingId"
  AND w."createdAt" >= bop."startDate"
  AND (bop."endDate" IS NULL OR w."createdAt" <= bop."endDate");

COMMIT;

-- Validation checks:
-- SELECT "buildingId", count(*) FROM "BuildingOperatorPeriod" WHERE status='ACTIVE' GROUP BY 1 HAVING count(*)>1;
-- SELECT count(*) FROM "Issue" WHERE "operatorPeriodId" IS NULL;
-- SELECT count(*) FROM "WorkOrder" WHERE "operatorPeriodId" IS NULL;
