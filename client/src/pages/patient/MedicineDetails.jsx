import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import PharmacyMap from '../../components/PharmacyMap';
import medicineService from '../../services/medicineService';
import reservationService from '../../services/reservationService';
import { calculateDistance, formatDistance } from '../../utils/distance';

const MedicineDetails = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Patient location state
  const [patientLocation, setPatientLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Reservation modal state
  const [reserveModal, setReserveModal] = useState(null); // { inventoryId, pharmacyName, medicineName, availableQty, price }
  const [reserveQty, setReserveQty] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState('');
  const [reserveError, setReserveError] = useState('');

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

  // ── Geolocation ──────────────────────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPatientLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow location access in your browser.');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Unable to get your location.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setPatientLocation(null);
    setLocationError('');
  };

  // ── Distance calculation & pharmacy sorting ──────────────────────────────────
  const pharmaciesWithDistance = pharmacies.map((item) => {
    const p = item.pharmacy || {};
    let distance = null;
    if (
      patientLocation &&
      p.location?.latitude != null &&
      p.location?.longitude != null
    ) {
      distance = calculateDistance(
        patientLocation.lat,
        patientLocation.lng,
        p.location.latitude,
        p.location.longitude
      );
    }
    return { ...item, distance };
  });

  // Sort by distance if patient location is available
  const sortedPharmacies = patientLocation
    ? [...pharmaciesWithDistance].sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      })
    : pharmaciesWithDistance;

  // Extract pharmacy objects for the map
  const mapPharmacies = sortedPharmacies
    .map((item) => item.pharmacy)
    .filter(Boolean);

  // ── Reservation modal ────────────────────────────────────────────────────────
  const openReserveModal = (item) => {
    const p = item.pharmacy || {};
    setReserveModal({
      inventoryId: item.inventoryId,
      pharmacyName: p.pharmacyName,
      medicineName: medicine?.name,
      availableQty: item.availableQuantity,
      price: item.price,
    });
    setReserveQty(1);
    setReserveError('');
    setReserveSuccess('');
  };

  const closeReserveModal = () => {
    setReserveModal(null);
    setReserveQty(1);
    setReserveError('');
  };

  const handleReserve = async () => {
    if (!reserveModal) return;
    if (reserveQty < 1) {
      setReserveError('Quantity must be at least 1');
      return;
    }
    if (reserveQty > reserveModal.availableQty) {
      setReserveError(`Only ${reserveModal.availableQty} unit(s) available`);
      return;
    }
    setReserving(true);
    setReserveError('');
    try {
      const res = await reservationService.createReservation({
        inventoryId: reserveModal.inventoryId,
        quantity: reserveQty,
      });
      if (res.success) {
        setReserveSuccess('Medicine reserved successfully! Please collect it from the pharmacy.');
        // Refresh availability after successful reservation
        setTimeout(() => {
          closeReserveModal();
          fetchAvailability();
        }, 2500);
      }
    } catch (err) {
      setReserveError(err.message || 'Failed to create reservation');
    } finally {
      setReserving(false);
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
                    <span style={{
                      background: 'var(--primary-50)', color: 'var(--primary-700)',
                      fontSize: '0.85rem', fontWeight: 700, padding: '4px 12px',
                      borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-200)',
                    }}>
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

              {/* Location section */}
              <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                    📍 Find Nearest Pharmacy
                  </span>
                  {!patientLocation ? (
                    <button
                      id="use-my-location-btn"
                      className="btn btn-outline btn-sm"
                      onClick={handleUseMyLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? '📡 Detecting location...' : '📍 Use My Location'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>
                        ✅ Location detected — sorting by nearest
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleClearLocation}
                        style={{ fontSize: '0.78rem' }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                {locationError && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: 'var(--danger)' }}>
                    ⚠️ {locationError}
                  </p>
                )}
              </div>

              {/* Pharmacy Availability List */}
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    🏥 Pharmacies with this Medicine
                    {patientLocation && <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--muted)', marginLeft: '0.5rem' }}>— sorted by distance</span>}
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
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                  {sortedPharmacies.map((item) => {
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
                              <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: '4px 0 0 0' }}>📞 {p.phone}</p>
                            )}
                            {p.openingHours && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>🕐 {p.openingHours}</p>
                            )}
                            {/* Distance badge */}
                            {item.distance !== null && item.distance !== undefined && (
                              <span style={{
                                display: 'inline-block', marginTop: '6px',
                                background: 'var(--primary-50)', color: 'var(--primary-700)',
                                fontSize: '0.78rem', fontWeight: 700,
                                padding: '2px 10px', borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--primary-200)',
                              }}>
                                📏 {formatDistance(item.distance)}
                              </span>
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

                        {/* Action buttons */}
                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => window.location.href = `/patient/pharmacy/${p._id}`}
                          >
                            View Pharmacy Details →
                          </button>
                          <button
                            id={`reserve-btn-${item.inventoryId}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => openReserveModal(item)}
                          >
                            📋 Reserve
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Map section */}
              {pharmacies.length > 0 && (
                <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text)' }}>
                    🗺️ Pharmacy Locations
                  </h3>
                  <PharmacyMap
                    pharmacies={mapPharmacies}
                    patientLocation={patientLocation}
                    height="420px"
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Reservation Modal ──────────────────────────────────────────────────── */}
      {reserveModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeReserveModal(); }}
        >
          <div
            className="card"
            style={{
              width: '100%', maxWidth: '420px',
              padding: '1.75rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                📋 Reserve Medicine
              </h2>
              <button
                onClick={closeReserveModal}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            {reserveSuccess ? (
              <div style={{
                textAlign: 'center', padding: '1.5rem 0',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                <p style={{ fontWeight: 700, color: 'var(--success-dark)', fontSize: '1rem' }}>
                  {reserveSuccess}
                </p>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 'var(--space-4)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Medicine</span>
                      <span style={{ fontWeight: 700 }}>{reserveModal.medicineName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Pharmacy</span>
                      <span style={{ fontWeight: 600 }}>{reserveModal.pharmacyName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Available</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>{reserveModal.availableQty} units</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Price per unit</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{reserveModal.price}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Quantity</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setReserveQty((q) => Math.max(1, q - 1))}
                      disabled={reserveQty <= 1}
                      style={{ width: '36px', padding: '0' }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="form-input"
                      style={{ textAlign: 'center', width: '80px' }}
                      value={reserveQty}
                      min={1}
                      max={reserveModal.availableQty}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v >= 1 && v <= reserveModal.availableQty) setReserveQty(v);
                      }}
                    />
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setReserveQty((q) => Math.min(reserveModal.availableQty, q + 1))}
                      disabled={reserveQty >= reserveModal.availableQty}
                      style={{ width: '36px', padding: '0' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--space-3)', background: 'var(--primary-50)',
                  borderRadius: 'var(--radius)', marginBottom: '1rem',
                  border: '1px solid var(--primary-200)',
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>Total</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{(reserveQty * reserveModal.price).toFixed(2)}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center' }}>
                  🏥 For pharmacy pickup only. No online payment required.
                </p>

                {reserveError && (
                  <div className="error-message" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <span>⚠️</span> {reserveError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={closeReserveModal}
                    disabled={reserving}
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-reserve-btn"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={handleReserve}
                    disabled={reserving}
                  >
                    {reserving ? 'Reserving...' : '✅ Confirm Reservation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDetails;
