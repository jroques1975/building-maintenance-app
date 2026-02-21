import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

const ISSUE_CATEGORIES = ['PLUMBING', 'HVAC', 'ELECTRICAL', 'APPLIANCE', 'STRUCTURAL', 'SECURITY', 'OTHER'];
const ISSUE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const ISSUE_STATUSES = ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function Issues() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [activeIssue, setActiveIssue] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [priority, setPriority] = useState('MEDIUM');
  const [location, setLocation] = useState('');

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('bma_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const canCreate = !!currentUser && ['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);
  const canUpdateStatus = !!currentUser && ['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  async function loadIssues(buildingId: string, status = statusFilter) {
    const q = new URLSearchParams({ buildingId });
    if (status) q.set('status', status);
    const res = await apiRequest(`/issues?${q.toString()}`);
    const list = res?.data?.issues ?? [];
    setIssues(list);
    if (list.length > 0) {
      const selected = list.find((i: any) => i.id === activeIssue?.id) || list[0];
      setActiveIssue(selected);
    } else {
      setActiveIssue(null);
    }
  }

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/portfolio/buildings')
      .then((r) => {
        const list = r?.data?.buildings ?? [];
        setBuildings(list);
        if (list[0]?.id) {
          setSelectedBuilding(list[0].id);
          loadIssues(list[0].id).catch((e) => setError(e.message));
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedBuilding) return;
    loadIssues(selectedBuilding).catch((e) => setError(e.message));
  }, [selectedBuilding, statusFilter]);

  async function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/issues', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          location: location || undefined,
          buildingId: selectedBuilding,
        }),
      });
      setMessage('Issue created successfully.');
      setTitle('');
      setDescription('');
      setLocation('');
      await loadIssues(selectedBuilding);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!activeIssue) return;
    setError('');
    setMessage('');
    try {
      await apiRequest(`/issues/${activeIssue.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setMessage(`Issue status updated to ${newStatus}.`);
      await loadIssues(selectedBuilding);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!getToken()) return <p>Please login first.</p>;

  return (
    <div>
      <h2>Issues</h2>
      <p>Live tenant-context issue workflows (list/create/status update).</p>

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
            {ISSUE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {message && <p style={{ color: '#065f46' }}>{message}</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      {canCreate && (
        <form onSubmit={submitIssue} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <h3>Create Issue</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(200px,1fr))', gap: 10 }}>
            <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
            <label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} /></label>
            <label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{ISSUE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value)}>{ISSUE_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label style={{ gridColumn: '1 / -1' }}>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} /></label>
          </div>
          <button style={{ marginTop: 10 }}>Create Issue</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Issues found: {issues.length}</div>
          {issues.map((i: any) => (
            <button
              key={i.id}
              onClick={() => setActiveIssue(i)}
              style={{ width: '100%', textAlign: 'left', padding: 10, borderBottom: '1px solid #eee', border: 0, background: activeIssue?.id === i.id ? '#f3f4f6' : 'white', cursor: 'pointer' }}
            >
              <strong>{i.title}</strong>
              <div>Status: {i.status} | Priority: {i.priority} | Category: {i.category}</div>
              <div>Building: {i.building?.name || i.buildingId}</div>
            </button>
          ))}
          {issues.length === 0 && <div>No issues found for selected scope.</div>}
        </div>

        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <h3>Issue Detail</h3>
          {!activeIssue ? <p>Select an issue to view details.</p> : (
            <>
              <div><strong>ID:</strong> {activeIssue.id}</div>
              <div><strong>Title:</strong> {activeIssue.title}</div>
              <div><strong>Status:</strong> {activeIssue.status}</div>
              <div><strong>Priority:</strong> {activeIssue.priority}</div>
              <div><strong>Category:</strong> {activeIssue.category}</div>
              <div><strong>Created:</strong> {new Date(activeIssue.createdAt).toLocaleString()}</div>
              {canUpdateStatus && (
                <div style={{ marginTop: 10 }}>
                  <label>Update Status</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {ISSUE_STATUSES.map((s) => (
                      <button key={s} onClick={() => updateStatus(s)} disabled={s === activeIssue.status}>{s}</button>
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
