"use client";

// Enhancement: US Location Detection Banner
// Uses ipapi.co (HTTPS, free, no API key required).
// Only shows if the visitor is in the United States.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Truck } from "lucide-react";
import Link from "next/link";

interface GeoData {
  country:    string; // "US"
  region:     string; // "California"
  city:       string; // "Los Angeles"
}

async function detectLocation(): Promise<GeoData | null> {
  try {
    // ipapi.co — HTTPS, free tier, no API key, 1000 req/day
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    // country_code is "US" for United States
    if (!data || data.country_code !== "US") return null;
    return {
      country: "US",
      region:  data.region  ?? "",
      city:    data.city    ?? "",
    };
  } catch {
    return null;
  }
}

export function USLocationBanner() {
  const [geo,       setGeo]       = useState<GeoData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checked,   setChecked]   = useState(false);

  useEffect(() => {
    // Don't re-fetch if user already dismissed in this session
    try {
      if (sessionStorage.getItem("geo-banner-dismissed") === "1") {
        setChecked(true);
        return;
      }
    } catch { /* ignore */ }

    // Always fetch fresh — no caching of geo-data so VPN switches work correctly
    detectLocation().then((data) => {
      setGeo(data);
      setChecked(true);
    });
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("geo-banner-dismissed", "1"); } catch { /* ignore */ }
  };

  if (!checked || !geo || dismissed) return null;

  const location = [geo.city, geo.region].filter(Boolean).join(", ");

  return (
    <AnimatePresence>
      <motion.div
        key="us-banner"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full bg-gradient-to-r from-orange-600/90 via-orange-500/90 to-orange-600/90
                   backdrop-blur-sm border-b border-orange-400/30"
        role="banner"
        aria-label={`Shipping available from ${location}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Message */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-white text-xs sm:text-sm font-medium truncate">
              <span className="font-bold">📍 Shipping from {location || "United States"}, US</span>
              <span className="hidden sm:inline text-orange-100"> — We pick up vehicles nationwide. </span>
              <Link
                href="/get-quote"
                className="underline underline-offset-2 font-semibold hover:text-orange-100 transition-colors ml-1"
              >
                Get a free quote →
              </Link>
            </p>
          </div>

          {/* Dismiss */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Truck className="w-4 h-4 text-orange-200 hidden sm:block" />
            <button
              onClick={handleDismiss}
              aria-label="Dismiss location banner"
              className="p-1 rounded-full text-orange-200 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
