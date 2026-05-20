import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { accessToken, isInitializing } = useAuth();
  if (isInitializing) return null;
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}
