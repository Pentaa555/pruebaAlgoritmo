import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { apiMessage } from '../api/apiError';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Icon } from '../components/ui/Icon';

interface ProfileForm { name: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>();
  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    watch,
    formState: { errors: passErrors, isSubmitting: isPassSubmitting },
  } = useForm<PasswordForm>();

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
      setServerError(apiMessage(err, 'Error al actualizar.'));
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPassError(''); setPassSuccess(false);
    try {
      await api.put(`/api/users/${user?.id}`, {
        name: user?.name,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPassSuccess(true);
      resetPass();
    } catch (err: unknown) {
      setPassError(apiMessage(err, 'Error al cambiar la contraseña.'));
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h1 className="h-1">Mi perfil</h1>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left sidebar */}
        <aside className="profile-side">
          <div className="card profile-card">
            <Avatar name={user?.name ?? ''} size="xl" />
            <p className="profile-name">{user?.name}</p>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>{user?.email}</p>

            <div className="row" style={{ gap: 6 }}>
              <Pill tone={user?.role === 'admin' ? 'accent' : 'neutral'}>
                {user?.role ?? 'usuario'}
              </Pill>
              <Pill tone="ok" dot>Activo</Pill>
            </div>

            <div className="profile-meta-list">
              <div className="profile-meta-row">
                <span className="k">Miembro desde</span>
                <span>{joinedDate}</span>
              </div>
              <div className="profile-meta-row">
                <span className="k">Rol</span>
                <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div className="profile-meta-row">
                <span className="k">Estado</span>
                <span style={{ color: 'var(--ok)' }}>Activo</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal info */}
          <div className="section">
            <div className="section-head">
              <h3>Información personal</h3>
              <p>Actualiza tu nombre y consulta tu correo electrónico.</p>
            </div>

            {success && (
              <div
                role="status"
                style={{
                  background: 'var(--ok-soft)',
                  color: 'var(--ok)',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-2)',
                  borderLeft: '3px solid var(--ok)',
                  fontSize: 14,
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="check" size={15} />
                Perfil actualizado correctamente.
              </div>
            )}

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
                  marginBottom: 18,
                }}
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="name">Nombre completo</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    placeholder="Tu nombre"
                    aria-invalid={!!errors.name}
                    {...register('name', { required: 'El nombre es obligatorio' })}
                  />
                  {errors.name && (
                    <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.name.message}</span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="email-display">Correo electrónico</label>
                  <input
                    id="email-display"
                    type="email"
                    className="input"
                    value={user?.email ?? ''}
                    readOnly
                    style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="actions-row">
                <button type="submit" className="btn accent" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  {!isSubmitting && <Icon name="check" size={15} />}
                </button>
              </div>
            </form>
          </div>

          {/* Security */}
          <div className="section">
            <div className="section-head">
              <h3>Seguridad</h3>
              <p>Cambia tu contraseña para mantener tu cuenta segura.</p>
            </div>

            {passSuccess && (
              <div
                role="status"
                style={{
                  background: 'var(--ok-soft)',
                  color: 'var(--ok)',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-2)',
                  borderLeft: '3px solid var(--ok)',
                  fontSize: 14,
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="check" size={15} />
                Contraseña actualizada correctamente.
              </div>
            )}

            {passError && (
              <div
                role="alert"
                style={{
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-2)',
                  borderLeft: '3px solid var(--danger)',
                  fontSize: 14,
                  marginBottom: 18,
                }}
              >
                {passError}
              </div>
            )}

            <form onSubmit={handlePassSubmit(onPasswordSubmit)} noValidate>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="current-pass">Contraseña actual</label>
                  <input
                    id="current-pass"
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    aria-invalid={!!passErrors.currentPassword}
                    {...registerPass('currentPassword', { required: 'La contraseña actual es obligatoria' })}
                  />
                  {passErrors.currentPassword && (
                    <span style={{ color: 'var(--danger)', fontSize: 12 }}>{passErrors.currentPassword.message}</span>
                  )}
                </div>

                <div className="form-2col">
                  <div className="field">
                    <label htmlFor="new-pass">Nueva contraseña</label>
                    <input
                      id="new-pass"
                      type="password"
                      className="input"
                      placeholder="Mínimo 8 caracteres"
                      aria-invalid={!!passErrors.newPassword}
                      {...registerPass('newPassword', {
                        required: 'La nueva contraseña es obligatoria',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                      })}
                    />
                    {passErrors.newPassword && (
                      <span style={{ color: 'var(--danger)', fontSize: 12 }}>{passErrors.newPassword.message}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="confirm-pass">Confirmar contraseña</label>
                    <input
                      id="confirm-pass"
                      type="password"
                      className="input"
                      placeholder="Repite la nueva"
                      aria-invalid={!!passErrors.confirmPassword}
                      {...registerPass('confirmPassword', {
                        required: 'Confirma tu nueva contraseña',
                        validate: v => v === watch('newPassword') || 'Las contraseñas no coinciden',
                      })}
                    />
                    {passErrors.confirmPassword && (
                      <span style={{ color: 'var(--danger)', fontSize: 12 }}>{passErrors.confirmPassword.message}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="actions-row">
                <button type="submit" className="btn accent" disabled={isPassSubmitting}>
                  {isPassSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
                  {!isPassSubmitting && <Icon name="lock" size={15} />}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
