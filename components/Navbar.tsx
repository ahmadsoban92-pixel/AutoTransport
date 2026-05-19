"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Home, Info, Wrench, HelpCircle, Phone, Star,
  Search, X, Loader2, MapPin, Menu, Truck,
} from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { USLocationBanner } from "@/components/USLocationBanner";

const navItems = [
  { name: "Home",     url: "/",         icon: Home      },
  { name: "About",    url: "/about",    icon: Info      },
  { name: "Services", url: "/services", icon: Wrench    },
  { name: "Reviews",  url: "/reviews",  icon: Star      },
  { name: "FAQ",      url: "/faq",      icon: HelpCircle},
  { name: "Contact",  url: "/contact",  icon: Phone     },
];

// ─── Track Order Modal ─────────────────────────────────────────────────────────

function TrackOrderModal({ onClose }: { onClose: () => void }) {
  const router  = useRouter();
  const [token,   setToken]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = token.trim();
    if (!cleaned)           { setError("Please enter your tracking ID."); return; }
    if (cleaned.length < 8) { setError("Tracking ID must be at least 8 characters."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/track/${cleaned}`);
      if (!res.ok) {
        setError("Tracking ID not found. Please check your email and try again.");
        setLoading(false);
        return;
      }
    } catch { /* navigate anyway */ }

    onClose();
    router.push(`/track/${cleaned}`);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Track your shipment"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.92, y: 16  }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="relative z-10 w-full max-w-md bg-[#0a1628] border border-blue-800/40 rounded-2xl p-8 shadow-2xl"
      >
        <button
          onClick={onClose} aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-blue-500 hover:text-white hover:bg-blue-800/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Track Your Shipment</h2>
            <p className="text-blue-400 text-sm">Enter the tracking ID from your email</p>
          </div>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label htmlFor="tracking-id" className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">
              Tracking ID
            </label>
            <input
              id="tracking-id"
              type="text"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(""); }}
              placeholder="e.g. aBcD1234eFgH5678"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-blue-950/50 border border-blue-800/50 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono"
            />
            {error && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
            <p className="text-blue-700 text-[11px] mt-1.5">
              Your Tracking ID was included in your booking confirmation email.
            </p>
          </div>

          <Button
            type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 font-semibold h-11"
          >
            {loading
              ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Looking up...</>
              : <><Search  className="mr-2 w-4 h-4" />Track Shipment</>}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function SiteNavbar() {
  const { resolvedTheme } = useTheme();
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // mounted guard — prevents hydration mismatch with next-themes
  // Server and first client render both use false (dark), then update after mount
  const [mounted,        setMounted]        = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-close drawer when viewport widens past md breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Only derive isLight after mount — both SSR and hydration pass use "dark"
  const isLight = mounted && resolvedTheme === "light";

  return (
    <>
      {/* ── Fixed header ── */}
      <header
        suppressHydrationWarning
        className="fixed top-0 left-0 right-0 z-50 bg-[#060d1f]/90 backdrop-blur-md border-b border-blue-900/30"
      >
        {/* ── Desktop top bar ── */}
        <div className="hidden md:flex items-center justify-between px-8 py-3">
          {/* Left: logo + theme toggle */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-orange-400" />
              <span
                suppressHydrationWarning
                className={`text-lg font-bold ${isLight ? "text-gray-900" : "text-white"}`}
              >
                WESAuto<span className="text-orange-400">Transport</span>
              </span>
            </Link>
            {/* ThemeToggle on LEFT so nav pill never covers it */}
            <ThemeToggle />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTrackModal(true)}
              className="border-blue-700/60 text-blue-300 hover:bg-blue-900/40 hover:border-blue-500 text-sm gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Track Order
            </Button>
            <Link href="/get-quote">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-sm">
                Get Free Quote →
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Mobile top bar ── */}
        <div className="flex md:hidden items-center justify-between px-4 py-3">
          {/* Left: logo + theme toggle */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-400" />
              <span className="text-base font-bold text-white">
                WESAuto<span className="text-orange-400">Transport</span>
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Right: icon actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTrackModal(true)}
              aria-label="Track order"
              className="p-2 rounded-lg text-blue-300 hover:text-orange-400 hover:bg-blue-900/40 transition-colors"
            >
              <MapPin className="w-4 h-4" />
            </button>
            <Link href="/get-quote">
              <span className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors">
                Quote
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900/40 transition-colors"
            >
              {mobileMenuOpen
                ? <X    className="w-5 h-5" />
                : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Desktop tubelight pill (inside header) ── */}
        <div className="hidden md:block">
          <NavBar items={navItems} />
        </div>

        {/* ── US location banner — inside fixed header so it’s never hidden behind it ── */}
        <USLocationBanner />
      </header>

      {/* ── Mobile slide-down drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -8  }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 z-[49] bg-[#0a1628]/98 backdrop-blur-md border-b border-blue-900/40 shadow-2xl md:hidden"
            style={{ top: "57px" }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50 transition-colors text-sm font-medium"
                >
                  <item.icon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}

              <div className="pt-2 mt-1 border-t border-blue-900/40 space-y-2">
                <button
                  onClick={() => { setShowTrackModal(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50 transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  Track Order
                </button>
                <Link
                  href="/get-quote"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
                >
                  Get Free Quote →
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom tubelight pill (icons only) ── */}
      <div className="md:hidden">
        <NavBar items={navItems} />
      </div>

      {/* ── Track Order Modal ── */}
      <AnimatePresence>
        {showTrackModal && <TrackOrderModal onClose={() => setShowTrackModal(false)} />}
      </AnimatePresence>
    </>
  );
}
