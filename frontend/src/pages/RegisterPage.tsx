import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface RegisterForm { name: string; email: string; password: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/register', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate('/profile');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Create account</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Fill in your details to register</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {[
            { id: 'name', label: 'Full name', type: 'text', rules: { required: 'Name is required' } },
            { id: 'email', label: 'Email', type: 'email', rules: { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } } },
            { id: 'password', label: 'Password', type: 'password', rules: { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } } },
          ].map(({ id, label, type, rules }) => (
            <div key={id} style={{ marginBottom: '1rem' }}>
              <label htmlFor={id} style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>{label}</label>
              <input id={id} type={type} {...register(id as keyof RegisterForm, rules)} style={inputStyle} />
              {errors[id as keyof RegisterForm] && (
                <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors[id as keyof RegisterForm]?.message}</span>
              )}
            </div>
          ))}

          <button
            type="submit" disabled={isSubmitting}
            style={{ width: '100%', padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
