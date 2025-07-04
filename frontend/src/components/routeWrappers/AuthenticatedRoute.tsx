// src/components/RedirectIfAuthenticated.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { JSX } from 'react';

interface Props {
  children: JSX.Element;
}

const AuthenticatedRoute = ({ children }: Props) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div className="p-6">Checking session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthenticatedRoute;
