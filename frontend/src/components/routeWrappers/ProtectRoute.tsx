// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { JSX } from 'react';
import Loader from '../Loader';
interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div className="p-6"><Loader/></div>;
  }

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected route that is children
  return children;

};

export default ProtectedRoute;
