const checks = [
  'Tenant cannot access operator portfolio/history',
  'Maintenance cannot create/transition operator periods',
  'Manager/Admin can run operator transitions',
  'History includes period grouping + unassigned legacy bucket',
  'Issue/Work Order create auto-binds operatorPeriodId',
];

export default function UatChecklist() {
  return (
    <div>
      <h2>UAT Checklist (Quick View)</h2>
      <p>Reference checklist. Full tracker lives in 05-Development/UAT-Execution-Sheet.md.</p>
      <ul>
        {checks.map((c) => (
          <li key={c} style={{ marginBottom: 8 }}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
