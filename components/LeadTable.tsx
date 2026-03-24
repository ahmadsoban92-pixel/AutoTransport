"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { Search, Filter, ArrowUpDown, Eye, User2 } from "lucide-react";

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Booked: "bg-green-500/20 text-green-400 border-green-500/30",
  Lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Booked", "Lost"];

interface Props {
  basePath?: string;
  brokerId?: string;   // if set, filter to this broker's leads only
  detailCtx?: string;  // ctx param to append to detail links (claim|mine|view)
  showBrokerCol?: boolean; // show assigned broker column
}

export function LeadTable({ basePath = "/leads", brokerId, detailCtx = "view", showBrokerCol = false }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (brokerId) {
        query = query.eq("assigned_broker_id", brokerId);
      }
      const { data, error } = await query;
      if (!error && data) setLeads(data as Lead[]);
      setLoading(false);
    }
    fetchLeads();
  }, [brokerId]);

  const filtered = leads
    .filter((l) => {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.origin_zip.includes(q) ||
        l.destination_zip.includes(q)
      );
    })
    .filter((l) => statusFilter === "All" || l.status === statusFilter)
    .sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortDesc ? tb - ta : ta - tb;
    });

  const goToDetail = (id: string) => router.push(`${basePath}/${id}?ctx=${detailCtx}`);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, ZIP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-blue-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "All")}
            className="rounded-lg bg-blue-950/40 border border-blue-800/40 text-sm text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            <option value="All" className="bg-blue-950">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-blue-950">{s}</option>
            ))}
          </select>
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-sm text-blue-300 hover:text-white hover:border-orange-500/40 transition-all"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortDesc ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-blue-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-950/60 border-b border-blue-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider hidden sm:table-cell">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider hidden lg:table-cell">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Status</th>
                {showBrokerCol && <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider hidden lg:table-cell">Broker</th>}
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-800/20">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-blue-900/40 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-blue-500">
                    No leads found. {search || statusFilter !== "All" ? "Try adjusting your filters." : ""}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-blue-950/20 transition-colors cursor-pointer"
                    onClick={() => goToDetail(lead.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="text-white font-medium">{lead.name}</div>
                      <div className="text-blue-400 text-xs">{lead.email}</div>
                    </td>
                    <td className="px-4 py-4 text-blue-300 hidden md:table-cell">{lead.phone}</td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-blue-200">{lead.origin_zip}</span>
                      <span className="text-blue-500 mx-1">→</span>
                      <span className="text-blue-200">{lead.destination_zip}</span>
                    </td>
                    <td className="px-4 py-4 text-blue-300 hidden lg:table-cell">
                      {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-500/20 text-gray-400 border-gray-500/30">
                        {lead.transport_type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    {showBrokerCol && (
                      <td className="px-4 py-4 text-blue-400 text-xs hidden lg:table-cell">
                        {lead.assigned_broker_email ? (
                          <span className="flex items-center gap-1">
                            <User2 className="w-3 h-3" />
                            {lead.assigned_broker_email}
                          </span>
                        ) : (
                          <span className="text-blue-700 italic">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-4 text-blue-400 text-xs hidden lg:table-cell">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); goToDetail(lead.id); }}
                        className="p-1.5 rounded-lg bg-blue-900/40 text-blue-400 hover:text-orange-400 hover:bg-orange-500/20 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="mt-4 text-xs text-blue-500 text-right">
          Showing {filtered.length} of {leads.length} leads
        </div>
      )}
    </div>
  );
}
