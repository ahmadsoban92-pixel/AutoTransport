import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { leadSchema } from "@/lib/validators";
import { z } from "zod";

// Extend the front-end schema for the API context:
// vehicle_year comes in as a string from the form; the API co-erce it to a number
// for storage consistency. All other fields use the same rules as the client-side schema.
const apiLeadSchema = leadSchema.extend({
  car_image_url: z.string().url().optional().nullable(),
});

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = getAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Server misconfiguration — contact support" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const validation = apiLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name:              data.name,
        email:             data.email,
        phone:             data.phone,
        origin_zip:        data.origin_zip,
        destination_zip:   data.destination_zip,
        vehicle_make:      data.vehicle_make,
        vehicle_model:     data.vehicle_model,
        vehicle_year:      data.vehicle_year,  // stored as text — matches DB column type
        transport_type:    data.transport_type,
        vehicle_condition: data.vehicle_condition,
        car_image_url:     data.car_image_url ?? null,
        status:            "New",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to save lead. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "WESAutoTransport Leads API v1.0" });
}
