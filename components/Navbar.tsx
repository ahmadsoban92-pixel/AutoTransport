"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

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

// ─── Inline desktop nav pill (contained in header) ────────────────────────────

function DesktopNavPill({ onTrack }: { onTrack: () => void }) {
  const pathname = usePathname();

  const activeTab = navItems.find((item) => {
    if (item.url === "/") return pathname === "/";
    return pathname.startsWith(item.url);
  })?.name ?? navItems[0].name;

  return (
    <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.name;
        return (
          <Link
            key={item.name}
            href={item.url}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200",
              isActive
                ? "text-gray-900 dark:text-white bg-orange-500/20"
                : "text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-b-full" />
            )}
            <span>{item.name}</span>
          </Link>
        );
      })}

      {/* Separator */}
      <span className="w-px h-4 bg-gray-300 dark:bg-white/25 mx-1 flex-shrink-0" />

      {/* Track Order */}
      <button
        onClick={onTrack}
        className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold px-4 py-1.5 rounded-full transition-colors text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 hover:bg-orange-500/10 whitespace-nowrap"
      >
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        Track Order
      </button>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function SiteNavbar() {
  const { resolvedTheme } = useTheme();
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close drawer when viewport widens past md breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {/* ── Fixed header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#fdf6e3]/90 dark:bg-[#060d1f]/90 backdrop-blur-md border-b border-transparent dark:border-blue-900/30"
      >
        {/* ── Desktop: single row ── */}
        <div className="hidden md:flex items-center px-8 py-3 relative">
          {/* Left: logo + theme toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-orange-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                WESAuto<span className="text-orange-400">Transport</span>
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Center: nav pill — absolutely positioned so it's truly centered in the header */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <DesktopNavPill onTrack={() => setShowTrackModal(true)} />
          </div>

          {/* Right spacer — keeps logo from drifting */}
          <div className="ml-auto" />
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

        {/* ── US location banner — inside fixed header so it's never hidden behind it ── */}
        <USLocationBanner />
        {/* Bottom fade — CSS class avoids html.light gradient overrides that zero out Tailwind bg-gradient */}
        <div aria-hidden="true" className="site-header-fade" />
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
