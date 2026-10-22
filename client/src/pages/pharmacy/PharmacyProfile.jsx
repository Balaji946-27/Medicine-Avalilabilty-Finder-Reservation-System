import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import pharmacyService from '../../services/pharmacyService';

const PharmacyProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    pharmacyName: '',
    address: '',
    city: '',
    phone: '',
    openingHours: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await pharmacyService.getProfile();
      if (res.success && res.data) {
        setHasProfile(true);
        setFormData({
          pharmacyName: res.data.pharmacyName || '',
          address: res.data.address || '',
          city: res.data.city || '',
          phone: res.data.phone || '',
          openingHours: res.data.openingHours || '',
          latitude: res.data.location?.latitude ?? '',
          longitude: res.data.location?.longitude ?? '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSavedMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');
    setErrorMessage('');

    const payload = {
      pharmacyName: formData.pharmacyName,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
      openingHours: formData.openingHours,
      location: {
        latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
      },
    };

    try {
      let res;
      if (hasProfile) {
        res = await pharmacyService.updateProfile(payload);
      } else {
        res = await pharmacyService.createProfile(payload);
        setHasProfile(true);
      }

      if (res.success) {
        setSavedMessage('Pharmacy profile saved successfully!');
        setTimeout(() => setSavedMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save pharmacy profile');
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
          Pharmacy Profile
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="pharmacy" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Pharmacy Profile</h1>
              <p className="page-subtitle">Set up your pharmacy details so patients can find your medicine availability.</p>
            </div>
          </div>

          <div style={{ maxWidth: 620 }}>
            {savedMessage && (
              <div
                style={{
                  background: 'var(--success-light)', border: '1px solid rgba(22,163,74,0.25)',
                  borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
                  color: 'var(--success-dark)', fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                }}
              >
                ✅ {savedMessage}
              </div>
            )}

            {errorMessage && (
              <div
                style={{
                  background: 'var(--danger-light)', border: '1px solid rgba(220,38,38,0.25)',
                  borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
                  color: 'var(--danger-dark)', fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

            {loading ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <span className="spinner" /> Loading profile details...
              </div>
            ) : (
              <div className="card">
                <form onSubmit={handleSubmit} id="pharmacy-profile-form">
                  {/* Basic Info */}
                  <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-5)', color: 'var(--text)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
                    🏥 Basic Information
                  </h3>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pharmacy-name">
                      Pharmacy Name <span className="required">*</span>
                    </label>
                    <input
                      id="pharmacy-name"
                      type="text"
                      name="pharmacyName"
                      className="form-input"
                      placeholder="e.g. City Health Pharmacy"
                      value={formData.pharmacyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="pharmacy-city">
                        City <span className="required">*</span>
                      </label>
                      <input
                        id="pharmacy-city"
                        type="text"
                        name="city"
                        className="form-input"
                        placeholder="e.g. Chennai"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="pharmacy-phone">Phone</label>
                      <input
                        id="pharmacy-phone"
                        type="tel"
                        name="phone"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pharmacy-address">
                      Full Address <span className="required">*</span>
                    </label>
                    <textarea
                      id="pharmacy-address"
                      name="address"
                      className="form-textarea"
                      placeholder="Street number, street name, area"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pharmacy-hours">Opening Hours</label>
                    <input
                      id="pharmacy-hours"
                      type="text"
                      name="openingHours"
                      className="form-input"
                      placeholder="e.g. Mon-Sat: 8:00 AM - 9:00 PM"
                      value={formData.openingHours}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Location */}
                  <h3 style={{ fontSize: '1rem', margin: 'var(--space-6) 0 var(--space-5)', color: 'var(--text)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
                    📍 Location Coordinates
                  </h3>

                  <div
                    style={{
                      background: 'var(--info-light)', border: '1px solid rgba(37,99,235,0.2)',
                      borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
                      fontSize: '0.85rem', color: 'var(--info)',
                    }}
                  >
                    ℹ️ Coordinates will be used for location-based search in future reviews. You can store latitude & longitude here.
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="pharmacy-lat">Latitude</label>
                      <input
                        id="pharmacy-lat"
                        type="number"
                        name="latitude"
                        className="form-input"
                        placeholder="e.g. 13.0827"
                        value={formData.latitude}
                        onChange={handleChange}
                        step="any"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="pharmacy-lng">Longitude</label>
                      <input
                        id="pharmacy-lng"
                        type="number"
                        name="longitude"
                        className="form-input"
                        placeholder="e.g. 80.2707"
                        value={formData.longitude}
                        onChange={handleChange}
                        step="any"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full btn-lg"
                    disabled={saving}
                    id="save-pharmacy-profile-btn"
                  >
                    {saving ? 'Saving Profile...' : '💾 Save Profile'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PharmacyProfile;
