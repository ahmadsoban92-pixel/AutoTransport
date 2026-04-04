"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, ZoomIn } from "lucide-react";

// ── Base config (small, embedded in page) ─────────────────────────────────
const BASE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.6, 0.8, 1.0],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [0.8, 0.9, 1.0],
  markers: [
    { location: [40.7128, -74.006], size: 0.1 },   // New York
    { location: [34.0522, -118.2437], size: 0.1 },  // Los Angeles
    { location: [41.8781, -87.6298], size: 0.08 },  // Chicago
    { location: [29.7604, -95.3698], size: 0.08 },  // Houston
    { location: [33.4484, -112.074], size: 0.07 },  // Phoenix
    { location: [25.7617, -80.1918], size: 0.07 },  // Miami
    { location: [47.6062, -122.3321], size: 0.07 }, // Seattle
    { location: [32.7767, -96.797], size: 0.07 },   // Dallas
    { location: [39.9526, -75.1652], size: 0.06 },  // Philadelphia
    { location: [37.3382, -121.8863], size: 0.06 }, // San Jose
    { location: [44.9778, -93.265], size: 0.06 },   // Minneapolis
    { location: [30.3322, -81.6557], size: 0.05 },  // Jacksonville
  ],
};

// ── Reusable canvas-based globe ───────────────────────────────────────────
function GlobeCanvas({
  config,
  className,
  autoSpin = true,
}: {
  config?: Partial<COBEOptions>;
  className?: string;
  autoSpin?: boolean;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const [r, setR] = useState(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, unknown>) => {
      if (autoSpin && pointerInteracting.current === null) phi += 0.004;
      state.phi = phi + r;
      state.width = width * 2;
      state.height = width * 2;
    },
    [r, autoSpin]
  );

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();
    const globe = createGlobe(canvasRef.current!, {
      ...BASE_CONFIG,
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    });
    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });
    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={cn("absolute inset-0 mx-auto aspect-square w-full", className)}>
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        onPointerDown={(e) => updatePointerInteraction(e.clientX - pointerMovement.current)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}

// ── Expanded fullscreen modal globe ─────────────────────────────────────
function GlobeModal({ onClose }: { onClose: () => void }) {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="relative w-full max-w-2xl aspect-square"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 z-10 -translate-y-full translate-x-0 mb-3 flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            aria-label="Close globe"
          >
            <X className="w-5 h-5" /> Close
          </button>

          {/* Globe canvas — centred on USA */}
          <GlobeCanvas
            config={{
              phi: 1.05,      // rotate to face USA (western hemisphere)
              theta: 0.35,    // slight tilt
              mapBrightness: 8,
              mapSamples: 20000,
              markers: BASE_CONFIG.markers?.map((m) => ({ ...m, size: m.size * 1.6 })),
            }}
            autoSpin={false}
            className="max-w-full"
          />

          {/* Hint */}
          <p className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-3 text-white/50 text-xs flex items-center gap-1.5 whitespace-nowrap pt-2">
            <RotateCcw className="w-3 h-3" /> Drag to rotate
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Public Globe component (embedded + clickable) ────────────────────────
export function Globe({
  className,
  config,
}: {
  className?: string;
  config?: Partial<COBEOptions>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Embedded (page) globe */}
      <div
        className={cn("absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px] group", className)}
        title="Click to expand"
      >
        <GlobeCanvas config={config} />

        {/* Click-to-expand overlay hint */}
        <button
          onClick={() => setExpanded(true)}
          aria-label="Expand globe to full screen"
          className="absolute inset-0 flex flex-col items-center justify-end pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-white/80 bg-black/40 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full border border-white/20">
            <ZoomIn className="w-3.5 h-3.5" /> Click to expand &amp; explore
          </span>
        </button>
      </div>

      {/* Full-screen modal */}
      {expanded && <GlobeModal onClose={() => setExpanded(false)} />}
    </>
  );
}
