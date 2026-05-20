import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/users' : '/profile');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Sign in</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Enter your credentials to continue</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Email</label>
            <input
              id="email" type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              style={inputStyle} aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
            />
            {errors.email && <span id="email-err" style={{ color: '#dc2626', fontSize: '12px' }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Password</label>
            <input
              id="password" type="password"
              {...register('password', { required: 'Password is required' })}
              style={inputStyle} aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'pass-err' : undefined}
            />
            {errors.password && <span id="pass-err" style={{ color: '#dc2626', fontSize: '12px' }}>{errors.password.message}</span>}
          </div>

          <button
            type="submit" disabled={isSubmitting}
            style={{ width: '100%', padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
