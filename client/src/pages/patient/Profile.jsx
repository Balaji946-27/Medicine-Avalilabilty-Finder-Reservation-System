import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        const u = res.data;
        setFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Full name is required');
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await authService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      if (res.success && res.data) {
        setSuccessMessage('Profile updated successfully!');
        updateUser(res.data);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button
          className="hamburger"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          Medi<span style={{ color: 'var(--primary)' }}>Find</span>
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">View and update your personal account information.</p>
            </div>
          </div>

          <div style={{ maxWidth: 580 }}>
            {/* Feedback Banners */}
            {successMessage && (
              <div
                style={{
                  background: 'var(--success-light)',
                  border: '1px solid rgba(22, 163, 74, 0.3)',
                  color: 'var(--success-dark)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 'var(--space-6)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>✅</span> {successMessage}
              </div>
            )}

            {errorMessage && (
              <div
                style={{
                  background: 'var(--danger-light)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: 'var(--danger-dark)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 'var(--space-6)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            <div className="card">
              {/* Avatar & Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  🙋
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)', margin: '0 0 4px 0' }}>
                    {formData.name || user?.name || 'Patient Account'}
                  </p>
                  <span
                    style={{
                      background: 'var(--primary-50)',
                      color: 'var(--primary-700)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Patient Role
                  </span>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--muted)' }}>
                  <span className="spinner" /> Loading profile details...
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="patient-profile-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="patient-name">
                      Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id="patient-name"
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="patient-email">
                      Email Address (Account Identifier)
                    </label>
                    <input
                      id="patient-email"
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      disabled
                      style={{ background: 'var(--surface-2)', cursor: 'not-allowed', color: 'var(--muted)' }}
                    />
                    <small style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      Primary email is linked to your login account and cannot be modified directly.
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="patient-phone">
                      Contact Phone Number
                    </label>
                    <input
                      id="patient-phone"
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="patient-address">
                      Address / Preferred Area
                    </label>
                    <textarea
                      id="patient-address"
                      name="address"
                      className="form-input"
                      placeholder="Enter your street, landmark or city"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      id="save-profile-btn"
                      disabled={saving}
                    >
                      {saving ? 'Saving changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
