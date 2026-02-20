-- Operator fixture alignment checks (Phase 2)

-- 1) Buildings with more than one ACTIVE period (should be 0)
SELECT "buildingId", COUNT(*) AS active_count
FROM "BuildingOperatorPeriod"
WHERE "status" = 'ACTIVE'
GROUP BY "buildingId"
HAVING COUNT(*) > 1;

-- 2) Buildings with no currentOperatorPeriodId but at least one ACTIVE period (should be 0)
SELECT b."id", b."name"
FROM "Building" b
WHERE b."currentOperatorPeriodId" IS NULL
  AND EXISTS (
    SELECT 1 FROM "BuildingOperatorPeriod" bop
    WHERE bop."buildingId" = b."id" AND bop."status" = 'ACTIVE'
  );

-- 3) Issues with null operatorPeriodId (legacy may exist; review count)
SELECT COUNT(*) AS unassigned_issue_count
FROM "Issue"
WHERE "operatorPeriodId" IS NULL;

-- 4) WorkOrders with null operatorPeriodId (legacy may exist; review count)
SELECT COUNT(*) AS unassigned_work_order_count
FROM "WorkOrder"
WHERE "operatorPeriodId" IS NULL;

-- 5) Active period references that point to missing PM/HOA (should be 0 rows)
SELECT bop."id", bop."buildingId", bop."operatorType"
FROM "BuildingOperatorPeriod" bop
LEFT JOIN "ManagementCompany" mc ON mc."id" = bop."managementCompanyId"
LEFT JOIN "HoaOrganization" ho ON ho."id" = bop."hoaOrganizationId"
WHERE bop."status" = 'ACTIVE'
  AND (
    (bop."operatorType" = 'PM' AND mc."id" IS NULL) OR
    (bop."operatorType" = 'HOA' AND ho."id" IS NULL)
  );
