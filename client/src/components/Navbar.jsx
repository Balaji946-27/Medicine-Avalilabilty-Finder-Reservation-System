import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'pharmacy') return '/pharmacy/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? 'var(--shadow)' : 'var(--shadow-sm)' }}>
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo-icon">M</div>
        <span className="navbar-brand-text">
          Medi<span>Find</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      <ul className="navbar-nav">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/patient/search">Find Medicine</NavLink></li>
        {isAuthenticated && (
          <li><NavLink to={getDashboardPath()}>Dashboard</NavLink></li>
        )}
      </ul>

      {/* Actions */}
      <div className="navbar-actions">
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
              👋 {user?.name}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="overlay active"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
