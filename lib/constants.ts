// lib/constants.ts
// Centralized shared constants — prevents duplication across CRM components
import type { LeadStatus } from "@/types/lead";

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  New:       "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Quoted:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Booked:    "bg-green-500/20  text-green-400  border-green-500/30",
  Lost:      "bg-red-500/20    text-red-400    border-red-500/30",
};

export const ALL_LEAD_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Quoted", "Booked", "Lost",
];

export const LEAD_STATUS_DOT_COLORS: Record<LeadStatus, string> = {
  New:       "bg-orange-400",
  Contacted: "bg-yellow-400",
  Quoted:    "bg-purple-400",
  Booked:    "bg-green-400",
  Lost:      "bg-red-400",
};
