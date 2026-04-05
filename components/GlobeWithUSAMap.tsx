"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe2 } from "lucide-react";
import { Globe } from "@/components/ui/globe";
import dynamic from "next/dynamic";

// ── Lazy-load the Leaflet map so it never runs on SSR ─────────────────────────
const USALeafletMap = dynamic(() => import("./USALeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#e8eaed]">
      <div className="text-gray-500 text-sm animate-pulse">Loading map...</div>
    </div>
  ),
});

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function MapModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="relative w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white"
        style={{ height: "min(85vh, 700px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div>
            <p className="text-gray-900 font-bold text-base">WESAutoTransport — Nationwide Coverage</p>
            <p className="text-gray-500 text-xs">All 50 states · 50,000+ verified carriers · 2,000+ cities served</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close map"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors ml-4"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {/* Leaflet map takes all remaining height */}
        <div className="flex-1 min-h-0">
          <USALeafletMap />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function GlobeWithUSAMap() {
  const [phase, setPhase] = useState<"globe" | "spinning" | "map">("globe");

  const handleGlobeClick = () => {
    if (phase !== "globe") return;
    setPhase("spinning");
    setTimeout(() => setPhase("map"), 1200);
  };

  const closeMap = () => setPhase("globe");

  return (
    <>
      {/* Embedded globe */}
      <div className="relative h-[500px]">
        <motion.div
          className="absolute inset-0"
          animate={
            phase === "spinning"
              ? { scale: [1, 1.2, 1.4], rotate: [0, 180, 360], opacity: [1, 1, 0] }
              : phase === "map"
              ? { opacity: 0 }
              : { scale: 1, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <Globe />
        </motion.div>

        {phase === "globe" && (
          <button
            onClick={handleGlobeClick}
            aria-label="Open USA coverage map"
            className="absolute inset-0 flex flex-col items-center justify-end pb-6 group"
          >
            <span className="flex items-center gap-1.5 text-white/80 bg-black/40 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Globe2 className="w-3.5 h-3.5" /> Click to explore USA coverage map
            </span>
          </button>
        )}
      </div>

      {/* Leaflet map modal */}
      <AnimatePresence>
        {phase === "map" && <MapModal onClose={closeMap} />}
      </AnimatePresence>
    </>
  );
}
