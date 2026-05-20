import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface RegisterForm { name: string; email: string; password: string; }

const baseInput: React.CSSProperties = {
  width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color .2s, box-shadow .2s',
};

const fields: { id: keyof RegisterForm; label: string; type: string; rules: object }[] = [
  { id: 'name', label: 'Nombre completo', type: 'text', rules: { required: 'El nombre es obligatorio' } },
  { id: 'email', label: 'Correo electrónico', type: 'email', rules: { required: 'El correo es obligatorio', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } } },
  { id: 'password', label: 'Contraseña', type: 'password', rules: { required: 'La contraseña es obligatoria', minLength: { value: 8, message: 'Mínimo 8 caracteres' } } },
];

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

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
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem', fontSize: '22px' }}>Crear cuenta</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.75rem', fontSize: '14px' }}>Completa tus datos para registrarte</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '4px solid #dc2626' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {fields.map(({ id, label, type, rules }) => (
            <div key={id} style={{ marginBottom: '1rem' }}>
              <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>{label}</label>
              <input
                id={id} type={type}
                {...register(id, rules)}
                style={{ ...baseInput, ...(focused === id ? { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } : {}) }}
                onFocus={() => setFocused(id)}
                onBlur={() => setFocused(null)}
              />
              {errors[id] && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors[id]?.message}</span>}
            </div>
          ))}

          <button
            type="submit" disabled={isSubmitting}
            style={{ width: '100%', padding: '11px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background .15s' }}
            onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#2563eb'; }}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '14px', color: '#6b7280' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
