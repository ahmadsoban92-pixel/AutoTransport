import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { leadSchema } from "@/lib/validators";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendMail, quoteReceivedHtml } from "@/lib/emailService";
import {
  sendSms,
  smsQuoteReceived,
  smsHighValueLead,
} from "@/lib/smsService";
import { nanoid } from "nanoid";

// High-value transport types that trigger a broker SMS alert
const HIGH_VALUE_TYPES = new Set(["Enclosed", "Expedited"]);

// Extend the front-end schema for the API context
const apiLeadSchema = leadSchema.extend({
  car_image_url: z.string().url().optional().nullable(),
});

export async function POST(request: NextRequest) {
  // Rate-limit: 5 quote submissions per IP per minute
  const ip = getClientIp(request);
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

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

    // Generate a cryptographically unique tracking token for this shipment
    const trackingToken = nanoid(16);

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
        vehicle_year:      data.vehicle_year,
        transport_type:    data.transport_type,
        vehicle_condition: data.vehicle_condition,
        car_image_url:     data.car_image_url ?? null,
        status:            "New",
        tracking_token:    trackingToken,
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

    // ── Fire-and-forget notifications (non-blocking) ──────────────────────────
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const trackingUrl = `${appUrl}/track/${trackingToken}`;
    const vehicle     = `${data.vehicle_year} ${data.vehicle_make} ${data.vehicle_model}`;
    const route       = `${data.origin_zip} → ${data.destination_zip}`;

    // 1. Customer confirmation email with tracking link
    sendMail({
      to:      data.email,
      toName:  data.name,
      subject: "We received your quote request — WESAutoTransport",
      html:    quoteReceivedHtml(data.name, trackingUrl, trackingToken),
      text:    `Hi ${data.name}, we received your quote request. Track: ${trackingUrl}`,
    }).catch((e) => console.error("[leads/POST] email error:", e));

    // 2. Customer SMS (quote received)
    sendSms(data.phone, smsQuoteReceived(data.name, trackingUrl))
      .catch((e) => console.error("[leads/POST] sms error:", e));

    // 3. Broker SMS for high-value transport types
    const brokerPhone = process.env.TWILIO_BROKER_PHONE;
    if (brokerPhone && HIGH_VALUE_TYPES.has(data.transport_type)) {
      sendSms(brokerPhone, smsHighValueLead(data.transport_type, vehicle, route))
        .catch((e) => console.error("[leads/POST] broker sms error:", e));
    }

    return NextResponse.json(
      { success: true, id: lead.id, trackingToken },
      { status: 201 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "WESAutoTransport Leads API v1.0" });
}
