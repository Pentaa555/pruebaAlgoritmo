import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface LoginForm { email: string; password: string; }

const baseInput: React.CSSProperties = {
  width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color .2s, box-shadow .2s',
};
const focusStyle: React.CSSProperties = { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' };
const blurStyle: React.CSSProperties = { borderColor: '#d1d5db', boxShadow: 'none' };

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/users' : '/profile');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Error al iniciar sesión. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem', fontSize: '22px' }}>Iniciar sesión</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.75rem', fontSize: '14px' }}>Ingresa tus credenciales para continuar</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '4px solid #dc2626' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Correo electrónico</label>
            <input
              id="email" type="email"
              {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })}
              style={{ ...baseInput, ...(focused === 'email' ? focusStyle : blurStyle) }}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
            />
            {errors.email && <span id="email-err" style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Contraseña</label>
            <input
              id="password" type="password"
              {...register('password', { required: 'La contraseña es obligatoria' })}
              style={{ ...baseInput, ...(focused === 'password' ? focusStyle : blurStyle) }}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'pass-err' : undefined}
            />
            {errors.password && <span id="pass-err" style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.password.message}</span>}
          </div>

          <button
            type="submit" disabled={isSubmitting}
            style={{ width: '100%', padding: '11px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
            onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#2563eb'; }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '14px', color: '#6b7280' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: '#2563eb', fontWeight: 500 }}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
