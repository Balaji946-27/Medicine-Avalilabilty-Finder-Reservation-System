const PharmacyCard = ({
  pharmacy = {},
  medicineCount,
  onViewInventory,
}) => {
  const {
    pharmacyName = 'Pharmacy Name',
    address,
    city,
    phone,
    openingHours,
    isVerified,
  } = pharmacy;

  return (
    <div className="pharmacy-card">
      <div className="pharmacy-card-header">
        <div className="pharmacy-icon">🏥</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p className="pharmacy-name">{pharmacyName}</p>
            {isVerified && (
              <span
                title="Verified Pharmacy"
                style={{ color: 'var(--primary)', fontSize: '0.9rem' }}
              >
                ✓
              </span>
            )}
          </div>
          <p className="pharmacy-city">{city || 'City'}</p>
        </div>
      </div>

      <div className="pharmacy-details">
        {address && (
          <div className="pharmacy-detail-row">
            <span>📍</span>
            <span>{address}{city ? `, ${city}` : ''}</span>
          </div>
        )}
        {phone && (
          <div className="pharmacy-detail-row">
            <span>📞</span>
            <span>{phone}</span>
          </div>
        )}
        {openingHours && (
          <div className="pharmacy-detail-row">
            <span>🕐</span>
            <span>{openingHours}</span>
          </div>
        )}
        {medicineCount !== undefined && (
          <div className="pharmacy-detail-row">
            <span>💊</span>
            <span><strong>{medicineCount}</strong> medicines available</span>
          </div>
        )}
      </div>

      {onViewInventory && (
        <button
          className="btn btn-outline btn-sm w-full"
          onClick={onViewInventory}
          style={{ marginTop: 'var(--space-4)' }}
        >
          View Inventory
        </button>
      )}
    </div>
  );
};

export default PharmacyCard;
