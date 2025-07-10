// src/components/RedirectIfAuthenticated.tsx
import { Navigate } from 'react-router-dom';
import { JSX } from 'react';
import Loader from '../Loader';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface Props {
  children: JSX.Element;
}

const AuthenticatedRoute = ({ children }: Props) => {
  const { isAuthenticated, isCheckingAuth, hasCheckedAuth } = useRequireAuth();

  if (!hasCheckedAuth || isCheckingAuth) {
    return (
      <div className="p-6">
        <Loader/>
      </div>);
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthenticatedRoute;
