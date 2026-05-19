import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { sendSms, smsBrokerAssigned } from "@/lib/smsService";

interface ClaimBody {
  brokerId?:    string;
  brokerEmail?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Broker-only endpoint
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  const { id: leadId } = await params;

  let body: ClaimBody = {};
  try {
    body = await request.json();
  } catch {
    // body is optional — we can fall back to the authenticated user's info
  }

  const supabase = getAdminClient();

  // Fetch current lead to get customer phone + tracking token
  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("id,name,phone,tracking_token,assigned_broker_id,status")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (lead.assigned_broker_id) {
    return NextResponse.json(
      { error: "Lead is already claimed by another broker." },
      { status: 409 }
    );
  }

  // Claim the lead
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      assigned_broker_id:    body.brokerId    ?? auth.userId,
      assigned_broker_email: body.brokerEmail ?? auth.email,
      status:                lead.status === "New" ? "Contacted" : lead.status,
    })
    .eq("id", leadId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to claim lead" },
      { status: 500 }
    );
  }

  // Fire-and-forget: notify customer via SMS
  if (lead.tracking_token && lead.phone) {
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const trackingUrl = `${appUrl}/track/${lead.tracking_token}`;
    sendSms(lead.phone, smsBrokerAssigned(lead.name, trackingUrl))
      .catch((e) => console.error("[claim] sms error:", e));
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
