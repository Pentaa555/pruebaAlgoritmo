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
      setServerError(e.response?.data?.message ?? 'Operation failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>{isEdit ? 'Edit user' : 'New user'}</h1>

      {serverError && (
        <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Full name</label>
          <input id="name" {...register('name', { required: 'Name is required' })} style={inputStyle} />
          {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Email</label>
          <input id="email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} style={inputStyle} />
          {errors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            Password {isEdit && <span style={{ color: '#6b7280', fontWeight: 400 }}>(leave blank to keep current)</span>}
          </label>
          <input
            id="password" type="password"
            {...register('password', { ...(!isEdit && { required: 'Password is required' }), minLength: { value: 8, message: 'At least 8 characters' } })}
            style={inputStyle}
          />
          {errors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.password.message}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Role</label>
          <select id="role" {...register('role', { required: true })} style={inputStyle}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/users')} style={{ flex: 1, padding: '10px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '15px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
