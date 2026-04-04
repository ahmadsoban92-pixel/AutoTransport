"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Map, Globe2 } from "lucide-react";
import { Globe } from "@/components/ui/globe";

// ── Major US cities with approximate SVG coordinates (800×500 viewport) ───────
const CITIES = [
  { name: "Los Angeles",    x: 90,  y: 310, major: true  },
  { name: "San Francisco",  x: 70,  y: 255, major: false },
  { name: "Seattle",        x: 80,  y: 150, major: false },
  { name: "Phoenix",        x: 145, y: 350, major: false },
  { name: "Denver",         x: 215, y: 270, major: false },
  { name: "Dallas",         x: 300, y: 385, major: true  },
  { name: "Houston",        x: 305, y: 415, major: false },
  { name: "Chicago",        x: 420, y: 215, major: true  },
  { name: "Minneapolis",    x: 365, y: 175, major: false },
  { name: "Miami",          x: 490, y: 430, major: true  },
  { name: "Atlanta",        x: 455, y: 375, major: false },
  { name: "Nashville",      x: 445, y: 325, major: false },
  { name: "Philadelphia",   x: 560, y: 235, major: false },
  { name: "New York",       x: 575, y: 210, major: true  },
  { name: "Boston",         x: 600, y: 190, major: false },
  { name: "Washington DC",  x: 555, y: 255, major: false },
  { name: "Detroit",        x: 470, y: 205, major: false },
  { name: "Las Vegas",      x: 120, y: 305, major: false },
  { name: "Portland",       x: 78,  y: 165, major: false },
  { name: "Kansas City",    x: 345, y: 275, major: false },
];

// ── Simplified US state outlines as SVG paths (800×500 viewport) ─────────────
// These are highly simplified outlines for decorative use
const STATE_PATHS = [
  // Pacific Northwest + Alaska anchor
  "M 58,130 L 95,130 L 100,175 L 75,185 L 58,170 Z", // WA
  "M 75,185 L 100,175 L 105,230 L 78,235 Z", // OR
  "M 58,130 L 60,100 L 90,100 L 95,130 Z", // part of WA
  // California
  "M 58,170 L 75,185 L 78,235 L 82,290 L 100,330 L 108,365 L 80,370 L 62,310 L 55,240 Z",
  // Nevada
  "M 78,235 L 105,230 L 112,290 L 100,330 L 82,290 Z",
  // Idaho
  "M 100,175 L 140,175 L 145,215 L 130,230 L 112,230 L 105,230 Z",
  // Montana
  "M 140,130 L 230,130 L 232,175 L 145,175 L 140,175 Z",
  // Wyoming
  "M 145,175 L 232,175 L 235,230 L 148,230 Z",
  // Utah
  "M 112,230 L 148,230 L 150,290 L 115,290 Z",
  // Colorado
  "M 148,230 L 235,230 L 238,288 L 150,288 Z",
  // Arizona
  "M 108,290 L 150,290 L 152,355 L 145,380 L 110,380 L 105,330 L 100,330 Z",
  // New Mexico
  "M 150,290 L 238,290 L 240,360 L 152,360 Z",
  // North/South Dakota
  "M 232,130 L 340,130 L 342,175 L 232,175 Z",
  "M 232,175 L 342,175 L 345,220 L 235,220 Z",
  // Nebraska
  "M 235,220 L 345,220 L 348,260 L 237,260 Z",
  // Kansas
  "M 237,260 L 348,260 L 350,295 L 240,295 Z",
  // Oklahoma
  "M 240,295 L 350,295 L 358,330 L 315,340 L 250,338 L 242,330 Z",
  // Texas
  "M 242,330 L 250,338 L 315,340 L 358,330 L 365,390 L 340,430 L 290,450 L 255,445 L 242,430 L 230,390 Z",
  // Minnesota
  "M 340,130 L 405,130 L 408,175 L 342,175 Z",
  "M 342,175 L 408,175 L 410,215 L 345,220 Z",
  // Iowa
  "M 345,220 L 410,215 L 412,255 L 348,260 Z",
  // Missouri
  "M 348,260 L 412,255 L 415,305 L 355,310 L 350,295 Z",
  // Arkansas
  "M 355,310 L 415,305 L 418,345 L 360,350 Z",
  // Louisiana
  "M 360,350 L 418,345 L 415,395 L 395,410 L 370,415 L 355,390 Z",
  // Wisconsin
  "M 405,130 L 455,130 L 460,180 L 408,175 Z",
  "M 408,175 L 460,180 L 462,215 L 410,215 Z",
  // Illinois
  "M 410,215 L 462,215 L 463,265 L 412,260 Z",
  // Michigan (simplified)
  "M 455,130 L 490,130 L 492,175 L 460,180 Z",
  "M 460,180 L 492,175 L 493,205 L 462,215 Z",
  // Indiana
  "M 462,215 L 493,205 L 495,255 L 463,260 Z",
  // Kentucky
  "M 412,255 L 463,260 L 465,290 L 413,295 Z",
  // Tennessee
  "M 413,295 L 465,290 L 468,320 L 415,325 Z",
  // Mississippi/Alabama
  "M 415,325 L 468,320 L 470,370 L 430,380 L 418,370 L 415,360 Z",
  // Georgia
  "M 430,340 L 470,335 L 475,385 L 460,400 L 432,395 Z",
  // South Carolina
  "M 510,310 L 530,300 L 535,330 L 512,340 Z",
  // North Carolina
  "M 490,285 L 550,278 L 553,305 L 492,312 Z",
  // Virginia
  "M 518,258 L 570,250 L 572,278 L 520,285 Z",
  // West Virginia
  "M 493,255 L 520,250 L 522,278 L 495,282 Z",
  // Ohio
  "M 463,215 L 495,210 L 498,255 L 465,258 Z",
  // Pennsylvania
  "M 495,210 L 555,205 L 557,240 L 498,245 Z",
  // New York
  "M 540,175 L 600,172 L 602,215 L 542,218 Z",
  // New England (simplified)
  "M 580,165 L 615,162 L 618,195 L 582,198 Z",
  // New Jersey / Delaware / Maryland
  "M 553,228 L 572,225 L 574,255 L 555,258 Z",
  // Florida
  "M 430,380 L 470,375 L 480,410 L 495,450 L 490,470 L 460,470 L 440,445 L 428,415 Z",
];

// ── USA Map SVG ───────────────────────────────────────────────────────────────
function USAMap({ onClose }: { onClose: () => void }) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-white">
            <Map className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-lg">WESAutoTransport — Nationwide Coverage</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
            aria-label="Close map"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {/* Map card */}
        <div className="relative bg-gradient-to-br from-[#0a1628] to-[#0f1f3d] border border-blue-700/30 rounded-2xl overflow-hidden shadow-2xl p-2">
          <svg
            viewBox="30 100 640 380"
            className="w-full h-auto"
            style={{ maxHeight: "65vh" }}
          >
            {/* Ocean / background */}
            <rect x="0" y="0" width="800" height="600" fill="#060d1f" />

            {/* Grid lines (subtle) */}
            {[150, 200, 250, 300, 350, 400, 450].map((y) => (
              <line key={`h${y}`} x1="30" y1={y} x2="650" y2={y} stroke="#1e3a5f" strokeWidth="0.4" />
            ))}
            {[100, 160, 220, 280, 340, 400, 460, 520, 580, 640].map((x) => (
              <line key={`v${x}`} x1={x} y1="100" x2={x} y2="480" stroke="#1e3a5f" strokeWidth="0.4" />
            ))}

            {/* State fills */}
            {STATE_PATHS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="#0d2040"
                stroke="#1e4080"
                strokeWidth="0.8"
                opacity="0.9"
              />
            ))}

            {/* City markers */}
            {CITIES.map((city) => (
              <g
                key={city.name}
                onMouseEnter={() => setHoveredCity(city.name)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow ring on hover */}
                {hoveredCity === city.name && (
                  <circle cx={city.x} cy={city.y} r={city.major ? 10 : 8} fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.5" />
                )}
                {/* Dot */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.major ? 4.5 : 3}
                  fill={city.major ? "#f97316" : "#fb923c"}
                  opacity={hoveredCity === city.name ? 1 : 0.85}
                />
                {/* Label */}
                <text
                  x={city.x + (city.x > 400 ? -6 : 6)}
                  y={city.y - 6}
                  textAnchor={city.x > 400 ? "end" : "start"}
                  fill={hoveredCity === city.name ? "#fed7aa" : "#93c5fd"}
                  fontSize={city.major ? 7.5 : 6}
                  fontFamily="sans-serif"
                  fontWeight={city.major ? "bold" : "normal"}
                >
                  {city.name}
                </text>
              </g>
            ))}

            {/* Legend */}
            <circle cx="58" cy="458" r="4.5" fill="#f97316" />
            <text x="68" y="462" fill="#93c5fd" fontSize="7" fontFamily="sans-serif">Major Hub</text>
            <circle cx="110" cy="458" r="3" fill="#fb923c" />
            <text x="120" y="462" fill="#93c5fd" fontSize="7" fontFamily="sans-serif">Service City</text>
          </svg>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-blue-800/40 border-t border-blue-800/30 mt-1">
            {[
              { label: "States Covered", value: "All 50" },
              { label: "Active Carriers", value: "50,000+" },
              { label: "Cities Served", value: "2,000+" },
            ].map((item) => (
              <div key={item.label} className="text-center py-3 px-2">
                <div className="text-orange-400 font-bold text-sm">{item.value}</div>
                <div className="text-blue-400 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-blue-500 text-xs mt-3">
          Hover over city markers · Click outside to close
        </p>
      </div>
    </motion.div>
  );
}

// ── Main exported component: Globe → animated zoom → USA Map ─────────────────
export function GlobeWithUSAMap() {
  const [phase, setPhase] = useState<"globe" | "spinning" | "map">("globe");

  // Lock scroll while map is open
  useEffect(() => {
    if (phase === "map") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  const handleGlobeClick = () => {
    if (phase !== "globe") return;
    // Phase 1: spin animation (CSS handles it for 1.2s)
    setPhase("spinning");
    // Phase 2: transition to map
    setTimeout(() => setPhase("map"), 1300);
  };

  const closeMap = () => setPhase("globe");

  return (
    <>
      {/* Embedded globe section */}
      <div className="relative h-[500px]">
        <motion.div
          className="absolute inset-0"
          animate={
            phase === "spinning"
              ? { scale: [1, 1.18, 1.35], rotate: [0, 180, 360], opacity: [1, 1, 0] }
              : phase === "map"
              ? { opacity: 0 }
              : { scale: 1, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Globe />
        </motion.div>

        {/* Click-to-explore hint (only in globe phase) */}
        {phase === "globe" && (
          <button
            onClick={handleGlobeClick}
            aria-label="Expand to USA map"
            className="absolute inset-0 flex flex-col items-center justify-end pb-6 group"
          >
            <span className="flex items-center gap-1.5 text-white/80 bg-black/40 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Globe2 className="w-3.5 h-3.5" /> Click to explore USA coverage map
            </span>
          </button>
        )}
      </div>

      {/* USA Map modal */}
      <AnimatePresence>
        {phase === "map" && <USAMap onClose={closeMap} />}
      </AnimatePresence>
    </>
  );
}
