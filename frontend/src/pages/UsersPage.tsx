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

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/api/users', { params: { search, page, size: PAGE_SIZE } });
      setData(res.data);
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/api/users/${id}`); fetchUsers(); }
    catch { setError('Failed to delete user.'); }
  };

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#1e3a8a', margin: 0 }}>Users</h1>
        <Link to="/users/new" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}>+ New user</Link>
      </div>

      <input
        type="text" placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', marginBottom: '1rem', boxSizing: 'border-box' }}
      />

      {error && <div role="alert" style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}

      {loading ? <p style={{ color: '#6b7280' }}>Loading...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                {['Name', 'Email', 'Role', 'Active', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No users found.</td></tr>
              )}
              {data?.items.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px' }}>{u.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: u.role === 'admin' ? '#eff6ff' : '#f9fafb', color: u.role === 'admin' ? '#1e3a8a' : '#6b7280', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: u.isActive ? '#16a34a' : '#dc2626' }}>{u.isActive ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: '12px' }}>
                    <Link to={`/users/${u.id}/edit`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px' }}>Edit</Link>
                    <button onClick={() => handleDelete(u.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1rem' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff' }}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', background: p === page ? '#2563eb' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer' }}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: '#fff' }}>→</button>
        </div>
      )}
    </div>
  );
}
