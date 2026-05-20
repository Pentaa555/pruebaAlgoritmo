import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

interface ProfileForm { name: string; }

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [focused, setFocused] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>();

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setServerError(''); setSuccess(false);
    try {
      const res = await api.put(`/api/users/${user?.id}`, { name: data.name });
      updateUser({ name: res.data.name });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Error al actualizar.');
    }
  };

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '540px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem', fontSize: '22px', fontWeight: 700 }}>Mi perfil</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '14px' }}>{user?.email}</p>

      {success && (
        <div role="status" style={{ background: '#f0fdf4', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '4px solid #16a34a' }}>
          Perfil actualizado correctamente.
        </div>
      )}
      {serverError && (
        <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '4px solid #dc2626' }}>
          {serverError}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '1.75rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Nombre completo
            </label>
            <input
              id="name" type="text"
              {...register('name', { required: 'El nombre es obligatorio' })}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%', padding: '9px 13px',
                border: `1.5px solid ${focused ? '#2563eb' : '#d1d5db'}`,
                borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                outline: 'none', transition: 'border-color .2s, box-shadow .2s',
                boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
              }}
            />
            {errors.name && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.name.message}</span>}
          </div>
          <button
            type="submit" disabled={isSubmitting}
            style={{ padding: '11px 28px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
            onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#2563eb'; }}
          >
            {isSubmitting ? 'Guardando...' : 'Actualizar'}
          </button>
        </form>
      </div>
    </div>
  );
}
