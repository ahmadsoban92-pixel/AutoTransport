"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon paths when bundled with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Orange marker for origin
const originIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#f97316" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`),
  iconSize:    [28, 40],
  iconAnchor:  [14, 40],
  popupAnchor: [0, -40],
});

// Blue marker for destination
const destIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#2563eb" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`),
  iconSize:    [28, 40],
  iconAnchor:  [14, 40],
  popupAnchor: [0, -40],
});

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 2) {
      map.fitBounds(L.latLngBounds(coords), { padding: [45, 45] });
    }
  }, [coords, map]);
  return null;
}

// Haversine formula — straight-line miles between two lat/lng points
function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GeoResult { lat: number; lng: number; }

async function geocodeZip(zip: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      { headers: { "User-Agent": "WESAutoTransport/1.0 (contact@wesautotransport.com)" } }
    );
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { return null; }
}

interface Props {
  originZip:   string;
  destZip:     string;
  originCity?: string;
  destCity?:   string;
  onDistance?: (miles: number) => void;
}

export default function RouteMapInner({ originZip, destZip, originCity, destCity, onDistance }: Props) {
  const [coords,  setCoords]  = useState<{ origin: GeoResult; dest: GeoResult } | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef<string>("");

  useEffect(() => {
    const key = `${originZip}-${destZip}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;
    setLoading(true);

    Promise.all([geocodeZip(originZip), geocodeZip(destZip)]).then(([origin, dest]) => {
      if (origin && dest) {
        setCoords({ origin, dest });
        const miles = haversineMiles(origin.lat, origin.lng, dest.lat, dest.lng);
        onDistance?.(miles);
      }
      setLoading(false);
    });
  }, [originZip, destZip, onDistance]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="flex gap-1.5 items-center text-gray-500 text-sm">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="ml-1">Plotting your route...</span>
        </div>
      </div>
    );
  }

  if (!coords) return null;

  const polylinePositions: [number, number][] = [
    [coords.origin.lat, coords.origin.lng],
    [coords.dest.lat,   coords.dest.lng],
  ];

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      className="h-full w-full rounded-xl"
      aria-label={`Route map from ZIP ${originZip} to ZIP ${destZip}`}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      {/* Light tile layer — bright & readable */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      <FitBounds coords={polylinePositions} />

      {/* Route line */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{ color: "#f97316", weight: 4, opacity: 0.9, dashArray: "10 7" }}
      />

      {/* Origin marker */}
      <Marker position={[coords.origin.lat, coords.origin.lng]} icon={originIcon}>
        <Popup><div style={{ fontWeight: 600 }}>📦 Pickup</div><div style={{ fontSize: 12, color: "#555" }}>{originCity ?? `ZIP ${originZip}`}</div></Popup>
      </Marker>

      {/* Destination marker */}
      <Marker position={[coords.dest.lat, coords.dest.lng]} icon={destIcon}>
        <Popup><div style={{ fontWeight: 600 }}>🏁 Delivery</div><div style={{ fontSize: 12, color: "#555" }}>{destCity ?? `ZIP ${destZip}`}</div></Popup>
      </Marker>
    </MapContainer>
  );
}
