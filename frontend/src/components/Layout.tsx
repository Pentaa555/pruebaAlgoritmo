import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <nav style={{
        background: '#2563eb',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginRight: 'auto' }}>
          UserApp
        </span>
        {isAdmin() && (
          <Link to="/users" style={{ color: '#fff', textDecoration: 'none', marginRight: '1.5rem', fontSize: '14px' }}>
            Users
          </Link>
        )}
        <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '1.5rem', fontSize: '14px' }}>
          {user?.name}
        </Link>
        <button
          onClick={handleLogout}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
        >
          Logout
        </button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
