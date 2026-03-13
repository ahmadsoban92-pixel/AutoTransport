"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun, Truck, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

const companyLinks = [
  {
    group: "Services",
    items: [
      { title: "Open Transport", href: "/services" },
      { title: "Enclosed Transport", href: "/services" },
      { title: "Expedited Shipping", href: "/services" },
      { title: "Non-Running Vehicles", href: "/services" },
      { title: "Door-to-Door Delivery", href: "/services" },
    ],
  },
];

const resourceLinks = [
  {
    group: "Resources",
    items: [
      { title: "Get a Quote", href: "/get-quote" },
      { title: "How It Works", href: "/#how-it-works" },
      { title: "FAQ", href: "/faq" },
      { title: "About Us", href: "/about" },
      { title: "Reviews", href: "/reviews" },
      { title: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="py-16 border-t border-blue-900/30 bg-[#060d1f]">
      <div className="mx-auto max-w-6xl px-6">
        {/* Logo + tagline */}
        <div className="mb-12 flex flex-col md:flex-row gap-8 justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-6 h-6 text-orange-400" />
              <span className="text-xl font-bold text-white">AutoTransport<span className="text-orange-400">Pro</span></span>
            </div>
            <p className="text-xs text-orange-300 font-semibold mb-3">WES Solutions</p>
            <p className="text-sm text-blue-300 leading-relaxed">
              America&apos;s most trusted auto transport brokerage. We connect you with verified carriers across the nation for safe, reliable vehicle shipping.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <Phone className="w-4 h-4 text-orange-400" />
                <a href="tel:+923059846727" className="hover:text-white transition-colors">+92 305 9846727 (Faisal Masood, HR)</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <Mail className="w-4 h-4 text-orange-400" />
                <a href="mailto:info@wessolutions.com" className="hover:text-white transition-colors">info@wessolutions.com</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>16 GCP, near UCP Lahore</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Us</a>
              </div>
            </div>
          </div>

          <div className="grid gap-8 grid-cols-2">
            {[...companyLinks, ...resourceLinks].map((group, index) => (
              <div key={index} className="space-y-3 text-sm">
                <span className="block font-semibold text-white">{group.group}</span>
                {group.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="text-blue-300 hover:text-orange-400 block duration-150"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-blue-900/30 pt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-blue-300">All systems operational</span>
          </div>
          <p className="text-xs text-blue-500">
            © {new Date().getFullYear()} AutoTransportPro · WES Solutions. All rights reserved.
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}

const themes = [
  { key: "system", icon: Monitor, label: "System theme" },
  { key: "light", icon: Sun, label: "Light theme" },
  { key: "dark", icon: Moon, label: "Dark theme" },
];

const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark" | "system") => {
      setTheme(themeKey);
    },
    [setTheme]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "relative isolate flex h-8 rounded-full bg-blue-950 p-1 ring-1 ring-blue-800 gap-1",
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;
        return (
          <button
            aria-label={label}
            className={cn(
              "relative h-6 w-8 rounded-full transition-all duration-200 flex items-center justify-center",
              isActive ? "bg-orange-500/30 ring-1 ring-orange-500/50" : "hover:bg-white/10"
            )}
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark" | "system")}
            type="button"
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5",
                isActive ? "text-orange-400" : "text-blue-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
