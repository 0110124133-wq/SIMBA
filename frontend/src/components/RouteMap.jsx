import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// PDAM Tirta Asasta Depok Office Coordinates (Jl Raya Kartini)
const PDAM_OFFICE = [-6.3998, 106.8258];

// Custom icons
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const officeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const targetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function RouteMap({ destination }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination || !destination[0] || !destination[1]) return;

    const fetchRoute = async () => {
      setLoading(true);
      const [destLat, destLon] = destination;
      const originLon = PDAM_OFFICE[1];
      const originLat = PDAM_OFFICE[0];

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?geometries=geojson`
        );
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM coordinates are [lon, lat], map to [lat, lon] for Leaflet
          const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoords(coords);
          setDistance((route.distance / 1000).toFixed(1)); // to km
          setDuration(Math.round(route.duration / 60)); // to minutes
        } else {
          throw new Error('OSRM route failed');
        }
      } catch (err) {
        console.warn('Routing API failed, falling back to straight-line route.', err);
        // Fallback straight-line
        setRouteCoords([PDAM_OFFICE, destination]);
        // Approx distance using Haversine formula
        const R = 6371; // km
        const dLat = (destLat - PDAM_OFFICE[0]) * Math.PI / 180;
        const dLon = (destLon - PDAM_OFFICE[1]) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(PDAM_OFFICE[0] * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        setDistance(d.toFixed(1));
        setDuration(Math.round(d * 2.5)); // Approx 2.5 min per km in traffic
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [destination]);

  if (!destination) return <p>Tidak ada koordinat tujuan.</p>;

  return (
    <div className="map-container-wrapper">
      <div className="map-header">
        <h3 className="map-title">Peta Rute Perjalanan Penyaluran Air</h3>
        {loading && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Menghitung rute...</span>}
      </div>

      <MapContainer 
        center={PDAM_OFFICE} 
        zoom={13} 
        className="map-element"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origin: PDAM office */}
        <Marker position={PDAM_OFFICE} icon={officeIcon}>
          <Popup>
            <div>
              <strong>Kantor Pusat PDAM Depok</strong>
              <p>Titik keberangkatan armada tangki air</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination: Request location */}
        <Marker position={destination} icon={targetIcon}>
          <Popup>
            <div>
              <strong>Titik Penyaluran Bantuan</strong>
              <p>Lokasi kekeringan penerima bantuan</p>
            </div>
          </Popup>
        </Marker>

        {/* Drawn Route */}
        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            color="var(--primary)" 
            weight={5} 
            opacity={0.8}
          />
        )}
      </MapContainer>

      {distance && duration && (
        <div className="route-info-panel">
          <div className="route-info-item">
            <h4>Jarak Tempuh</h4>
            <p>{distance} km</p>
          </div>
          <div className="route-info-item">
            <h4>Estimasi Waktu</h4>
            <p>{duration} menit</p>
          </div>
          <div className="route-info-item">
            <h4>Titik Berangkat</h4>
            <p>Kantor Kartini</p>
          </div>
        </div>
      )}
    </div>
  );
}
