"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Lead } from "@/types/lead";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Inbox, ArrowRight, Car, MapPin, Phone, AlertCircle } from "lucide-react";

export default function NewLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      // Only unclaimed leads: status=New AND no broker assigned
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "New")
        .is("assigned_broker_id", null)
        .order("created_at", { ascending: false });

      if (!error && data) setLeads(data as Lead[]);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Inbox className="w-6 h-6 text-orange-400" />
          New Leads
        </h1>
        <p className="text-blue-400 text-sm mt-1">
          Unclaimed leads — claim one to assign it to yourself and begin working it.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-blue-900/20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-white font-semibold text-lg">No new leads right now</h2>
          <p className="text-blue-400 text-sm mt-2 max-w-xs">
            All unclaimed leads have been picked up. Check back later or view All Leads.
          </p>
        </div>
      )}

      {!loading && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => router.push(`/crm/leads/${lead.id}?ctx=claim`)}
              className="cursor-pointer p-5 rounded-2xl border border-blue-800/30 bg-[#0a1628] hover:border-orange-500/50 hover:bg-blue-950/60 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      New
                    </span>
                    <span className="text-white font-semibold truncate">{lead.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-blue-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" /> {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {lead.origin_zip} → {lead.destination_zip}
                    </span>
                    <span className="text-blue-600">
                      {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Claim <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
