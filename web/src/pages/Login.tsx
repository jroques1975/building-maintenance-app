import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@skylinemanagement.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.token);
      localStorage.setItem('bma_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className='panel' style={{ padding: 24 }}>
        <h2 style={{ color: '#007AFF', textAlign: 'center', marginTop: 0 }}>Sign in</h2>
        <p style={{ color: '#6c757d', textAlign: 'center' }}>Use your role account to access the dashboard.</p>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' />
          </div>
          {error && <div style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</div>}
          <button disabled={loading} style={{ width: '100%', padding: 14 }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
