"use client";

import { useEffect, useState } from "react";
import { DashboardCards } from "@/components/DashboardCards";
import { LeadTable } from "@/components/LeadTable";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CRMDashboard() {
  const [brokerId, setBrokerId] = useState<string | undefined>(undefined);
  const [brokerEmail, setBrokerEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setBrokerId(data.user.id);
        setBrokerEmail(data.user.email ?? "");
      }
    });
  }, []);

  const brokerName = brokerEmail.split("@")[0] ?? "Broker";

  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Broker Terminal</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          {greeting()},{" "}
          <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent capitalize">
            {brokerEmail ? brokerName : "—"}
          </span>
        </h1>
        <p className="text-blue-500 text-sm mt-1">Here&apos;s your personal pipeline for today.</p>
      </motion.div>

      {/* Stats filtered to this broker */}
      <DashboardCards brokerId={brokerId} />

      {/* My leads table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">My Leads</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              active pipeline
            </span>
          </div>
          <Link
            href="/crm/new-leads"
            className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Claim new leads <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {brokerId ? (
          <LeadTable brokerId={brokerId} detailCtx="mine" basePath="/crm/leads" />
        ) : (
          <div className="h-40 rounded-2xl bg-blue-900/10 border border-blue-900/30 animate-pulse" />
        )}
      </div>
    </div>
  );
}
