import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/login', label: 'Login' },
  { to: '/issues', label: 'Issues' },
  { to: '/work-orders', label: 'Work Orders' },
  { to: '/operator-continuity', label: 'Operator Continuity' },
  { to: '/uat-checklist', label: 'UAT Checklist' },
];

export default function AppShell() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f6f7fb' }}>
      <header style={{ background: '#111827', color: 'white', padding: '14px 20px' }}>
        <strong>Building Maintenance App — UAT Shell</strong>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 52px)' }}>
        <aside style={{ borderRight: '1px solid #e5e7eb', background: 'white', padding: 12 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 6,
                color: isActive ? '#111827' : '#374151',
                background: isActive ? '#e5e7eb' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </aside>

        <main style={{ padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
