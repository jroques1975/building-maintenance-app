import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

const WO_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const WO_STATUSES = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export default function WorkOrders() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeWorkOrder, setActiveWorkOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('bma_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const canCreate = !!currentUser && ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);
  const canUpdateStatus = !!currentUser && ['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  async function loadWorkOrders(buildingId: string, status = statusFilter) {
    setLoading(true);
    const q = new URLSearchParams({ buildingId });
    if (status) q.set('status', status);
    const res = await apiRequest(`/work-orders?${q.toString()}`);
    const list = res?.data?.workOrders ?? [];
    setWorkOrders(list);
    if (list.length > 0) {
      const selected = list.find((w: any) => w.id === activeWorkOrder?.id) || list[0];
      setActiveWorkOrder(selected);
    } else {
      setActiveWorkOrder(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/portfolio/buildings')
      .then((r) => {
        const list = r?.data?.buildings ?? [];
        setBuildings(list);
        if (list[0]?.id) {
          setSelectedBuilding(list[0].id);
          loadWorkOrders(list[0].id).catch((e) => { setError(e.message); setLoading(false); });
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedBuilding) return;
    loadWorkOrders(selectedBuilding).catch((e) => { setError(e.message); setLoading(false); });
  }, [selectedBuilding, statusFilter]);

  async function submitWorkOrder(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await apiRequest('/work-orders', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          buildingId: selectedBuilding,
          priority,
        }),
      });
      setMessage('Work order created successfully.');
      setTitle('');
      setDescription('');
      await loadWorkOrders(selectedBuilding);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!activeWorkOrder) return;
    setError('');
    setMessage('');
    try {
      await apiRequest(`/work-orders/${activeWorkOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setMessage(`Work order status updated to ${newStatus}.`);
      await loadWorkOrders(selectedBuilding);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!getToken()) return <p>Please login first.</p>;

  return (
    <div>
      <h2>Work Orders</h2>
      <p>Live tenant-context work-order workflows (list/create/status update).</p>
      {!canCreate && <p style={{ color: '#6b7280' }}>Your role can view/update assigned work orders but cannot create new work orders.</p>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <label>
          Building
          <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label>
          Status Filter
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value=''>All</option>
            {WO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {message && <p style={{ color: '#065f46' }}>{message}</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      {canCreate && (
        <form onSubmit={submitWorkOrder} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <h3>Create Work Order</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(200px,1fr))', gap: 10 }}>
            <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
            <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value)}>{WO_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label style={{ gridColumn: '1 / -1' }}>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} /></label>
          </div>
          <button style={{ marginTop: 10 }} disabled={submitting || !selectedBuilding}>{submitting ? 'Creating...' : 'Create Work Order'}</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Work orders found: {workOrders.length}</div>
          {loading && <div style={{ color: '#6b7280', marginBottom: 8 }}>Loading work orders...</div>}
          {workOrders.map((w: any) => (
            <button
              key={w.id}
              onClick={() => setActiveWorkOrder(w)}
              style={{ width: '100%', textAlign: 'left', padding: 10, borderBottom: '1px solid #eee', border: 0, background: activeWorkOrder?.id === w.id ? '#f3f4f6' : 'white', cursor: 'pointer' }}
            >
              <strong>{w.title}</strong>
              <div>Status: {w.status} | Priority: {w.priority}</div>
              <div>Building: {w.building?.name || w.buildingId}</div>
            </button>
          ))}
          {workOrders.length === 0 && <div>No work orders found for selected scope.</div>}
        </div>

        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <h3>Work Order Detail</h3>
          {!activeWorkOrder ? <p>Select a work order to view details.</p> : (
            <>
              <div><strong>ID:</strong> {activeWorkOrder.id}</div>
              <div><strong>Title:</strong> {activeWorkOrder.title}</div>
              <div><strong>Status:</strong> {activeWorkOrder.status}</div>
              <div><strong>Priority:</strong> {activeWorkOrder.priority}</div>
              <div><strong>Created:</strong> {new Date(activeWorkOrder.createdAt).toLocaleString()}</div>
              {canUpdateStatus && (
                <div style={{ marginTop: 10 }}>
                  <label>Update Status</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {WO_STATUSES.map((s) => (
                      <button key={s} onClick={() => updateStatus(s)} disabled={s === activeWorkOrder.status}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
