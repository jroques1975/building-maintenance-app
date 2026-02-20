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
    <div>
      <h2>Login</h2>
      <p>Real backend login (seed user prefilled).</p>
      <form onSubmit={onSubmit} style={{ background: 'white', padding: 16, borderRadius: 10, maxWidth: 420 }}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', margin: '6px 0 12px', padding: 8 }} />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' style={{ width: '100%', margin: '6px 0 12px', padding: 8 }} />
        {error && <div style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</div>}
        <button disabled={loading} style={{ padding: '8px 14px' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </div>
  );
}
