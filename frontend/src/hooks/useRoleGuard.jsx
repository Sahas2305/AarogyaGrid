/**
 * Hook: useRoleGuard
 * Description: Redirects user to their proper dashboard or login screen if they lack permissions.
 * Used on: Role-specific page components
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useRoleGuard = (allowedRoles) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (currentUser.role === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [currentUser, allowedRoles, navigate]);
};

// Component Wrapper version
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const RoleGuard = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (currentUser.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (currentUser.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};
