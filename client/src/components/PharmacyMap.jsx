import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon paths broken by Vite/webpack bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * PharmacyMap — Renders a Leaflet/OpenStreetMap with pharmacy markers.
 *
 * Props:
 *  - pharmacies: Array of pharmacy objects with { _id, pharmacyName, address, city, location: { latitude, longitude } }
 *  - patientLocation: { lat, lng } | null
 *  - height: CSS height string (default '400px')
 */
const PharmacyMap = ({ pharmacies = [], patientLocation = null, height = '400px' }) => {
  // Filter to only pharmacies that have valid coordinates
  const mapped = pharmacies.filter(
    (p) =>
      p.location &&
      p.location.latitude != null &&
      p.location.longitude != null &&
      !isNaN(p.location.latitude) &&
      !isNaN(p.location.longitude)
  );

  if (mapped.length === 0 && !patientLocation) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          fontSize: '0.9rem',
          gap: '0.5rem',
          flexDirection: 'column',
        }}
      >
        <span style={{ fontSize: '2rem' }}>🗺️</span>
        <span>No pharmacy coordinates available to display on map.</span>
        <span style={{ fontSize: '0.8rem' }}>
          Pharmacies must set their latitude and longitude in their profile.
        </span>
      </div>
    );
  }

  // Calculate map center: average of all mapped pharmacies, or patient location, or default India center
  let centerLat = 20.5937;
  let centerLng = 78.9629;
  let zoom = 5;

  if (mapped.length > 0) {
    centerLat = mapped.reduce((sum, p) => sum + p.location.latitude, 0) / mapped.length;
    centerLng = mapped.reduce((sum, p) => sum + p.location.longitude, 0) / mapped.length;
    zoom = mapped.length === 1 ? 14 : 11;
  }

  if (patientLocation) {
    centerLat = patientLocation.lat;
    centerLng = patientLocation.lng;
    zoom = 12;
  }

  // Custom marker icons
  const pharmacyIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const patientIcon = new L.DivIcon({
    html: '<div style="background:#2563eb;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',
  });

  return (
    <div
      style={{
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Patient location marker */}
        {patientLocation && (
          <Marker
            position={[patientLocation.lat, patientLocation.lng]}
            icon={patientIcon}
          >
            <Popup>
              <strong>📍 Your Location</strong>
            </Popup>
          </Marker>
        )}

        {/* Pharmacy markers */}
        {mapped.map((pharmacy) => (
          <Marker
            key={pharmacy._id}
            position={[pharmacy.location.latitude, pharmacy.location.longitude]}
            icon={pharmacyIcon}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <strong>🏥 {pharmacy.pharmacyName}</strong>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  📍 {pharmacy.address}
                  {pharmacy.city ? `, ${pharmacy.city}` : ''}
                </span>
                {pharmacy.phone && (
                  <>
                    <br />
                    <span style={{ fontSize: '0.8rem' }}>📞 {pharmacy.phone}</span>
                  </>
                )}
                {pharmacy.openingHours && (
                  <>
                    <br />
                    <span style={{ fontSize: '0.8rem' }}>🕐 {pharmacy.openingHours}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PharmacyMap;
