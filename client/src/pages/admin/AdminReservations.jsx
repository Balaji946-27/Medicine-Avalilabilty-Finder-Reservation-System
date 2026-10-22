import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import adminService from '../../services/adminService';

// Status badge colors matching the existing StatusBadge pattern
const STATUS_STYLES = {
  pending:   { bg: 'var(--warning-light)',  color: 'var(--warning-dark)',  label: 'Pending' },
  confirmed: { bg: 'var(--primary-light)',  color: 'var(--primary-dark)',  label: 'Confirmed' },
  rejected:  { bg: 'var(--danger-light)',   color: 'var(--danger-dark)',   label: 'Rejected' },
  cancelled: { bg: 'var(--danger-light)',   color: 'var(--danger-dark)',   label: 'Cancelled' },
  completed: { bg: 'var(--success-light)',  color: 'var(--success-dark)',  label: 'Completed' },
  expired:   { bg: 'rgba(120,120,120,0.15)', color: 'var(--muted)',        label: 'Expired' },
};

const AdminReservations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReservations();
      if (res.success) {
        setReservations(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filter);

  // Count by status for summary row
  const counts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled', 'expired'];

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
          Admin — Reservation Monitoring
        </span>
      </header>

      <div className="page-layout">
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Reservations</h1>
              <p className="page-subtitle">
                Read-only view of all reservations across the platform ({reservations.length} total).
              </p>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', color: 'var(--danger-dark)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Status Summary Cards */}
          {!loading && reservations.length > 0 && (
            <div className="dashboard-cards mb-8">
              {['pending', 'confirmed', 'completed', 'rejected'].map((s) => (
                <div key={s} className="card" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'capitalize', marginBottom: 4 }}>{s}</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                    {counts[s] || 0}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                style={{ textTransform: 'capitalize' }}
              >
                {f === 'all' ? `All (${reservations.length})` : `${f} (${counts[f] || 0})`}
              </button>
            ))}
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <span className="spinner" /> Loading reservations...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No reservations found{filter !== 'all' ? ` with status "${filter}"` : ''}.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Medicine</th>
                    <th>Pharmacy</th>
                    <th>Qty</th>
                    <th>Price (₹)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                    return (
                      <tr key={r._id}>
                        <td>
                          <span style={{ fontWeight: 600 }}>{r.patient?.name || 'N/A'}</span>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.patient?.email || ''}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{r.medicine?.name || 'N/A'}</span>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.medicine?.category || ''}</span>
                        </td>
                        <td>
                          {r.pharmacy?.pharmacyName || 'N/A'}
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.pharmacy?.city || ''}</span>
                        </td>
                        <td>{r.quantity}</td>
                        <td>₹{r.priceAtReservation?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: st.bg,
                              color: st.color,
                              textTransform: 'capitalize',
                            }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReservations;
