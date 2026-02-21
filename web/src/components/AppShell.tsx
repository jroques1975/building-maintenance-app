import { NavLink, Outlet } from 'react-router-dom';

type Role = 'TENANT' | 'MAINTENANCE' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN' | string;

const navItems: Array<{ to: string; label: string; roles?: Role[] }> = [
  { to: '/', label: 'Dashboard' },
  { to: '/login', label: 'Login' },
  { to: '/issues', label: 'Issues', roles: ['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/work-orders', label: 'Work Orders', roles: ['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/operator-continuity', label: 'Operator Continuity', roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/uat-checklist', label: 'UAT Checklist', roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/uat-command-center', label: 'UAT Command Center', roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
];

function getCurrentRole(): Role | null {
  try {
    const raw = localStorage.getItem('bma_user');
    return raw ? JSON.parse(raw).role : null;
  } catch {
    return null;
  }
}

export default function AppShell() {
  const role = getCurrentRole();
  const visibleNav = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f6f7fb' }}>
      <header style={{ background: '#111827', color: 'white', padding: '14px 20px' }}>
        <strong>Building Maintenance App — UAT Shell</strong>
        {role && <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.85 }}>Role: {role}</span>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 52px)' }}>
        <aside style={{ borderRight: '1px solid #e5e7eb', background: 'white', padding: 12 }}>
          {visibleNav.map((item) => (
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
