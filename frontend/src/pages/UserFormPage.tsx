import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

interface UserForm { name: string; email: string; password: string; role: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
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

  return (
    <div style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h1>

      {serverError && (
        <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Nombre completo</label>
          <input id="name" {...register('name', { required: 'El nombre es obligatorio' })} style={inputStyle} />
          {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Correo electrónico</label>
          <input id="email" type="email" {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })} style={inputStyle} />
          {errors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            Contraseña {isEdit && <span style={{ color: '#6b7280', fontWeight: 400 }}>(dejar vacío para mantener la actual)</span>}
          </label>
          <input
            id="password" type="password"
            {...register('password', { ...(!isEdit && { required: 'La contraseña es obligatoria' }), minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            style={inputStyle}
          />
          {errors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.password.message}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Rol</label>
          <select id="role" {...register('role', { required: true })} style={inputStyle}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/users')} style={{ flex: 1, padding: '10px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '15px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
