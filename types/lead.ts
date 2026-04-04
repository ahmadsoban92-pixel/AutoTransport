export type LeadStatus = "New" | "Contacted" | "Quoted" | "Booked" | "Lost";

export type TransportType =
  | "Open"
  | "Enclosed"
  | "Expedited"
  | "Door-to-Door"
  | "Snowbird/Seasonal";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  origin_zip: string;
  destination_zip: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | string;
  transport_type: TransportType;
  vehicle_condition?: string;
  status: LeadStatus;
  created_at: string;
  assigned_broker_id?: string | null;
  assigned_broker_email?: string | null;
  car_image_url?: string | null;
  finalized_price?: number | null;
}

