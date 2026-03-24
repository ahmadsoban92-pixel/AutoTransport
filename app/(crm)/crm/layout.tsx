"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck, LayoutDashboard, Users, LogOut,
  MessageCircle, Sparkles, ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: false, pulse: false },
  { href: "/crm/new-leads", label: "New Leads", icon: Sparkles, accent: true, pulse: true },
  { href: "/crm/leads", label: "All Leads", icon: Users, accent: false, pulse: false },
  { href: "/crm/inquiries", label: "Inquiries", icon: MessageCircle, accent: false, pulse: false },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (pathname === "/crm/login") return <>{children}</>;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.cookie = "crm-auth=; path=/; max-age=0; SameSite=Lax";
    window.location.href = "/crm/login";
  };

  return (
    // CRM is now fully theme-aware — light/dark mode both work
    <div suppressHydrationWarning className="min-h-screen bg-[#050c1a] flex">

      {/* ===== SIDEBAR (desktop) ===== */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-[#080f20] to-[#060d1a] border-r border-blue-900/30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-blue-900/30">
          <Link href="/crm/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-widest leading-none">Broker</p>
              <p className="text-sm font-bold text-white leading-tight">Terminal</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? item.accent
                      ? "bg-orange-500/15 text-orange-300 border border-orange-500/25 shadow-sm"
                      : "bg-blue-500/10 text-white border border-blue-500/20 shadow-sm"
                    : "text-blue-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`relative flex-shrink-0 ${active && item.accent ? "text-orange-400" : active ? "text-blue-400" : "text-blue-600 group-hover:text-blue-400"}`}>
                  <Icon className="w-4 h-4" />
                  {item.pulse && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-blue-900/30 space-y-1">
          {/* ThemeToggle controls global theme (marketing site). CRM stays dark via data-force-dark. */}
          <div className="px-4 py-1.5">
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOPBAR ===== */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#080f20]/95 backdrop-blur-md border-b border-blue-900/30 h-14 flex items-center px-4 gap-3">
        <Link href="/crm/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Broker Terminal</span>
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active ? "bg-blue-900/60 text-white" : "text-blue-400 hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
                {item.pulse && (
                  <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
        <button onClick={handleSignOut} className="shrink-0 text-blue-500 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main suppressHydrationWarning className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        {/* Subtle grid background */}
        <div className="fixed inset-0 md:left-64 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Ambient glows */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-64 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
