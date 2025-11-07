import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have the required role
    // Redirect to dashboard or show an unauthorized message
    console.warn(`User ${user.username} with role ${user.role} attempted to access restricted route.`);
    return <Navigate to="/dashboard" replace />; // Or to a dedicated /unauthorized page
  }

  return <>{children}</>;
};