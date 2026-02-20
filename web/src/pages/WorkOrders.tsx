import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function WorkOrders() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [activeWorkOrder, setActiveWorkOrder] = useState<any>(null);

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

  const orders = useMemo(() => {
    const fromPeriods = (history?.periods ?? []).flatMap((p: any) =>
      (p.workOrders ?? []).map((w: any) => ({ ...w, periodId: p.id, operatorType: p.operatorType }))
    );
    const unassigned = (history?.unassigned?.workOrders ?? []).map((w: any) => ({ ...w, periodId: 'UNASSIGNED', operatorType: 'LEGACY' }));
    return [...fromPeriods, ...unassigned];
  }, [history]);

  if (!getToken()) return <p>Please login first.</p>;

  return (
    <div>
      <h2>Work Orders</h2>
      <p>Live continuity-backed work-order view (building history model).</p>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Work orders found: {orders.length}</div>
          {orders.map((w: any) => (
            <button
              key={w.id}
              onClick={() => setActiveWorkOrder(w)}
              style={{ width: '100%', textAlign: 'left', padding: 10, borderBottom: '1px solid #eee', border: 0, background: activeWorkOrder?.id === w.id ? '#f3f4f6' : 'white', cursor: 'pointer' }}
            >
              <strong>{w.title}</strong>
              <div>Status: {w.status} | Priority: {w.priority}</div>
              <div>Period: {w.periodId} ({w.operatorType})</div>
            </button>
          ))}
          {orders.length === 0 && <div>No work orders found for selected scope.</div>}
        </div>

        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <h3>Work Order Detail</h3>
          {!activeWorkOrder ? (
            <p>Select a work order to view details.</p>
          ) : (
            <>
              <div><strong>ID:</strong> {activeWorkOrder.id}</div>
              <div><strong>Title:</strong> {activeWorkOrder.title}</div>
              <div><strong>Status:</strong> {activeWorkOrder.status}</div>
              <div><strong>Priority:</strong> {activeWorkOrder.priority}</div>
              <div><strong>Created:</strong> {new Date(activeWorkOrder.createdAt).toLocaleString()}</div>
              <div><strong>Completed:</strong> {activeWorkOrder.completedDate ? new Date(activeWorkOrder.completedDate).toLocaleString() : '—'}</div>
              <div><strong>Period:</strong> {activeWorkOrder.periodId}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
