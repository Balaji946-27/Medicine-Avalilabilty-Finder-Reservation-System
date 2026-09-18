import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import medicineService from '../../services/medicineService';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, [id]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await medicineService.getMedicineAvailability(id);
      if (res.success) {
        setMedicine(res.medicine);
        setPharmacies(res.pharmacies || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch medicine availability');
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
              <span className="spinner" /> Checking pharmacy stock availability...
            </div>
          ) : error ? (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          ) : (
            <>
              {/* Medicine Overview Header */}
              <div className="card mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                      💊 {medicine?.name}
                    </h1>
                    {medicine?.genericName && (
                      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                        Generic Name: <strong>{medicine.genericName}</strong>
                      </p>
                    )}
                  </div>
                  {medicine?.category && (
                    <span
                      style={{
                        background: 'var(--primary-50)', color: 'var(--primary-700)',
                        fontSize: '0.85rem', fontWeight: 700, padding: '4px 12px',
                        borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-200)',
                      }}
                    >
                      {medicine.category}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {medicine?.manufacturer && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manufacturer</span>
                      <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>{medicine.manufacturer}</p>
                    </div>
                  )}
                  {medicine?.description && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description / Indications</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>{medicine.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pharmacy Availability List */}
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    🏥 Pharmacies with this Medicine
                  </h2>
                  <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
                    Real-time availability reported by participating pharmacies.
                  </p>
                </div>
              </div>

              {pharmacies.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="Not Currently Available"
                  description="This medicine is currently not available at participating pharmacies."
                  action={
                    <Link to="/patient/search" className="btn btn-outline btn-sm">
                      Search Other Medicines
                    </Link>
                  }
                />
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {pharmacies.map((item) => {
                    const p = item.pharmacy || {};
                    const availStatus = item.availableQuantity <= 10 ? 'low' : 'available';

                    return (
                      <div key={item.inventoryId} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                                🏥 {p.pharmacyName}
                              </h3>
                              {p.isVerified && (
                                <span title="Verified Pharmacy" style={{ color: 'var(--primary)', fontWeight: 800 }}>✓ Verified</span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                              📍 {p.address}{p.city ? `, ${p.city}` : ''}
                            </p>
                            {p.phone && (
                              <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: '4px 0 0 0' }}>
                                📞 {p.phone}
                              </p>
                            )}
                            {p.openingHours && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                                🕐 {p.openingHours}
                              </p>
                            )}
                          </div>

                          {/* Availability badge & Pricing */}
                          <div style={{ textAlign: 'right', minWidth: '160px' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <StatusBadge status={availStatus} />
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                              ₹{item.price}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                              Available: <span style={{ color: 'var(--success)' }}>{item.availableQuantity} units</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                              Updated: {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/patient/pharmacy/${p._id}`)}
                          >
                            View Pharmacy Details & Stock →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MedicineDetails;
