import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sidebar is shared across dashboard layouts.
// The `role` prop determines which links to show.
const Sidebar = ({ role = 'patient', isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/patient/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/patient/search',        icon: '🔍', label: 'Find Medicine' },
    { to: '/patient/reservations',  icon: '📋', label: 'My Reservations' },
    { to: '/patient/profile',       icon: '👤', label: 'My Profile' },
  ];

  const pharmacyLinks = [
    { to: '/pharmacy/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/pharmacy/profile',       icon: '🏥', label: 'Pharmacy Profile' },
    { to: '/pharmacy/inventory',     icon: '📦', label: 'Inventory' },
    { to: '/pharmacy/reservations',  icon: '📋', label: 'Reservations' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/admin/users',         icon: '👥', label: 'Users' },
    { to: '/admin/pharmacies',    icon: '🏥', label: 'Pharmacies' },
    { to: '/admin/medicines',     icon: '💊', label: 'Medicines' },
    { to: '/admin/reservations',  icon: '📋', label: 'Reservations' },
  ];

  const links =
    role === 'admin' ? adminLinks :
    role === 'pharmacy' ? pharmacyLinks :
    patientLinks;

  return (
    <>
      {/* Mobile overlay */}
      {onClose && (
        <div
          className={`overlay ${isOpen ? 'active' : ''}`}
          onClick={onClose}
          aria-hidden={!isOpen}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {/* Mobile drawer header with close button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <p className="sidebar-section-title" style={{ margin: 0, padding: 0 }}>
            Navigation
          </p>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
              className="mobile-only"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <ul className="sidebar-nav">
          {links.map((link, i) =>
            link.comingSoon ? (
              <li key={i}>
                <button disabled style={{ opacity: 0.55, cursor: 'default' }}>
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                  <span className="sidebar-coming-soon">Soon</span>
                </button>
              </li>
            ) : (
              <li key={i}>
                <NavLink
                  to={link.to}
                  onClick={() => {
                    if (onClose) {
                      onClose();
                    }
                  }}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </NavLink>
              </li>
            )
          )}
        </ul>

        {/* Logout at bottom */}
        <ul className="sidebar-nav">
          <li>
            <button
              className="sidebar-logout"
              onClick={() => {
                if (onClose) {
                  onClose();
                }
                handleLogout();
              }}
            >
              <span className="nav-icon">🚪</span>
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
