"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet's broken webpack icon paths ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Google Maps-style red drop pin (SVG, no external dependency) ─────────────
const RED_PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
  <!-- Drop shadow -->
  <ellipse cx="12" cy="34" rx="5" ry="2" fill="rgba(0,0,0,0.20)"/>
  <!-- Pin body -->
  <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 21 9 21s9-14.25 9-21c0-4.97-4.03-9-9-9z"
        fill="#EA4335" stroke="#C5221F" stroke-width="0.5"/>
  <!-- Inner white circle -->
  <circle cx="12" cy="9" r="3.5" fill="white"/>
</svg>`;

const redIcon = new L.DivIcon({
  html:        `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">${RED_PIN_SVG}</div>`,
  className:   "",       // no default leaflet-div-icon styles
  iconSize:    [24, 36],
  iconAnchor:  [12, 36],
  popupAnchor: [0, -38],
});

// ─── City data ────────────────────────────────────────────────────────────────
interface City { name: string; lat: number; lng: number; carriers: string; }

const CITIES: City[] = [
  { name: "Los Angeles, CA",  lat: 34.0522,  lng: -118.2437, carriers: "4,200+" },
  { name: "New York, NY",     lat: 40.7128,  lng: -74.0060,  carriers: "5,100+" },
  { name: "Chicago, IL",      lat: 41.8781,  lng: -87.6298,  carriers: "3,800+" },
  { name: "Houston, TX",      lat: 29.7604,  lng: -95.3698,  carriers: "3,500+" },
  { name: "Phoenix, AZ",      lat: 33.4484,  lng: -112.0740, carriers: "2,900+" },
  { name: "Philadelphia, PA", lat: 39.9526,  lng: -75.1652,  carriers: "2,700+" },
  { name: "San Antonio, TX",  lat: 29.4241,  lng: -98.4936,  carriers: "2,400+" },
  { name: "San Diego, CA",    lat: 32.7157,  lng: -117.1611, carriers: "2,600+" },
  { name: "Dallas, TX",       lat: 32.7767,  lng: -96.7970,  carriers: "3,200+" },
  { name: "San Jose, CA",     lat: 37.3382,  lng: -121.8863, carriers: "2,100+" },
  { name: "Austin, TX",       lat: 30.2672,  lng: -97.7431,  carriers: "2,300+" },
  { name: "Jacksonville, FL", lat: 30.3322,  lng: -81.6557,  carriers: "1,800+" },
  { name: "Miami, FL",        lat: 25.7617,  lng: -80.1918,  carriers: "2,800+" },
  { name: "Seattle, WA",      lat: 47.6062,  lng: -122.3321, carriers: "2,200+" },
  { name: "Denver, CO",       lat: 39.7392,  lng: -104.9903, carriers: "2,500+" },
  { name: "Nashville, TN",    lat: 36.1627,  lng: -86.7816,  carriers: "1,900+" },
  { name: "Atlanta, GA",      lat: 33.7490,  lng: -84.3880,  carriers: "2,600+" },
  { name: "Minneapolis, MN",  lat: 44.9778,  lng: -93.2650,  carriers: "1,700+" },
  { name: "Portland, OR",     lat: 45.5051,  lng: -122.6750, carriers: "1,600+" },
  { name: "Las Vegas, NV",    lat: 36.1699,  lng: -115.1398, carriers: "2,000+" },
];

// Lock view to continental USA
const USA_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [24.396308, -125.0],
  [49.384358, -66.934],
];

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(USA_BOUNDS, { padding: [16, 16] });
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
      maxZoom={14}
      style={{ width: "100%", height: "100%", background: "#e8eaed" }}
    >
      {/*
        CARTO Positron — free, no API key, closest free equivalent to Google Maps light style.
        Clean white roads, soft grey land areas, readable labels.
      */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      <FitBounds />

      {CITIES.map((city) => {
        const pos: LatLngTuple = [city.lat, city.lng];
        return (
          <Marker key={city.name} position={pos} icon={redIcon}>
            <Popup
              offset={[0, -4]}
              closeButton={false}
              className="leaflet-popup-google"
            >
              <div style={{
                fontFamily: "'Roboto', 'Google Sans', Arial, sans-serif",
                minWidth: 180,
                padding: "2px 4px",
              }}>
                {/* City name — Google Maps style bold header */}
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#202124",
                  marginBottom: 6,
                  borderBottom: "1px solid #e8eaed",
                  paddingBottom: 6,
                }}>
                  {city.name}
                </div>
                {/* Stats */}
                <div style={{ fontSize: 12, color: "#5f6368", lineHeight: 1.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14 }}>🚛</span>
                    <span><strong style={{ color: "#202124" }}>{city.carriers}</strong> active carriers</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>✅</span>
                    <span>Door-to-door service</span>
                  </div>
                </div>
                {/* CTA pill — Google Maps "Directions" button style */}
                <div style={{ marginTop: 8 }}>
                  <a
                    href="/get-quote"
                    style={{
                      display: "inline-block",
                      background: "#1a73e8",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 4,
                      textDecoration: "none",
                    }}
                  >
                    Get Quote
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
