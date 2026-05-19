"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Milestone } from "lucide-react";

const RouteMapInner = dynamic(() => import("./RouteMapInner"), {
  ssr:     false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
      <Map className="w-5 h-5 text-gray-400 animate-pulse" />
    </div>
  ),
});

interface Props {
  originZip:   string;
  destZip:     string;
  originCity?: string;
  destCity?:   string;
}

export function RouteMapPreview({ originZip, destZip, originCity, destCity }: Props) {
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);

  const originLabel = originCity ? `${originCity} (${originZip})` : originZip;
  const destLabel   = destCity   ? `${destCity} (${destZip})`     : destZip;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={  { opacity: 0, height: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="overflow-hidden"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 px-0.5 flex-wrap gap-2">
          {/* Route label */}
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <Map className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <span>
              <span className="text-orange-400 font-medium">{originLabel}</span>
              <span className="mx-1.5 text-blue-700">→</span>
              <span className="text-blue-300 font-medium">{destLabel}</span>
            </span>
          </div>

          {/* Distance badge — appears once geocoding resolves */}
          <AnimatePresence>
            {distanceMiles !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={  { opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full
                           bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold"
              >
                <Milestone className="w-3 h-3" />
                {Math.round(distanceMiles).toLocaleString()} mi
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map container */}
        <div
          className="h-52 md:h-64 w-full rounded-xl overflow-hidden border border-gray-300 shadow-sm"
          aria-label={`Interactive route map from ${originLabel} to ${destLabel}`}
        >
          <RouteMapInner
            originZip={originZip}
            destZip={destZip}
            originCity={originCity}
            destCity={destCity}
            onDistance={setDistanceMiles}
          />
        </div>

        {/* Footer attribution */}
        <p className="text-[10px] text-blue-700 mt-1 text-right">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">OpenStreetMap</a> contributors · Straight-line distance
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
