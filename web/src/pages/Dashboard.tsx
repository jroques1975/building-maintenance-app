import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, clearToken, getToken } from '../services/api';

export default function Dashboard() {
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const user = localStorage.getItem('bma_user');

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/portfolio/buildings')
      .then((r) => setCount(r?.meta?.count ?? 0))
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <h1>Building Maintenance Dashboard</h1>
      {!getToken() ? (
        <p>
          You are not logged in. <Link to='/login'>Login</Link>
        </p>
      ) : (
        <>
          <p>Logged in as: {user ? JSON.parse(user).email : 'Unknown'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
            <Card label='Portfolio Buildings' value={count === null ? 'Loading...' : String(count)} />
            <Card label='Continuity API' value={err ? 'Error' : 'Connected'} />
          </div>
          {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
          <button style={{ marginTop: 12 }} onClick={() => { clearToken(); localStorage.removeItem('bma_user'); window.location.reload(); }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div style={{ background: 'white', borderRadius: 10, padding: 12 }}><div style={{ color: '#6b7280', fontSize: 13 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div></div>;
}
