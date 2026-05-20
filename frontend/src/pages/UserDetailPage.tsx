import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { apiMessage } from '../api/apiError';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Icon } from '../components/ui/Icon';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/users/${id}`)
      .then(res => setUser(res.data))
      .catch(err => setError(apiMessage(err, 'No se pudo cargar el usuario.')))
      .finally(() => setLoading(false));
  }, [id]);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1 className="h-1">Detalle de usuario</h1>
        </div>
        <button className="btn ghost" onClick={() => navigate('/users')}>
          ← Volver
        </button>
      </div>

      {error && (
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
          {error}
        </div>
      )}

      {loading && (
        <div className="card profile-card" style={{ maxWidth: 420 }}>
          <div className="skel" style={{ width: 80, height: 80, borderRadius: '50%' }} />
          <div className="skel" style={{ width: 160, height: 20, borderRadius: 4 }} />
          <div className="skel" style={{ width: 200, height: 14, borderRadius: 4 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skel" style={{ width: 60, height: 22, borderRadius: 999 }} />
            <div className="skel" style={{ width: 70, height: 22, borderRadius: 999 }} />
          </div>
        </div>
      )}

      {!loading && user && (
        <div className="card profile-card" style={{ maxWidth: 420 }}>
          <Avatar name={user.name} size="xl" />
          <p className="profile-name">{user.name}</p>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>{user.email}</p>

          <div className="row" style={{ gap: 6 }}>
            <Pill tone={user.role === 'admin' ? 'accent' : 'neutral'}>
              {user.role}
            </Pill>
            <Pill tone={user.isActive ? 'ok' : 'warn'} dot>
              {user.isActive ? 'Activo' : 'Inactivo'}
            </Pill>
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-row">
              <span className="k">Correo</span>
              <span>{user.email}</span>
            </div>
            <div className="profile-meta-row">
              <span className="k">Rol</span>
              <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <div className="profile-meta-row">
              <span className="k">Estado</span>
              <span style={{ color: user.isActive ? 'var(--ok)' : 'var(--text-muted)' }}>
                {user.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="profile-meta-row">
              <span className="k">Registrado</span>
              <span>{joinedDate}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn accent" onClick={() => navigate(`/users/${id}/edit`)}>
              <Icon name="edit" size={15} /> Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
