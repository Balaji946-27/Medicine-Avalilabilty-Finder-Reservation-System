import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import adminService from '../../services/adminService';

const AdminPharmacies = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPharmacies();
      if (res.success) {
        setPharmacies(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (pharmacy) => {
    try {
      const res = await adminService.toggleVerifyPharmacy(pharmacy._id);
      if (res.success) {
        setSuccess(`Pharmacy status updated to ${res.data.isVerified ? 'Verified' : 'Unverified'}`);
        setTimeout(() => setSuccess(''), 3000);
        fetchPharmacies();
      }
    } catch (err) {
      setError(err.message || 'Failed to update pharmacy verification');
    }
  };

  return (
    <div>
      <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="hamburger" style={{ display: 'flex' }} onClick={() => setSidebarOpen(true)}>☰</button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
          Admin — Pharmacy Management
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Pharmacies</h1>
              <p className="page-subtitle">View pharmacy profiles and manage verification status.</p>
            </div>
          </div>

          {success && (
            <div style={{ background: 'var(--success-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', color: 'var(--success-dark)' }}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--danger-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', color: 'var(--danger-dark)' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner" /> Loading pharmacies...</div>
            ) : pharmacies.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pharmacy profiles registered yet.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Pharmacy Name</th>
                    <th>Owner</th>
                    <th>City</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacies.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600 }}>{p.pharmacyName}</td>
                      <td>{p.ownerId?.name || 'Owner N/A'}</td>
                      <td>{p.city}</td>
                      <td>{p.phone || 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: p.isVerified ? 'var(--success-light)' : 'var(--warning-light)',
                            color: p.isVerified ? 'var(--success-dark)' : 'var(--warning-dark)',
                          }}
                        >
                          {p.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleToggleVerify(p)}
                        >
                          {p.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPharmacies;
