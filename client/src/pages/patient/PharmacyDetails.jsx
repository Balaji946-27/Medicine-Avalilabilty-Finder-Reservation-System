import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import pharmacyService from '../../services/pharmacyService';

const PharmacyDetails = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPharmacyDetails();
  }, [id]);

  const fetchPharmacyDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pharmacyService.getPharmacyMedicines(id);
      if (res.success) {
        setPharmacy(res.pharmacy);
        setMedicines(res.medicines || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pharmacy details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/patient/search" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              ← Back to Medicine Search
            </Link>
          </div>

          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="spinner" /> Loading pharmacy details & stock list...
            </div>
          ) : error ? (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          ) : (
            <>
              {/* Pharmacy Profile Header */}
              <div className="card mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                        🏥 {pharmacy?.pharmacyName}
                      </h1>
                      {pharmacy?.isVerified && (
                        <span
                          style={{
                            background: 'var(--success-light)', color: 'var(--success-dark)',
                            fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          ✓ Verified Pharmacy
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
                      📍 {pharmacy?.address}{pharmacy?.city ? `, ${pharmacy.city}` : ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {pharmacy?.phone && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact Phone</span>
                      <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>📞 {pharmacy.phone}</p>
                    </div>
                  )}
                  {pharmacy?.openingHours && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Opening Hours</span>
                      <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>🕐 {pharmacy.openingHours}</p>
                    </div>
                  )}
                  {pharmacy?.city && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City Location</span>
                      <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>🏙️ {pharmacy.city}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medicines Available List */}
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    💊 Available Medicines at {pharmacy?.pharmacyName}
                  </h2>
                  <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
                    Currently in stock items reported by this pharmacy.
                  </p>
                </div>
              </div>

              {medicines.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="No In-Stock Medicines Found"
                  description="This pharmacy currently has no available stock cataloged."
                />
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Medicine Name</th>
                        <th>Generic Name</th>
                        <th>Category</th>
                        <th>Available Qty</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((item) => {
                        const m = item.medicine || {};
                        const status = item.availableQuantity <= 10 ? 'low' : 'available';

                        return (
                          <tr key={item.inventoryId}>
                            <td style={{ fontWeight: 700, color: 'var(--text)' }}>
                              {m.name || 'Medicine'}
                            </td>
                            <td>{m.genericName || 'N/A'}</td>
                            <td>
                              <span
                                style={{
                                  background: 'var(--secondary-50)', color: 'var(--secondary-700)',
                                  fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                }}
                              >
                                {m.category || 'General'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                              {item.availableQuantity} units
                            </td>
                            <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                              ₹{item.price}
                            </td>
                            <td>
                              <StatusBadge status={status} />
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                              {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PharmacyDetails;
