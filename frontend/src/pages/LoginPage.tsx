import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { apiMessage } from '../api/apiError';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/ui/Icon';

interface LoginForm { email: string; password: string; }

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { login, accessToken, user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);

  if (isInitializing) return null;
  if (accessToken) return <Navigate to={user?.role === 'admin' ? '/users' : '/profile'} replace />;

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/users' : '/profile');
    } catch (err: unknown) {
      setServerError(apiMessage(err, 'Error al iniciar sesión. Intenta de nuevo.'));
    }
  };

  return (
    <div className="login">
      {/* Left: form */}
      <div className="login-left">
        <div className="row">
          <span className="brand-mark small" />
          <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>UserApp</span>
        </div>

        <div className="login-form-wrap anim-fade-up">
          <h1 className="h-2">
            Bienvenido <em className="italic-serif">de vuelta.</em>
          </h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
            Ingresa tus credenciales para continuar
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
                marginTop: 16,
              }}
            >
              {serverError}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                  aria-describedby={errors.email ? 'email-err' : undefined}
                  {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' },
                  })}
                />
              </div>
              {errors.email && (
                <span id="email-err" style={{ color: 'var(--danger)', fontSize: 12 }}>
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrap">
                <Icon name="lock" size={16} className="leading-icon" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input has-icon"
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'pass-err' : undefined}
                  {...register('password', { required: 'La contraseña es obligatoria' })}
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
                <span id="pass-err" style={{ color: 'var(--danger)', fontSize: 12 }}>
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn accent full lg"
              disabled={isSubmitting}
              style={{ marginTop: 6 }}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
              {!isSubmitting && <Icon name="arrowRight" size={16} />}
            </button>
          </form>
        </div>

        <p className="login-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>

      {/* Right: decorative */}
      <div className="login-right" aria-hidden="true">
        <div className="grain" />
        <div className="login-meta">
          <span>UserApp</span>
          <span>v1.0</span>
        </div>
        <div className="login-quote">
          <div className="qmark">"</div>
          <blockquote>
            Gestión de usuarios,<br />
            <em>simple y elegante.</em>
          </blockquote>
          <p className="login-cite">— UserApp Platform</p>
        </div>
        <div className="login-meta">
          <span>Acceso seguro</span>
          <span>JWT · HS256</span>
        </div>
      </div>
    </div>
  );
}
