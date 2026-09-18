import StatusBadge from './StatusBadge';

const MedicineCard = ({
  medicine = {},
  pharmacyName,
  pharmacyAddress,
  quantity,
  price,
  onViewDetails,
}) => {
  const {
    name = 'Medicine Name',
    genericName,
    manufacturer,
    category,
  } = medicine;

  // Determine availability status
  const getStatus = (qty) => {
    if (qty === undefined || qty === null) return 'available';
    if (qty <= 0) return 'unavailable';
    if (qty <= 10) return 'low';
    return 'available';
  };

  const status = getStatus(quantity);

  return (
    <div className="medicine-card">
      <div className="medicine-card-header">
        <div>
          <p className="medicine-name">{name}</p>
          {genericName && (
            <p className="medicine-generic">Generic: {genericName}</p>
          )}
          {manufacturer && (
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
              Mfg: {manufacturer}
            </p>
          )}
        </div>
        {quantity !== undefined && <StatusBadge status={status} />}
      </div>

      {category && (
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 600,
            background: 'var(--secondary-50)',
            color: 'var(--secondary-700)',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            marginTop: '4px',
          }}
        >
          {category}
        </span>
      )}

      {pharmacyName && (
        <div className="medicine-meta" style={{ marginTop: '0.5rem' }}>
          <span>🏥 <strong>{pharmacyName}</strong></span>
          {pharmacyAddress && <span>📍 {pharmacyAddress}</span>}
          {quantity !== undefined && <span>📦 Available: <strong>{quantity} units</strong></span>}
        </div>
      )}

      {price !== undefined && (
        <div style={{ marginTop: '0.5rem' }}>
          <span className="medicine-price">₹{price}</span>
        </div>
      )}

      <div className="medicine-card-actions" style={{ marginTop: '0.75rem' }}>
        <button
          className="btn btn-primary btn-sm w-full"
          onClick={onViewDetails}
        >
          🏥 View Availability in Pharmacies
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;
