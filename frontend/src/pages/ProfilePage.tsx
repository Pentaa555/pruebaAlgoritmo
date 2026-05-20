import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

interface ProfileForm { name: string; }

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
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
      setServerError(e.response?.data?.message ?? 'Update failed.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Profile</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{user?.email}</p>

      {success && <div role="status" style={{ background: '#f0fdf4', color: '#166534', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>Profile updated.</div>}
      {serverError && <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Full name</label>
          <input
            id="name" type="text"
            {...register('name', { required: 'Name is required' })}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
          />
          {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          {isSubmitting ? 'Saving...' : 'Update'}
        </button>
      </form>
    </div>
  );
}
