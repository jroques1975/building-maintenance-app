import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

type Role = 'TENANT' | 'MAINTENANCE' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN' | string;

const navItems: Array<{ to: string; label: string; roles?: Role[] }> = [
  { to: '/', label: 'Dashboard' },
  { to: '/login', label: 'Login' },
  { to: '/issues', label: 'Issues', roles: ['TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/work-orders', label: 'Work Orders', roles: ['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/operator-continuity', label: 'Operator', roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/uat-command-center', label: 'UAT', roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
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
  const location = useLocation();
  const [role, setRole] = useState<Role | null>(getCurrentRole());

  useEffect(() => {
    setRole(getCurrentRole());
  }, [location.pathname]);

  const visibleNav = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <div style={{ padding: 20 }}>
      <div className='panel' style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <h1 style={{ color: '#007AFF', textAlign: 'center', marginTop: 0 }}>Building Maintenance App</h1>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                padding: '8px 14px',
                borderRadius: 20,
                background: isActive ? '#007AFF' : '#e9ecef',
                color: isActive ? 'white' : '#212529',
                fontWeight: 600,
                textDecoration: 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <Outlet />
      </div>
    </div>
  );
}
