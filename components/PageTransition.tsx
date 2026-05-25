"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";

export function PageTransition() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [visible, setVisible] = useState(false);

  const isLight = resolvedTheme === "light";
  const bg      = isLight ? "#fdf6e3" : "#060d1f";
  const brand   = isLight ? "rgba(26,26,46,0.30)"  : "rgba(255,255,255,0.25)";
  const accent  = isLight ? "rgba(234,88,12,0.65)" : "rgba(251,146,60,0.55)";

  /* ── Show overlay on internal link clicks ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href") ?? "";
      // Only same-site, non-hash, non-download, non-external-target navigations
      const hrefPath = href.split("#")[0].split("?")[0];
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !a.target &&
        !a.download &&
        hrefPath !== pathname   // ignore same-page anchor links
      ) {
        setVisible(true);
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  /* ── Dismiss once new route is ready ── */
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 380);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none select-none"
          style={{ background: bg }}
        >
          <div className="flex flex-col items-center gap-5">

            {/* ── Glowing truck ── */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
              style={{
                filter: "drop-shadow(0 0 18px rgba(251,146,60,0.75))",
                color: "#fb923c",
              }}
            >
              <Truck size={58} strokeWidth={1.5} />
            </motion.div>

            {/* ── Scrolling road dashes ── */}
            <div className="relative w-44 overflow-hidden" style={{ height: "4px" }}>
              <motion.div
                className="absolute flex items-center"
                style={{ gap: "10px", top: "50%", transform: "translateY(-50%)" }}
                animate={{ x: [0, -42] }}
                transition={{ duration: 0.42, repeat: Infinity, ease: "linear" }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "32px",
                      height: "2px",
                      flexShrink: 0,
                      borderRadius: "9999px",
                      background: "rgba(251,146,60,0.35)",
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* ── Brand mark ── */}
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: brand,
              }}
            >
              WESAuto
              <span style={{ color: accent }}>Transport</span>
            </p>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
