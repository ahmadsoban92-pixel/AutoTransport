"use client";

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
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar — gradient fades to transparent in BOTH modes */}
      <div
        className={[
          "hidden md:flex items-center justify-between px-8 py-3",
          // Dark mode: fade from dark navy → transparent
          "dark:bg-gradient-to-b dark:from-[#060d1f] dark:via-[#060d1f]/90 dark:to-transparent",
          // Light mode: fade from white → transparent  
          "bg-gradient-to-b from-white/95 via-white/80 to-transparent",
        ].join(" ")}
      >
        <Link href="/" className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-orange-400" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
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
      {/* Tubelight navbar pill */}
      <NavBar items={navItems} />
    </header>
  );
}
