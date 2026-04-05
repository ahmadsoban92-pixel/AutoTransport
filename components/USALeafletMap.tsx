"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon paths under webpack/Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Orange brand marker icon
const orangeIcon = new L.Icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41] as [number, number],
  iconAnchor:  [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize:  [41, 41] as [number, number],
});

interface City { name: string; lat: number; lng: number; carriers: string; }

const CITIES: City[] = [
  { name: "Los Angeles, CA",   lat: 34.0522,  lng: -118.2437, carriers: "4,200+" },
  { name: "New York, NY",      lat: 40.7128,  lng: -74.0060,  carriers: "5,100+" },
  { name: "Chicago, IL",       lat: 41.8781,  lng: -87.6298,  carriers: "3,800+" },
  { name: "Houston, TX",       lat: 29.7604,  lng: -95.3698,  carriers: "3,500+" },
  { name: "Phoenix, AZ",       lat: 33.4484,  lng: -112.0740, carriers: "2,900+" },
  { name: "Philadelphia, PA",  lat: 39.9526,  lng: -75.1652,  carriers: "2,700+" },
  { name: "San Antonio, TX",   lat: 29.4241,  lng: -98.4936,  carriers: "2,400+" },
  { name: "San Diego, CA",     lat: 32.7157,  lng: -117.1611, carriers: "2,600+" },
  { name: "Dallas, TX",        lat: 32.7767,  lng: -96.7970,  carriers: "3,200+" },
  { name: "San Jose, CA",      lat: 37.3382,  lng: -121.8863, carriers: "2,100+" },
  { name: "Austin, TX",        lat: 30.2672,  lng: -97.7431,  carriers: "2,300+" },
  { name: "Jacksonville, FL",  lat: 30.3322,  lng: -81.6557,  carriers: "1,800+" },
  { name: "Miami, FL",         lat: 25.7617,  lng: -80.1918,  carriers: "2,800+" },
  { name: "Seattle, WA",       lat: 47.6062,  lng: -122.3321, carriers: "2,200+" },
  { name: "Denver, CO",        lat: 39.7392,  lng: -104.9903, carriers: "2,500+" },
  { name: "Nashville, TN",     lat: 36.1627,  lng: -86.7816,  carriers: "1,900+" },
  { name: "Atlanta, GA",       lat: 33.7490,  lng: -84.3880,  carriers: "2,600+" },
  { name: "Minneapolis, MN",   lat: 44.9778,  lng: -93.2650,  carriers: "1,700+" },
  { name: "Portland, OR",      lat: 45.5051,  lng: -122.6750, carriers: "1,600+" },
  { name: "Las Vegas, NV",     lat: 36.1699,  lng: -115.1398, carriers: "2,000+" },
];

// Continental USA bounds
const USA_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [24.396308, -125.0],
  [49.384358, -66.934],
];

function SetUSABounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(USA_BOUNDS, { padding: [20, 20] });
  }, [map]);
  return null;
}

export default function USALeafletMap() {
  const center: LatLngTuple = [39.5, -98.35];

  return (
    <MapContainer
      center={center}
      zoom={4}
      minZoom={3}
      maxZoom={13}
      style={{ width: "100%", height: "100%", background: "#0a1628" }}
    >
      {/* CARTO dark tiles — free, no API key */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={18}
      />

      <SetUSABounds />

      {CITIES.map((city) => {
        const pos: LatLngTuple = [city.lat, city.lng];
        return (
          <Marker key={city.name} position={pos} icon={orangeIcon}>
            <Popup>
              <div style={{ minWidth: 150, fontFamily: "sans-serif" }}>
                <div style={{ fontWeight: "bold", color: "#f97316", marginBottom: 6, fontSize: 14 }}>
                  📍 {city.name}
                </div>
                <div style={{ color: "#475569", fontSize: 12. }}>
                  🚛 Active carriers: <strong>{city.carriers}</strong>
                </div>
                <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
                  ✅ Door-to-door service available
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
