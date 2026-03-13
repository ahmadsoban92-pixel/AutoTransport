"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Truck, LayoutDashboard, Users, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  // Login page — no nav at all
  if (pathname === "/crm/login") {
    return <>{children}</>;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#060d1f]">

      {/* ===== TOP NAVBAR ===== */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#0a1628]/95 backdrop-blur-sm border-b border-blue-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/crm/dashboard" className="flex items-center gap-2 shrink-0">
            <Truck className="w-5 h-5 text-orange-400" />
            <div>
              <span className="text-sm font-bold text-white">AutoTransportPro</span>
              <span className="hidden sm:inline text-xs text-orange-400 font-semibold ml-1.5">Broker Terminal</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/crm/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/crm/dashboard")
                ? "bg-blue-900/60 text-white border border-blue-700/40"
                : "text-blue-300 hover:text-white hover:bg-blue-900/40"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/crm/leads"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/crm/leads")
                ? "bg-blue-900/60 text-white border border-blue-700/40"
                : "text-blue-300 hover:text-white hover:bg-blue-900/40"
                }`}
            >
              <Users className="w-4 h-4" />
              Leads
            </Link>
          </nav>

          {/* Theme toggle + Sign out */}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                document.cookie = "crm-auth=; path=/; max-age=0; SameSite=Lax";
                window.location.href = "/crm/login";
              }}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-red-400 transition-colors px-2 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT — offset by navbar height ===== */}
      <main suppressHydrationWarning className="pt-16 min-h-screen">
        {children}
      </main>

    </div>
  );
}
