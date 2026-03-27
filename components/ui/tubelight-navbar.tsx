"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine active tab from current URL path
  const activeTab = items.find((item) => {
    if (item.url === "/") return pathname === "/";
    return pathname.startsWith(item.url);
  })?.name ?? items[0].name;

  const handleNavClick = (item: NavItem) => {
    // If already on this page, scroll to top smoothly
    if (pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-30 mb-6 sm:pt-6 pointer-events-none",
        className
      )}
    >
      <div suppressHydrationWarning className="flex items-center gap-1 sm:gap-3 bg-white/10 border border-white/20 backdrop-blur-lg py-1 px-1 sm:px-1 rounded-full shadow-lg pointer-events-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => handleNavClick(item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-2 sm:px-6 py-2 rounded-full transition-colors",
                "text-white/80 hover:text-white",
                isActive && "bg-white/20 text-white"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  suppressHydrationWarning
                  className="absolute inset-0 w-full bg-orange-500/20 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-400 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-orange-400/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-orange-400/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-orange-400/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
