import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Icon } from '../components/ui/Icon';

interface UserForm { name: string; email: string; password: string; role: string; }

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({ defaultValues: { role: 'user' } });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/users/${id}`)
      .then(res => reset({ name: res.data.name, email: res.data.email, role: res.data.role, password: '' }))
      .catch(() => navigate('/users'));
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: UserForm) => {
    setServerError('');
    const payload = isEdit
      ? { name: data.name, email: data.email, role: data.role, newPassword: data.password || undefined }
      : { name: data.name, email: data.email, role: data.role, password: data.password };
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
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }} className="anim-fade-up">
        <button
          className="btn ghost sm"
          style={{ marginBottom: 24 }}
          onClick={() => navigate('/users')}
        >
          ← Volver
        </button>

        <p className="eyebrow" style={{ marginBottom: 6 }}>
          {isEdit ? 'Editar' : 'Nuevo'}
        </p>
        <h1 className="h-2" style={{ marginBottom: 28 }}>
          {isEdit ? 'Editar usuario' : 'Crear usuario'}
        </h1>

        {serverError && (
          <div
            role="alert"
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              padding: '10px 14px',
              borderRadius: 'var(--r-2)',
              borderLeft: '3px solid var(--danger)',
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {serverError}
          </div>
        )}

        <div className="card" style={{ padding: '24px 28px' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                className="input"
                placeholder="Nombre completo"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'El nombre es obligatorio' })}
              />
              {errors.name && (
                <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.name.message}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="correo@ejemplo.com"
                aria-invalid={!!errors.email}
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' },
                })}
              />
              {errors.email && (
                <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.email.message}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="uf-password">
                Contraseña
                {isEdit && (
                  <span className="muted" style={{ fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
                    (vacío = mantener actual)
                  </span>
                )}
              </label>
              <div className="input-wrap">
                <input
                  id="uf-password"
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  placeholder={isEdit ? '••••••••' : 'Mínimo 8 caracteres'}
                  style={{ paddingRight: 44 }}
                  aria-invalid={!!errors.password}
                  {...register('password', {
                    ...(!isEdit && { required: 'La contraseña es obligatoria' }),
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
                <button
                  type="button"
                  className="iconbtn"
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
              {errors.password && (
                <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.password.message}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="role">Rol</label>
              <select id="role" className="input" {...register('role', { required: true })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="row" style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="btn accent"
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
                {!isSubmitting && <Icon name="check" size={15} />}
              </button>
              <button
                type="button"
                className="btn ghost"
                style={{ flex: 1 }}
                onClick={() => navigate('/users')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
