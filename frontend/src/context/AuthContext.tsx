import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/axiosInstance';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<AuthUser>) => void;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    accessToken: sessionStorage.getItem('accessToken'),
    user: (() => {
      const u = sessionStorage.getItem('user');
      return u ? (JSON.parse(u) as AuthUser) : null;
    })(),
  }));

  const login = (accessToken: string, refreshToken: string, user: AuthUser) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('refreshToken', refreshToken);
    setState({ accessToken, user });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken });
      } catch {}
    }
    sessionStorage.clear();
    localStorage.removeItem('refreshToken');
    setState({ accessToken: null, user: null });
  };

  const updateUser = (updated: Partial<AuthUser>) => {
    if (!state.user) return;
    const newUser = { ...state.user, ...updated };
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setState((prev) => ({ ...prev, user: newUser }));
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
