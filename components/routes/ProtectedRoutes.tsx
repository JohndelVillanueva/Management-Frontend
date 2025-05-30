// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Props = {
  children: React.ReactNode;
  requireVerification?: boolean;
  allowedRoles?: ('ADMIN' | 'HEAD' | 'STAFF')[];
};

const ProtectedRoute = ({ 
  children, 
  requireVerification = true,
  allowedRoles 
}: Props) => {
  const { user } = useAuth();

  // If user is null/undefined, redirect to login (not authenticated)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If verification is required but user is not verified
  if (requireVerification && !user.is_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If specific roles are required but user's role is not allowed
  if (
    allowedRoles &&
    (user.role === undefined || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Otherwise, render the protected content
  return children;
};

export default ProtectedRoute;