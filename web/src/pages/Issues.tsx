import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function Issues() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/portfolio/buildings')
      .then((r) => {
        const list = r?.data?.buildings ?? [];
        setBuildings(list);
        if (list[0]?.id) setSelected(list[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    apiRequest(`/buildings/${selected}/history${q}`)
      .then((r) => setHistory(r.data))
      .catch((e) => setError(e.message));
  }, [selected, status]);

  const issues = useMemo(() => {
    const fromPeriods = (history?.periods ?? []).flatMap((p: any) =>
      (p.issues ?? []).map((i: any) => ({ ...i, periodId: p.id, operatorType: p.operatorType }))
    );
    const unassigned = (history?.unassigned?.issues ?? []).map((i: any) => ({ ...i, periodId: 'UNASSIGNED', operatorType: 'LEGACY' }));
    return [...fromPeriods, ...unassigned];
  }, [history]);

  if (!getToken()) return <p>Please login first.</p>;

  return (
    <div>
      <h2>Issues</h2>
      <p>Live continuity-backed issue view (building history model).</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <label>
          Building
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {buildings.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
        </label>
        <label>
          Period Status Filter
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value=''>All</option>
            <option value='ACTIVE'>ACTIVE</option>
            <option value='ENDED'>ENDED</option>
            <option value='PENDING'>PENDING</option>
            <option value='TERMINATED'>TERMINATED</option>
            <option value='RENEWED'>RENEWED</option>
          </select>
        </label>
      </div>

      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Issues found: {issues.length}</div>
        {issues.map((i: any) => (
          <div key={i.id} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
            <strong>{i.title}</strong>
            <div>Status: {i.status} | Priority: {i.priority} | Category: {i.category}</div>
            <div>Period: {i.periodId} ({i.operatorType})</div>
          </div>
        ))}
        {issues.length === 0 && <div>No issues found for selected scope.</div>}
      </div>
    </div>
  );
}
