"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useTheme } from "next-themes";
import { Home, Info, Wrench, HelpCircle, Phone, Star } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Truck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { name: "Home",     url: "/",        icon: Home },
  { name: "About",    url: "/about",   icon: Info },
  { name: "Services", url: "/services",icon: Wrench },
  { name: "Reviews",  url: "/reviews", icon: Star },
  { name: "FAQ",      url: "/faq",     icon: HelpCircle },
  { name: "Contact",  url: "/contact", icon: Phone },
];

export function SiteNavbar() {
  const { resolvedTheme } = useTheme();

  // We no longer need JS to compute the header gradient — it's handled by
  // .site-header / html.light .site-header in globals.css, which picks up the
  // html.light class set by the blocking script before first paint.
  // We only need JS here to reactively update the logo text class after hydration.
  const [isLight, setIsLight] = useState(false);

  useLayoutEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  useEffect(() => {
    if (resolvedTheme) setIsLight(resolvedTheme === "light");
  }, [resolvedTheme]);

  return (
    <header
      suppressHydrationWarning
      className="site-header fixed top-0 left-0 right-0 z-50"
    >
      {/* Top bar — logo left, actions right */}
      <div className="hidden md:flex items-center justify-between px-8 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-orange-400" />
          <span className={`site-header-logo text-lg font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
            WESAuto<span className="text-orange-400">Transport</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/get-quote">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-sm">
              Get Free Quote →
            </Button>
          </Link>
        </div>
      </div>

      {/* Tubelight nav pill — centred */}
      <NavBar items={navItems} />
    </header>
  );
}
