import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, clearToken, getToken } from '../services/api';

type Role = 'TENANT' | 'MAINTENANCE' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN' | string;

export default function Dashboard() {
  const [count, setCount] = useState<number | null>(null);
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
      .then((r) => setCount(r?.meta?.count ?? 0))
      .catch((e) => setErr(e.message));
  }, [role]);

  return (
    <div>
      <h1>Building Maintenance Dashboard</h1>
      {!getToken() ? (
        <p>
          You are not logged in. <Link to='/login'>Login</Link>
        </p>
      ) : (
        <>
          <p>
            Logged in as: <strong>{user?.email || 'Unknown'}</strong> {role ? `(${role})` : ''}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
            <Card
              label='Portfolio Buildings'
              value={role === 'TENANT' ? 'N/A' : count === null ? 'Loading...' : String(count)}
            />
            <Card label='Continuity API' value={err ? 'Error' : 'Connected'} />
          </div>

          <div style={{ background: 'white', borderRadius: 10, padding: 12, marginTop: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick actions</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Link to='/issues'>Issues</Link>
              {role !== 'TENANT' && <Link to='/work-orders'>Work Orders</Link>}
              {(role === 'MANAGER' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <>
                  <Link to='/operator-continuity'>Operator Continuity</Link>
                  <Link to='/uat-command-center'>UAT Command Center</Link>
                </>
              )}
            </div>
          </div>

          {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
          <button
            style={{ marginTop: 12 }}
            onClick={() => {
              clearToken();
              localStorage.removeItem('bma_user');
              window.location.reload();
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
