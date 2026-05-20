import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkStyle: React.CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  marginRight: '1.5rem',
  fontSize: '14px',
  opacity: 0.9,
  transition: 'opacity .15s',
};

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        height: '60px',
        boxShadow: '0 2px 10px rgba(37,99,235,0.35)',
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginRight: 'auto', letterSpacing: '0.03em' }}>
          UserApp
        </span>
        {isAdmin() && (
          <Link to="/users" style={navLinkStyle}>Usuarios</Link>
        )}
        <Link to="/profile" style={navLinkStyle}>{user?.name}</Link>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.35)',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background .15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
        >
          Cerrar sesión
        </button>
      </nav>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
