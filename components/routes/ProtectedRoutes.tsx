// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Props = {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'HEAD' | 'STAFF')[];
};

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireVerification && !user?.is_verified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default ProtectedRoute;
