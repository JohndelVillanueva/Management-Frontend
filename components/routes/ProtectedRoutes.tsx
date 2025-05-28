// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Props = {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'HEAD' | 'STAFF')[];
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user!.user_type)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
