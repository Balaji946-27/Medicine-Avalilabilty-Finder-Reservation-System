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
    { to: '/patient/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/patient/search',    icon: '🔍', label: 'Find Medicine' },
    { to: '/patient/profile',   icon: '👤', label: 'My Profile' },
  ];

  const pharmacyLinks = [
    { to: '/pharmacy/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/pharmacy/profile',   icon: '🏥', label: 'Pharmacy Profile' },
    { to: '/pharmacy/inventory', icon: '📦', label: 'Inventory' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users',     icon: '👥', label: 'Users' },
    { to: '/admin/pharmacies',icon: '🏥', label: 'Pharmacies' },
    { to: '/admin/medicines', icon: '💊', label: 'Medicines' },
  ];

  const links =
    role === 'admin' ? adminLinks :
    role === 'pharmacy' ? pharmacyLinks :
    patientLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div className="overlay active" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <p className="sidebar-section-title">Navigation</p>

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
                  onClick={onClose}
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
            <button className="sidebar-logout" onClick={handleLogout}>
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
