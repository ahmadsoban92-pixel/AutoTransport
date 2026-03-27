import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const apiLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  origin_zip: z.string().length(5),
  destination_zip: z.string().length(5),
  vehicle_make: z.string().min(1),
  vehicle_model: z.string().min(1),
  vehicle_year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  transport_type: z.enum([
    "Open",
    "Enclosed",
    "Expedited",
    "Door-to-Door",
    "Snowbird/Seasonal",
  ] as const),
  vehicle_condition: z.enum(["Running", "Non-Running"] as const),
});

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.startsWith("your_")) {
      return NextResponse.json(
        { error: "Supabase is not configured. Please add credentials to .env.local" },
        { status: 503 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();

    const validation = apiLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        origin_zip: data.origin_zip,
        destination_zip: data.destination_zip,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: String(data.vehicle_year),
        transport_type: data.transport_type,
        // vehicle_condition: add this back once the column exists in Supabase
        status: "New",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json(
        { error: error.message || "Failed to save lead. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "WESAutoTransport Leads API v1.0" });
}
