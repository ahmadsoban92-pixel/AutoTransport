"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { Search, Filter, ArrowUpDown, Eye, User2, ChevronLeft, ChevronRight } from "lucide-react";
import { LEAD_STATUS_COLORS, ALL_LEAD_STATUSES } from "@/lib/constants";

const PAGE_SIZE = 25;

interface Props {
  basePath?:      string;
  brokerId?:      string;   // if set, filter to this broker's leads only
  detailCtx?:     string;   // ctx param to append to detail links (claim|mine|view)
  showBrokerCol?: boolean;  // show assigned broker column
}

export function LeadTable({
  basePath     = "/leads",
  brokerId,
  detailCtx    = "view",
  showBrokerCol = false,
}: Props) {
  const router = useRouter();

  const [leads,        setLeads]        = useState<Lead[]>([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [sortDesc,     setSortDesc]     = useState(true);
  const [page,         setPage]         = useState(0);

  // Reset to page 0 whenever filters/sort change
  useEffect(() => { setPage(0); }, [search, statusFilter, sortDesc, brokerId]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: !sortDesc })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (brokerId)      query = query.eq("assigned_broker_id", brokerId);
      if (statusFilter !== "All") query = query.eq("status", statusFilter);
      if (search.trim()) {
        // Supabase doesn't support multi-column OR with ilike in one call cleanly,
        // so we filter client-side on the already-paginated smaller result set.
        // For large DBs, replace with a DB full-text search index later.
      }

      const { data, error, count } = await query;
      if (!error && data) {
        setLeads(data as Lead[]);
        setTotalCount(count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [brokerId, statusFilter, sortDesc, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Client-side search filter applied on the already-fetched page
  const filtered = search.trim()
    ? leads.filter((l) => {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.origin_zip.includes(q) ||
          l.destination_zip.includes(q)
        );
      })
    : leads;

  const totalPages  = Math.ceil(totalCount / PAGE_SIZE);
  const hasPrev     = page > 0;
  const hasNext     = page < totalPages - 1;

  const goToDetail  = (id: string) => router.push(`${basePath}/${id}?ctx=${detailCtx}`);

  return (
    <div>
      {/* ── Controls ─────────────────────────────────────────────── */}
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
            {ALL_LEAD_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-blue-950">{s}</option>
            ))}
          </select>
          <button
            onClick={() => setSortDesc(!sortDesc)}
            aria-label={`Sort by ${sortDesc ? "oldest" : "newest"} first`}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-sm text-blue-300 hover:text-white hover:border-orange-500/40 transition-all"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortDesc ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
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
                [...Array(PAGE_SIZE > 10 ? 8 : PAGE_SIZE)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(showBrokerCol ? 9 : 8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-blue-900/40 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={showBrokerCol ? 9 : 8} className="px-4 py-12 text-center text-blue-500">
                    No leads found.{" "}
                    {search || statusFilter !== "All" ? "Try adjusting your filters." : ""}
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
                      <span className="text-blue-500 mx-1">to</span>
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
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${LEAD_STATUS_COLORS[lead.status]}`}>
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
                        aria-label={`View lead for ${lead.name}`}
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

      {/* ── Footer: count + pagination ───────────────────────────── */}
      {!loading && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-blue-500">
            {totalCount === 0
              ? "No leads"
              : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, totalCount)} of ${totalCount} leads`}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
                aria-label="Previous page"
                className="p-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-400 hover:text-white hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-blue-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                aria-label="Next page"
                className="p-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-400 hover:text-white hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
