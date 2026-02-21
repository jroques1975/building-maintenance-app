import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, clearToken, getToken } from '../services/api';

type Role = 'TENANT' | 'MAINTENANCE' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN' | string;

export default function Dashboard() {
  const [count, setCount] = useState<number>(0);
  const [issues, setIssues] = useState<any[]>([]);
  const [err, setErr] = useState('');

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('bma_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const role: Role | null = user?.role || null;

  useEffect(() => {
    if (!getToken() || role === 'TENANT') return;
    apiRequest('/portfolio/buildings')
      .then(async (r) => {
        const buildings = r?.data?.buildings ?? [];
        setCount(r?.meta?.count ?? 0);
        if (buildings[0]?.id) {
          const ir = await apiRequest(`/issues?buildingId=${buildings[0].id}`);
          setIssues((ir?.data?.issues ?? []).slice(0, 4));
        }
      })
      .catch((e) => setErr(e.message));
  }, [role]);

  if (!getToken()) {
    return <p>You are not logged in. <Link to='/login'>Login</Link></p>;
  }

  const urgent = issues.filter((i) => ['URGENT', 'HIGH'].includes(i.priority)).length;
  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length;

  return (
    <div>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>{role === 'MANAGER' || role === 'ADMIN' ? '🏢 Manager Dashboard' : 'Dashboard'}</h2>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat value={count} label='Portfolio Buildings' />
        <Stat value={issues.length} label='Open Issues' />
        <Stat value={urgent} label='Urgent Issues' />
        <Stat value={inProgress} label='In Progress' />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <section className='panel' style={{ padding: 16 }}>
          <h3>Issue Queue</h3>
          {issues.length === 0 ? <p>No issues loaded.</p> : issues.map((i) => (
            <div key={i.id} style={{ background: '#f8f9fa', borderLeft: `5px solid ${i.priority === 'URGENT' ? '#dc3545' : '#007AFF'}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <strong>{i.title}</strong>
              <div>{i.building?.name || i.buildingId}</div>
              <div style={{ color: '#6c757d' }}>{i.priority} • {i.status}</div>
            </div>
          ))}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <section className='panel' style={{ padding: 16 }}>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to='/issues'><button style={{ width: '100%' }}>➕ New Issue</button></Link>
              <Link to='/work-orders'><button style={{ width: '100%' }}>🛠️ Work Orders</button></Link>
              {(role === 'MANAGER' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <Link to='/operator-continuity'><button style={{ width: '100%' }}>🔄 Operator Continuity</button></Link>
              )}
            </div>
          </section>
          <section className='panel' style={{ padding: 16 }}>
            <h3>Session</h3>
            <div>{user?.email}</div>
            <div style={{ color: '#6c757d', marginBottom: 10 }}>{role}</div>
            <button onClick={() => { clearToken(); localStorage.removeItem('bma_user'); window.location.href = '/login'; }}>Logout</button>
          </section>
        </aside>
      </div>

      {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: '#f8f9fa', borderRadius: 10, padding: 14, border: '1px solid #dee2e6', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#007AFF' }}>{value}</div>
      <div style={{ color: '#6c757d', fontSize: 14 }}>{label}</div>
    </div>
  );
}
