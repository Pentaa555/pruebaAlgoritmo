import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

interface UserForm { name: string; email: string; password: string; role: string; }

const baseInput: React.CSSProperties = {
  width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color .2s, box-shadow .2s',
};

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserForm>({ defaultValues: { role: 'user' } });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/users/${id}`).then((res) =>
      reset({ name: res.data.name, email: res.data.email, role: res.data.role, password: '' })
    );
  }, [id, isEdit, reset]);

  const onSubmit = async (data: UserForm) => {
    setServerError('');
    const payload = { ...data, password: data.password || undefined };
    try {
      if (isEdit) await api.put(`/api/users/${id}`, payload);
      else await api.post('/api/users', payload);
      navigate('/users');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Error en la operación. Intenta de nuevo.');
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    ...baseInput,
    ...(focused === field ? { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } : {}),
  });
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500, color: '#374151' };
  const errStyle: React.CSSProperties = { color: '#dc2626', fontSize: '12px', marginTop: '3px', display: 'block' };

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '540px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '1.5rem', fontSize: '22px', fontWeight: 700 }}>
        {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      </h1>

      {serverError && (
        <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '14px', borderLeft: '4px solid #dc2626' }}>
          {serverError}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '1.75rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={labelStyle}>Nombre completo</label>
            <input id="name" {...register('name', { required: 'El nombre es obligatorio' })} style={inputStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
            {errors.name && <span style={errStyle}>{errors.name.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={labelStyle}>Correo electrónico</label>
            <input id="email" type="email" {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })} style={inputStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            {errors.email && <span style={errStyle}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={labelStyle}>
              Contraseña{' '}
              {isEdit && <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '13px' }}>(dejar vacío para mantener la actual)</span>}
            </label>
            <input
              id="password" type="password"
              {...register('password', { ...(!isEdit && { required: 'La contraseña es obligatoria' }), minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
              style={inputStyle('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
            />
            {errors.password && <span style={errStyle}>{errors.password.message}</span>}
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="role" style={labelStyle}>Rol</label>
            <select id="role" {...register('role', { required: true })} style={inputStyle('role')} onFocus={() => setFocused('role')} onBlur={() => setFocused(null)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit" disabled={isSubmitting}
              style={{ flex: 1, padding: '11px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
              onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8'; }}
              onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#2563eb'; }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button" onClick={() => navigate('/users')}
              style={{ flex: 1, padding: '11px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
