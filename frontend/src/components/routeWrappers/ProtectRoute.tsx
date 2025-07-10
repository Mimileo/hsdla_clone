// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { JSX } from 'react';
import Loader from '../Loader';
import { useRequireAuth } from '@/hooks/useRequireAuth';
interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isCheckingAuth, hasCheckedAuth } = useRequireAuth();


  // Check if the user is authenticated and the auth check has completed
  if (!hasCheckedAuth || isCheckingAuth) {
    // Render a loader while the auth check is in progress
    return <div className="p-6"><Loader/></div>;
  }

  // Check if the user is authenticated or the user is null
  if (!isAuthenticated || !user) {
    // Redirect to the login page if not authenticated or user is null
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected route that is children
  return children;

};

export default ProtectedRoute;
