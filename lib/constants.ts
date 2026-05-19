// lib/constants.ts
import type { LeadStatus } from "@/types/lead";

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  New:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Contacted:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Quoted:       "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Booked:       "bg-green-500/20  text-green-400  border-green-500/30",   // internal — payment confirmed
  Dispatched:   "bg-cyan-500/20   text-cyan-400   border-cyan-500/30",
  "In Transit": "bg-blue-500/20   text-blue-300   border-blue-500/30",
  Delivered:    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Lost:         "bg-red-500/20    text-red-400    border-red-500/30",
};

export const ALL_LEAD_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Quoted", "Booked", "Dispatched", "In Transit", "Delivered", "Lost",
];

export const LEAD_STATUS_DOT_COLORS: Record<LeadStatus, string> = {
  New:          "bg-orange-400",
  Contacted:    "bg-yellow-400",
  Quoted:       "bg-purple-400",
  Booked:       "bg-green-400",
  Dispatched:   "bg-cyan-400",
  "In Transit": "bg-blue-400",
  Delivered:    "bg-emerald-400",
  Lost:         "bg-red-400",
};
