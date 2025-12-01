import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDriverLocations } from '../lib/supabase/useDriverLocations'; // عدّل المسار حسب مشروعك

// simple icons (استخدم صورك في /public أو استخدم افتراضي)
const driverIcon = new L.Icon({
  iconUrl: '/marker-driver.svg', // ضع ملف في public/
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const defaultIcon = new L.Icon.Default();

function FlyToPosition({ position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 0.6 });
  }, [position, map]);
  return null;
}

export default function DriverLiveMap({ center = [31.5, 34.46], zoom = 12 }) {
  const { drivers } = useDriverLocations();
  const [focused, setFocused] = useState(null);

  const entries = Object.entries(drivers);

  const focusPos = focused && drivers[focused] ? [drivers[focused].lat, drivers[focused].lng] : null;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {focusPos && <FlyToPosition position={focusPos} />}

        {entries.map(([driverId, st]) => {
          const pos = [st.lat, st.lng];
          return (
            <Marker
              key={driverId}
              position={pos}
              icon={driverIcon || defaultIcon}
              eventHandlers={{
                click: () => setFocused(driverId),
              }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong>Driver ID:</strong> {driverId}<br/>
                  <small>Updated: {new Date(st.updated_at).toLocaleString()}</small><br/>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
