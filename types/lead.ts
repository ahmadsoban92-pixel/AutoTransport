// types/lead.ts — canonical type definitions for the WESAutoTransport domain

export type LeadStatus = "New" | "Contacted" | "Quoted" | "Booked" | "Dispatched" | "In Transit" | "Delivered" | "Lost";

export type TransportType =
  | "Open"
  | "Enclosed"
  | "Expedited"
  | "Door-to-Door"
  | "Snowbird/Seasonal";

export interface Lead {
  id:                     string;
  name:                   string;
  email:                  string;
  phone:                  string;
  origin_zip:             string;
  destination_zip:        string;
  vehicle_make:           string;
  vehicle_model:          string;
  vehicle_year:           string;   // stored as TEXT in DB; always treat as string
  transport_type:         TransportType;
  vehicle_condition?:     string;
  status:                 LeadStatus;
  created_at:             string;
  assigned_broker_id?:    string | null;
  assigned_broker_email?: string | null;
  car_image_url?:         string | null;
  finalized_price?:       number | null;

  // ── Enhancement columns (added via migration 001) ──────────────────────────
  stripe_session_id?:     string | null;
  stripe_payment_status?: "unpaid" | "paid" | "refunded" | null;
  tracking_token?:        string | null;
  carrier_name?:          string | null;
  estimated_delivery?:    string | null;
  shipment_notes?:        string | null;
}

// ─── Contact Inquiries ────────────────────────────────────────────────────────

export type InquiryStatus = "Unhandled" | "Picked Up" | "Solved";

export interface Inquiry {
  id:         string;
  name:       string;
  phone:      string;
  email:      string | null;
  message:    string;
  created_at: string;
  status?:    InquiryStatus;
}

// ─── Tracker (public-safe subset exposed by /api/track/[token]) ───────────────

export interface ShipmentTrackingData {
  status:             LeadStatus;
  carrier_name:       string | null;
  estimated_delivery: string | null;
  shipment_notes:     string | null;
  vehicle_year:       string;
  vehicle_make:       string;
  vehicle_model:      string;
  origin_zip:         string;
  destination_zip:    string;
  created_at:         string;
}
