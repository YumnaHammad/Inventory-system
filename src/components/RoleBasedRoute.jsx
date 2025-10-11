import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles = [], fallbackPath = '/' }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
