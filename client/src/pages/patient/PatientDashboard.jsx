import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Mobile header */}
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button
          className="hamburger"
          style={{ display: 'flex' }}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          Medi<span style={{ color: 'var(--primary)' }}>Find</span>
        </span>
      </header>

      <div className="page-layout">
        <Sidebar
          role="patient"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Welcome, {user?.name || 'Patient'}! 👋</h1>
              <p className="page-subtitle">Find medicine availability and pricing across participating local pharmacies.</p>
            </div>
            <Link to="/patient/search" className="btn btn-primary">
              🔍 Search Medicine
            </Link>
          </div>

          {/* Search CTA Banner */}
          <div
            className="card mb-8"
            style={{
              background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
              border: '1px solid var(--primary-200)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2.5rem' }}>🔍</span>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Find medicines at participating pharmacies
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  Search for prescription & OTC medicines to see live stock quantities, prices, and pharmacy details.
                </p>
              </div>
              <Link to="/patient/search" className="btn btn-primary">
                Search Medicines Now →
              </Link>
            </div>
          </div>

          {/* Account Overview Card */}
          <div className="card mb-8">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              👤 Patient Account Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</span>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0.25rem 0 0 0' }}>{user?.name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</span>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0.25rem 0 0 0' }}>{user?.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role</span>
                <p style={{ fontWeight: 600, color: 'var(--primary)', margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>
                  {user?.role}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account Created</span>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0.25rem 0 0 0' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/patient/search" className="btn btn-primary">
                🔍 Find Medicine & Pharmacies
              </Link>
              <Link to="/patient/profile" className="btn btn-outline">
                👤 Update Profile
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
