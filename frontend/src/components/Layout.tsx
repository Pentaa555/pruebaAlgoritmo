import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './ui/Icon';
import { Avatar } from './ui/Avatar';

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path) ? 'active' : '';

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate(isAdmin() ? '/users' : '/profile')}
          style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}
        >
          <span className="brand-mark" />
          <span>UserApp</span>
        </button>

        <nav className="nav">
          {isAdmin() && (
            <Link className={isActive('/users')} to="/users">Usuarios</Link>
          )}
          <Link className={isActive('/profile')} to="/profile">Mi perfil</Link>
        </nav>

        <div className="topbar-spacer" />

        <div className="topbar-right">
          <button className="iconbtn" onClick={toggle} aria-label="Cambiar tema" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            style={{ background: 'transparent', border: 0, cursor: 'pointer', gap: 8, padding: '4px 10px 4px 4px', borderRadius: 999, display: 'flex', alignItems: 'center' }}
          >
            <Avatar name={user?.name ?? ''} size="sm" />
            <span style={{ fontSize: 14 }}>{user?.name}</span>
          </button>
          <button className="btn ghost sm" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
