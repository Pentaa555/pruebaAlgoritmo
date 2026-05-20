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
      setServerError(e.response?.data?.message ?? 'Error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Crear cuenta</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Completa tus datos para registrarte</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {[
            { id: 'name', label: 'Nombre completo', type: 'text', rules: { required: 'El nombre es obligatorio' } },
            { id: 'email', label: 'Correo electrónico', type: 'email', rules: { required: 'El correo es obligatorio', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } } },
            { id: 'password', label: 'Contraseña', type: 'password', rules: { required: 'La contraseña es obligatoria', minLength: { value: 8, message: 'Mínimo 8 caracteres' } } },
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
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2563eb' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
