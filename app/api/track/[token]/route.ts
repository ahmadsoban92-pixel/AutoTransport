import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import type { ShipmentTrackingData } from "@/types/lead";

// Public endpoint — no auth required.
// Only returns PII-safe fields. Never exposes email, phone, or broker data.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Invalid tracking token" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      "status,carrier_name,estimated_delivery,shipment_notes,vehicle_year,vehicle_make,vehicle_model,origin_zip,destination_zip,created_at"
    )
    .eq("tracking_token", token)
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const tracking: ShipmentTrackingData = {
    status:             lead.status,
    carrier_name:       lead.carrier_name  ?? null,
    estimated_delivery: lead.estimated_delivery ?? null,
    shipment_notes:     lead.shipment_notes ?? null,
    vehicle_year:       String(lead.vehicle_year),
    vehicle_make:       lead.vehicle_make,
    vehicle_model:      lead.vehicle_model,
    origin_zip:         lead.origin_zip,
    destination_zip:    lead.destination_zip,
    created_at:         lead.created_at,
  };

  return NextResponse.json(tracking, {
    status: 200,
    headers: {
      // No cache — status must always reflect the latest DB value
      "Cache-Control": "no-store",
    },
  });
}
