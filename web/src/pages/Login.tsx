export default function Login() {
  return (
    <div>
      <h2>Login (UAT Stub)</h2>
      <p>Use this screen to validate role-entry UX before API wiring.</p>
      <div style={{ background: 'white', padding: 16, borderRadius: 10, maxWidth: 420 }}>
        <label>Email</label>
        <input style={{ width: '100%', margin: '6px 0 12px', padding: 8 }} placeholder='manager@example.com' />
        <label>Password</label>
        <input type='password' style={{ width: '100%', margin: '6px 0 12px', padding: 8 }} placeholder='••••••••' />
        <label>Role</label>
        <select style={{ width: '100%', margin: '6px 0 12px', padding: 8 }} defaultValue='MANAGER'>
          <option>ADMIN</option>
          <option>MANAGER</option>
          <option>MAINTENANCE</option>
          <option>TENANT</option>
        </select>
        <button style={{ padding: '8px 14px' }}>Sign In (Demo)</button>
      </div>
    </div>
  );
}
