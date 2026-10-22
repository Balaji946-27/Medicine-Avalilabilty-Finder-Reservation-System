import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import reservationService from '../../services/reservationService';

const PharmacyReservations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationService.getPharmacyReservations();
      if (res.success) {
        setReservations(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const handleAction = async (id, action) => {
    setActionLoadingId(id + '_' + action);
    try {
      let res;
      if (action === 'confirm')   res = await reservationService.confirmReservation(id);
      if (action === 'reject')    res = await reservationService.rejectReservation(id);
      if (action === 'complete')  res = await reservationService.completeReservation(id);

      if (res?.success) {
        showSuccess(`Reservation ${action}ed successfully.`);
        // Update status locally
        setReservations((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: res.data?.status || action } : r
          )
        );
      }
    } catch (err) {
      showError(err.message || `Failed to ${action} reservation`);
    } finally {
      setActionLoadingId(null);
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
        <Sidebar role="pharmacy" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Incoming Reservations</h1>
              <p className="page-subtitle">
                Review and manage patient medicine reservation requests for your pharmacy.
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchReservations}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

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

          {/* Filter chips */}
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
              <span className="spinner" /> Loading reservations...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title={filterStatus ? `No ${filterStatus} reservations` : 'No reservations yet'}
              description={
                filterStatus
                  ? 'Try a different filter.'
                  : 'When patients reserve medicines from your pharmacy, they will appear here.'
              }
            />
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filtered.map((res) => {
                const med = res.medicine || {};
                const pat = res.patient || {};
                const total = (res.quantity * res.priceAtReservation).toFixed(2);
                const isPending = res.status === 'pending';
                const isConfirmed = res.status === 'confirmed';
                const busyConfirm  = actionLoadingId === res._id + '_confirm';
                const busyReject   = actionLoadingId === res._id + '_reject';
                const busyComplete = actionLoadingId === res._id + '_complete';

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
                      {/* Medicine & patient info */}
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>💊</span>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                            {med.name || 'Medicine'}
                          </h3>
                          {med.genericName && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                              ({med.genericName})
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text)' }}>
                          👤 Patient: <strong>{pat.name || 'Patient'}</strong>
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          Requested: {new Date(res.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Status, qty, price */}
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <StatusBadge status={res.status} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          Qty: <strong style={{ color: 'var(--text)' }}>{res.quantity}</strong>
                          {' '} × ₹{res.priceAtReservation}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{total}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {(isPending || isConfirmed) && (
                      <div style={{
                        marginTop: '1rem', paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap',
                      }}>
                        {isPending && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(res._id, 'confirm')}
                              disabled={busyConfirm}
                            >
                              {busyConfirm ? 'Confirming...' : '✅ Confirm'}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                              onClick={() => handleAction(res._id, 'reject')}
                              disabled={busyReject}
                            >
                              {busyReject ? 'Rejecting...' : '✕ Reject'}
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: 'var(--success)' }}
                              onClick={() => handleAction(res._id, 'complete')}
                              disabled={busyComplete}
                            >
                              {busyComplete ? 'Completing...' : '🏁 Mark Completed'}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                              onClick={() => handleAction(res._id, 'reject')}
                              disabled={busyReject}
                            >
                              {busyReject ? 'Rejecting...' : '✕ Reject'}
                            </button>
                          </>
                        )}
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

export default PharmacyReservations;
