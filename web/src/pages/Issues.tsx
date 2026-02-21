import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [priority, setPriority] = useState('MEDIUM');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
    setLoading(true);
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
          loadIssues(list[0].id).catch((e) => { setError(e.message); setLoading(false); });
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedBuilding) return;
    loadIssues(selectedBuilding).catch((e) => { setError(e.message); setLoading(false); });
  }, [selectedBuilding, statusFilter]);

  async function toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function addPhoto(file?: File) {
    if (!file) return;
    setPhotos((prev) => {
      if (prev.length >= 4) return prev;
      return [...prev, file];
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const attachmentPayload = await Promise.all(
        photos.slice(0, 4).map(async (f) => ({
          filename: f.name,
          fileType: f.type || 'image/jpeg',
          fileSize: f.size,
          url: await toDataUrl(f),
        }))
      );

      await apiRequest('/issues', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          location: location || undefined,
          buildingId: selectedBuilding,
          attachments: attachmentPayload,
        }),
      });
      setMessage('Issue created successfully.');
      setTitle('');
      setDescription('');
      setLocation('');
      setPhotos([]);
      await loadIssues(selectedBuilding);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
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
      {!canUpdateStatus && <p style={{ color: '#6b7280' }}>Your role can create/view issues but cannot update status.</p>}

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
            <label style={{ gridColumn: '1 / -1' }}>
              Photos (up to 4)
              <input
                ref={photoInputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={(e) => {
                  addPhoto((e.target.files || [])[0]);
                  e.currentTarget.value = '';
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const f = photos[idx];
                  return (
                    <button
                      type='button'
                      key={idx}
                      onClick={() => {
                        if (f) removePhoto(idx);
                        else photoInputRef.current?.click();
                      }}
                      style={{ width: 72, height: 72, padding: 0, border: '2px dashed #ced4da', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f8f9fa', color: '#6c757d' }}
                      title={f ? 'Click to remove photo' : 'Add photo to next open slot'}
                    >
                      {f ? <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>+</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: '#6c757d', marginTop: 6 }}>Click an empty slot to add. Click a filled slot to remove.</div>
            </label>
          </div>
          <button style={{ marginTop: 10 }} disabled={submitting || !selectedBuilding}>{submitting ? 'Creating...' : 'Create Issue'}</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Issues found: {issues.length}</div>
          {loading && <div style={{ color: '#6b7280', marginBottom: 8 }}>Loading issues...</div>}
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
