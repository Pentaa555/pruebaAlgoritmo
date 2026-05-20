import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Checkbox } from '../components/ui/Checkbox';
import { Icon } from '../components/ui/Icon';

interface User { id: string; name: string; email: string; role: string; isActive: boolean; }
interface PagedResult { items: User[]; totalCount: number; page: number; size: number; }

const PAGE_SIZE = 20;

type RoleFilter = 'all' | 'admin' | 'user';
type StatusFilter = 'all' | 'active' | 'inactive';

export function UsersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PagedResult | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, unknown> = { search, page, size: PAGE_SIZE };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
      const res = await api.get('/api/users', { params });
      setData(res.data);
    } catch {
      setError('Error al cargar usuarios. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [search, page, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
      fetchUsers();
    } catch {
      setError('Error al eliminar el usuario.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const items = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  const SkeletonRow = () => (
    <tr>
      <td><div className="skel" style={{ width: 18, height: 18, borderRadius: 4 }} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="skel" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div className="skel" style={{ width: 120, height: 14, borderRadius: 4 }} />
            <div className="skel" style={{ width: 160, height: 12, borderRadius: 4 }} />
          </div>
        </div>
      </td>
      <td><div className="skel" style={{ width: 56, height: 22, borderRadius: 999 }} /></td>
      <td className="hide-mobile"><div className="skel" style={{ width: 70, height: 22, borderRadius: 999 }} /></td>
      <td><div className="skel" style={{ width: 80, height: 30, borderRadius: 6, marginLeft: 'auto' }} /></td>
    </tr>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1 className="h-1">Usuarios</h1>
          {data && (
            <p className="lede muted">
              {data.totalCount} {data.totalCount === 1 ? 'usuario registrado' : 'usuarios registrados'}
            </p>
          )}
        </div>
        <button className="btn accent" onClick={() => navigate('/users/new')}>
          <Icon name="plus" size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="filter-row">
        <div className="input-wrap search">
          <Icon name="search" size={16} className="leading-icon" />
          <input
            type="text"
            className="input has-icon"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="chip-group">
          {(['all', 'admin', 'user'] as RoleFilter[]).map(r => (
            <button
              key={r}
              className={`chip ${roleFilter === r ? 'active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'all' ? 'Todos' : r === 'admin' ? 'Admin' : 'Usuario'}
            </button>
          ))}
        </div>

        <div className="chip-group">
          {(['all', 'active', 'inactive'] as StatusFilter[]).map(s => (
            <button
              key={s}
              className={`chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'Cualquiera' : s === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
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

      <div style={{ overflowX: 'auto' }}>
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ width: 40 }} />
              <th>Usuario</th>
              <th>Rol</th>
              <th className="hide-mobile">Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div className="glyph">∅</div>
                  <p className="muted" style={{ margin: '8px 0 0' }}>
                    {search ? 'No se encontraron usuarios con ese criterio.' : 'Aún no hay usuarios registrados.'}
                  </p>
                  {!search && roleFilter === 'all' && statusFilter === 'all' && (
                    <button className="btn soft" style={{ marginTop: 16 }} onClick={() => navigate('/users/new')}>
                      <Icon name="plus" size={16} /> Crear primero
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              items.map(u => (
                <tr key={u.id} className={selected.has(u.id) ? 'selected' : ''}>
                  <td>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheck={() => toggleSelect(u.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{u.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Pill tone={u.role === 'admin' ? 'accent' : 'neutral'}>{u.role}</Pill>
                  </td>
                  <td className="hide-mobile">
                    <Pill tone={u.isActive ? 'ok' : 'danger'} dot>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </Pill>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn ghost sm"
                        onClick={() => navigate(`/users/${u.id}/edit`)}
                      >
                        <Icon name="edit" size={13} /> Editar
                      </button>
                      <button
                        className="btn danger-ghost sm"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', marginTop: 32, gap: 6 }}>
          <button
            className="btn ghost sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`btn sm ${p === page ? 'primary' : 'ghost'}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="btn ghost sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            →
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="bulkbar">
          <span style={{ fontSize: 13 }}>{selected.size} seleccionado{selected.size > 1 ? 's' : ''}</span>
          <div className="sep" />
          <button onClick={() => setSelected(new Set())}>Deseleccionar</button>
        </div>
      )}
    </div>
  );
}
