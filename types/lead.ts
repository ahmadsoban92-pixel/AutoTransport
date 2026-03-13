export type LeadStatus = "New" | "Contacted" | "Quoted" | "Booked" | "Lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  origin_zip: string;
  destination_zip: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  transport_type: "Open" | "Enclosed";
  vehicle_condition: "Running" | "Non-Running";
  status: LeadStatus;
  created_at: string;
}
