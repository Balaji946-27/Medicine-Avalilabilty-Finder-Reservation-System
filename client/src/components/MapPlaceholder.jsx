// MapPlaceholder — shows a visual representation of the upcoming map integration.
// Architecture is ready for Leaflet/OpenStreetMap to replace this in Prompt 2.

const MapPlaceholder = ({ height = '400px', message }) => {
  return (
    <div className="map-placeholder" style={{ minHeight: height }}>
      {/* Decorative grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,171,151,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,171,151,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          borderRadius: 'inherit',
        }}
      />

      <div className="map-placeholder-icon" style={{ position: 'relative' }}>🗺️</div>

      <div style={{ position: 'relative' }}>
        <p className="map-placeholder-title">
          {message || 'Interactive Pharmacy Map'}
        </p>
        <p className="map-placeholder-desc">
          Map integration with OpenStreetMap & Leaflet is coming in the next phase.
          You'll be able to see nearby pharmacies plotted on a live map.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          position: 'relative',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {['📍 Pharmacy A', '📍 Pharmacy B', '📍 Pharmacy C'].map((pin) => (
          <span
            key={pin}
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--primary-200)',
              color: 'var(--primary-700)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            {pin}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MapPlaceholder;
