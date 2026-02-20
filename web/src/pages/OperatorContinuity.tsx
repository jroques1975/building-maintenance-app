const periods = [
  { id: 'OP-001', operator: 'Skyline PM', type: 'PM', status: 'ENDED', start: '2025-01-01', end: '2026-03-01' },
  { id: 'OP-002', operator: 'Sunrise HOA', type: 'HOA', status: 'ACTIVE', start: '2026-03-01', end: '—' },
];

export default function OperatorContinuity() {
  return (
    <div>
      <h2>Operator Continuity</h2>
      <p>Use this view during UAT to validate building-level history across operator transitions.</p>
      <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
        {periods.map((p) => (
          <div key={p.id} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
            <strong>{p.id}</strong> — {p.operator} ({p.type})
            <div>Status: {p.status}</div>
            <div>{p.start} → {p.end}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
