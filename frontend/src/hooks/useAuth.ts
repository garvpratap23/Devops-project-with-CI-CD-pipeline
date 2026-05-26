import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } = useAuthStore();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        clearUser();
      }
    } catch {
      clearUser();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const register = async (email: string, password: string) => {
    const response = await authApi.register({ email, password });
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearUser();
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await authApi.changePassword(currentPassword, newPassword);
    if (response.success) {
      clearUser();
    }
    return response;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    login,
    register,
    logout,
    changePassword,
  };
};

export const useAuthInit = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);
};

export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};
