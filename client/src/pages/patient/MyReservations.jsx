import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import reservationService from '../../services/reservationService';

const MyReservations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationService.getMyReservations();
      if (res.success) {
        setReservations(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setCancellingId(id);
    try {
      const res = await reservationService.cancelReservation(id);
      if (res.success) {
        setSuccessMsg('Reservation cancelled successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        // Update locally without full refetch
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: 'cancelled' } : r))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel reservation');
      setTimeout(() => setError(''), 4000);
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = filterStatus
    ? reservations.filter((r) => r.status === filterStatus)
    : reservations;

  const statusCounts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const statusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'var(--success)';
      case 'pending':   return 'var(--warning)';
      case 'rejected':
      case 'cancelled': return 'var(--danger)';
      case 'completed': return 'var(--primary)';
      default:          return 'var(--muted)';
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
              <h1 className="page-title">My Reservations</h1>
              <p className="page-subtitle">
                Track the status of your medicine reservations. Pick up at the pharmacy.
              </p>
            </div>
            <Link to="/patient/search" className="btn btn-primary">
              🔍 Find Medicine
            </Link>
          </div>

          {/* Success / Error messages */}
          {successMsg && (
            <div style={{
              background: 'var(--success-light)', border: '1px solid rgba(22,163,74,0.25)',
              borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)',
              color: 'var(--success-dark)', fontWeight: 600, fontSize: '0.875rem',
            }}>
              ✅ {successMsg}
            </div>
          )}
          {error && (
            <div className="error-message mb-6">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Summary chips */}
          {!loading && reservations.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setFilterStatus('')}
                style={{
                  padding: '4px 14px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: filterStatus === '' ? 'var(--primary)' : 'var(--surface-2)',
                  color: filterStatus === '' ? '#fff' : 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                All ({reservations.length})
              </button>
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    background: filterStatus === status ? statusColor(status) : 'var(--surface-2)',
                    color: filterStatus === status ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                    textTransform: 'capitalize',
                  }}
                >
                  {status} ({count})
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="spinner" /> Loading your reservations...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title={filterStatus ? `No ${filterStatus} reservations` : 'No reservations yet'}
              description={
                filterStatus
                  ? 'Try a different filter.'
                  : 'Search for a medicine and reserve it at a nearby pharmacy.'
              }
              action={
                !filterStatus && (
                  <Link to="/patient/search" className="btn btn-primary btn-sm">
                    Find Medicine
                  </Link>
                )
              }
            />
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filtered.map((res) => {
                const med = res.medicine || {};
                const ph = res.pharmacy || {};
                const total = (res.quantity * res.priceAtReservation).toFixed(2);
                const canCancel = ['pending', 'confirmed'].includes(res.status);

                return (
                  <div
                    key={res._id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      borderLeft: `4px solid ${statusColor(res.status)}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      {/* Left — Medicine & pharmacy info */}
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>💊</span>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                            {med.name || 'Medicine'}
                          </h3>
                        </div>
                        {med.genericName && (
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                            Generic: {med.genericName}
                          </p>
                        )}
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text)' }}>
                          🏥 <strong>{ph.pharmacyName}</strong>
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          📍 {ph.address}{ph.city ? `, ${ph.city}` : ''}
                        </p>
                        {ph.phone && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                            📞 {ph.phone}
                          </p>
                        )}
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                          Reserved on {new Date(res.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Right — Status, quantity, price */}
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <StatusBadge status={res.status} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                          Qty: <strong style={{ color: 'var(--text)' }}>{res.quantity}</strong>
                          {' '} × ₹{res.priceAtReservation}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{total}
                        </div>
                        {res.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                            Note: {res.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cancel button row */}
                    {canCancel && (
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => handleCancel(res._id)}
                          disabled={cancellingId === res._id}
                        >
                          {cancellingId === res._id ? 'Cancelling...' : '✕ Cancel Reservation'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyReservations;
