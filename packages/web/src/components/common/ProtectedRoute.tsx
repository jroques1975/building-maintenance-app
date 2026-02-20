import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';

interface ProtectedRouteProps {
  children: ReactElement;
  requireRole?: string | string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    // Show loading spinner while checking authentication
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user) {
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!requiredRoles.includes(user.role)) {
      // User doesn't have required role, redirect to dashboard or show unauthorized
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;