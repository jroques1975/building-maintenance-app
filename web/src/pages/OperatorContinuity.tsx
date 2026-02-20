import { useEffect, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function OperatorContinuity() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/portfolio/buildings')
      .then((r) => {
        const list = r?.data?.buildings ?? [];
        setBuildings(list);
        if (list[0]?.id) setSelected(list[0].id);
      })
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiRequest(`/buildings/${selected}/history`)
      .then((r) => setHistory(r.data))
      .catch((e) => setErr(e.message));
  }, [selected]);

  if (!getToken()) return <p>Please login first.</p>;

  return (
    <div>
      <h2>Operator Continuity</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Building: </label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {buildings.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
        </select>
      </div>
      {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
      <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
        {history?.periods?.map((p: any) => (
          <div key={p.id} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
            <strong>{p.id}</strong> — {p.managementCompany?.name || p.hoaOrganization?.name || 'Unknown'} ({p.operatorType})
            <div>Status: {p.status}</div>
            <div>Totals: {p.totals?.issues ?? 0} issues / {p.totals?.workOrders ?? 0} work orders</div>
          </div>
        ))}
        {!history && <div>Loading history...</div>}
      </div>
    </div>
  );
}
