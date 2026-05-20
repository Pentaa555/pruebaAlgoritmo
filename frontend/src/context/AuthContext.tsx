import axios from 'axios';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAccessToken, BASE_URL } from '../api/axiosInstance';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isInitializing: boolean;
}

interface AuthContextValue extends Omit<AuthState, 'isInitializing'> {
  isInitializing: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<AuthUser>) => void;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
    isInitializing: true,
  });

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setState(s => ({ ...s, isInitializing: false }));
      return;
    }
    axios
      .post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setState({ accessToken: data.accessToken, user: data.user, isInitializing: false });
      })
      .catch(() => {
        localStorage.removeItem('refreshToken');
        setState({ accessToken: null, user: null, isInitializing: false });
      });
  }, []);

  const login = (accessToken: string, refreshToken: string, user: AuthUser) => {
    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setState({ accessToken, user, isInitializing: false });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken });
      } catch {}
    }
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    setState({ accessToken: null, user: null, isInitializing: false });
  };

  const updateUser = (updated: Partial<AuthUser>) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, user: { ...prev.user!, ...updated } }));
  };

  const isAdmin = () => state.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
