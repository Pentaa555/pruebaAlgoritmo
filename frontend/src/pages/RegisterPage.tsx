import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { apiMessage } from '../api/apiError';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/ui/Icon';

interface RegisterForm { name: string; email: string; password: string; }

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const { login, accessToken, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);

  if (isInitializing) return null;
  if (accessToken) return <Navigate to="/profile" replace />;

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/register', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate('/profile');
    } catch (err: unknown) {
      setServerError(apiMessage(err, 'Error al registrarse. Intenta de nuevo.'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '28px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }} className="anim-fade-up">
        <div className="row" style={{ marginBottom: 28 }}>
          <span className="brand-mark small" />
          <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>UserApp</span>
        </div>

        <h1 className="h-2" style={{ marginBottom: 6 }}>Crear cuenta</h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
          Completa tus datos para empezar
        </p>

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
              marginBottom: 16,
            }}
          >
            {serverError}
          </div>
        )}

        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="name">Nombre completo</label>
            <div className="input-wrap">
              <Icon name="user" size={16} className="leading-icon" />
              <input
                id="name"
                type="text"
                className="input has-icon"
                placeholder="Tu nombre"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'El nombre es obligatorio' })}
              />
            </div>
            {errors.name && (
              <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.name.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrap">
              <Icon name="mail" size={16} className="leading-icon" />
              <input
                id="email"
                type="email"
                className="input has-icon"
                placeholder="tu@correo.com"
                aria-invalid={!!errors.email}
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' },
                })}
              />
            </div>
            {errors.email && (
              <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.email.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="reg-password">Contraseña</label>
            <div className="input-wrap">
              <Icon name="lock" size={16} className="leading-icon" />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="input has-icon"
                placeholder="Mínimo 8 caracteres"
                style={{ paddingRight: 44 }}
                aria-invalid={!!errors.password}
                {...register('password', {
                  required: 'La contraseña es obligatoria',
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

          <button
            type="submit"
            className="btn accent full lg"
            disabled={isSubmitting}
            style={{ marginTop: 4 }}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            {!isSubmitting && <Icon name="arrowRight" size={16} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
