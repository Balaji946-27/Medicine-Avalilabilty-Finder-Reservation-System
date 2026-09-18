import { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="hamburger" style={{ display: 'flex' }} onClick={() => setSidebarOpen(true)}>☰</button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          My Profile
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your account details</p>
            </div>
          </div>

          <div style={{ maxWidth: 540 }}>
            <div className="card">
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
                <div
                  style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '1.8rem', fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  🙋
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                    Patient Account
                  </p>
                  <span
                    style={{
                      background: 'var(--primary-50)', color: 'var(--primary-700)',
                      fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Patient
                  </span>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert('Profile update — Phase 2'); }} id="patient-profile-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="patient-name">Full Name</label>
                  <input
                    id="patient-name"
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patient-email">Email Address</label>
                  <input
                    id="patient-email"
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div
                  style={{
                    background: 'var(--warning-light)', border: '1px solid rgba(217, 119, 6, 0.2)',
                    borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
                    fontSize: '0.875rem', color: 'var(--warning-dark)',
                  }}
                >
                  ℹ️ Profile editing will be fully functional in Phase 2.
                </div>

                <button type="submit" className="btn btn-primary w-full" id="save-profile-btn">
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
