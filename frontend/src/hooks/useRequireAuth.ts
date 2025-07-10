// src/hooks/useRequireAuth.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";

export const useRequireAuth = () => {
  const { user, isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setHasCheckedAuth(true);
    };
    verify();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    hasCheckedAuth,
  };
};
