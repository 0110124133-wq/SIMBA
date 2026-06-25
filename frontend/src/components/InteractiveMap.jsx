import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Vite leaflet marker asset issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Center of Depok
const DEPOK_CENTER = [-6.4025, 106.7942];

// Custom markers for different request statuses
const createMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  pending: createMarkerIcon('gold'),       // Yellow
  approved: createMarkerIcon('blue'),      // Blue
  distributing: createMarkerIcon('orange'), // Orange
  completed: createMarkerIcon('green'),    // Green
  rejected: createMarkerIcon('red'),       // Red
  default: createMarkerIcon('blue')
};

// Map click listener component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position ? <Marker position={position} icon={icons.default} /> : null;
}

export default function InteractiveMap({ 
  mode = 'view', // 'view', 'select', 'admin-multi'
  position, 
  setPosition, 
  requests = [], 
  onMarkerClick 
}) {
  const [mapCenter, setMapCenter] = useState(DEPOK_CENTER);

  // Auto-center map on input position if provided
  useEffect(() => {
    if (position && position[0] && position[1]) {
      setMapCenter(position);
    }
  }, [position]);

  return (
    <div className="map-container-wrapper">
      <div className="map-header">
        <h3 className="map-title">
          {mode === 'select' ? 'Pilih Lokasi Pengajuan (Klik pada peta)' : 'Peta Lokasi Distribusi Air'}
        </h3>
        {position && mode === 'select' && (
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            Koordinat: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        )}
      </div>
      
      <MapContainer 
        center={mapCenter} 
        zoom={mode === 'admin-multi' ? 12 : 14} 
        className="map-element"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Selection Mode (For User Form) */}
        {mode === 'select' && (
          <LocationMarker position={position} setPosition={setPosition} />
        )}

        {/* View Single Mode */}
        {mode === 'view' && position && (
          <Marker position={position} icon={icons.default}>
            <Popup>Lokasi Pengajuan Bantuan</Popup>
          </Marker>
        )}

        {/* Admin Dashboard Multi-pin Mode */}
        {mode === 'admin-multi' && requests.map((req) => {
          if (!req.latitude || !req.longitude) return null;
          const statusIcon = icons[req.status] || icons.default;
          
          return (
            <Marker 
              key={req.id} 
              position={[req.latitude, req.longitude]} 
              icon={statusIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(req)
              }}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--dark-blue)' }}>{req.title}</h4>
                  <p style={{ margin: '0 0 3px 0', fontSize: '0.8rem' }}><strong>Alamat:</strong> {req.address}</p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem' }}><strong>Volume:</strong> {req.volume_needed} Liter</p>
                  <div style={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '0.75rem' }}>
                    Status: {req.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
