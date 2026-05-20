import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

interface User { id: string; name: string; email: string; role: string; isActive: boolean; }
interface PagedResult { items: User[]; totalCount: number; page: number; size: number; }

const PAGE_SIZE = 10;

export function UsersPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/api/users', { params: { search, page, size: PAGE_SIZE } });
      setData(res.data);
    } catch {
      setError('Error al cargar usuarios. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try { await api.delete(`/api/users/${id}`); fetchUsers(); }
    catch { setError('Error al eliminar el usuario.'); }
  };

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#1e3a8a', margin: 0, fontSize: '22px', fontWeight: 700 }}>Usuarios</h1>
        <Link
          to="/users/new"
          style={{ background: '#2563eb', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'background .15s' }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          + Nuevo usuario
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        style={{
          width: '100%', padding: '9px 13px', border: `1.5px solid ${searchFocused ? '#2563eb' : '#d1d5db'}`,
          borderRadius: '8px', fontSize: '14px', marginBottom: '1rem', boxSizing: 'border-box',
          outline: 'none', boxShadow: searchFocused ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none', transition: 'border-color .2s, box-shadow .2s',
        }}
      />

      {error && (
        <div role="alert" style={{ color: '#991b1b', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', borderLeft: '4px solid #dc2626' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Cargando...</p>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                {['Nombre', 'Correo', 'Rol', 'Activo', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.02em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
              {data?.items.map((u, idx) => (
                <tr
                  key={u.id}
                  style={{ borderTop: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbff', transition: 'background .1s' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f0f6ff')}
                  onMouseOut={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbff')}
                >
                  <td style={{ padding: '11px 16px', fontWeight: 500, color: '#1f2937' }}>{u.name}</td>
                  <td style={{ padding: '11px 16px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      background: u.role === 'admin' ? '#eff6ff' : '#f3f4f6',
                      color: u.role === 'admin' ? '#1e40af' : '#6b7280',
                      padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', color: u.isActive ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {u.isActive ? 'Sí' : 'No'}
                  </td>
                  <td style={{ padding: '11px 16px', display: 'flex', gap: '16px' }}>
                    <Link to={`/users/${u.id}/edit`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Editar</Link>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 500 }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff', color: '#374151', opacity: page === 1 ? 0.45 : 1 }}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{ padding: '5px 12px', border: '1px solid', borderRadius: '6px', background: p === page ? '#2563eb' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#2563eb' : '#d1d5db', cursor: 'pointer', fontWeight: p === page ? 600 : 400 }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: '#fff', color: '#374151', opacity: page === totalPages ? 0.45 : 1 }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
