import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      }
    };
    init();
  }, [setUser, clearUser]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

export default App;
