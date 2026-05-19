import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { sendMail, manualPaymentHtml } from "@/lib/emailService";

// Replaces Stripe — sends payment instructions via email.
// Broker clicks "Send Payment Instructions" in CRM after finalising price.
// Customer pays via PayPal/bank, broker manually marks as paid.

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  let body: { leadId?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { leadId } = body;
  if (!leadId) return NextResponse.json({ error: "leadId is required" }, { status: 400 });

  const supabase = getAdminClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("id,name,email,origin_zip,destination_zip,vehicle_year,vehicle_make,vehicle_model,finalized_price,stripe_payment_status")
    .eq("id", leadId)
    .single();

  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  if (!lead.finalized_price || lead.finalized_price <= 0) {
    return NextResponse.json(
      { error: "Set a finalized price before sending payment instructions." },
      { status: 422 }
    );
  }

  if (lead.stripe_payment_status === "paid") {
    return NextResponse.json({ error: "Payment already confirmed." }, { status: 409 });
  }

  const vehicle = `${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}`;
  const route   = `${lead.origin_zip} → ${lead.destination_zip}`;

  await sendMail({
    to:      lead.email,
    toName:  lead.name,
    subject: `Your WESAutoTransport quote is ready — $${lead.finalized_price.toFixed(2)}`,
    html:    manualPaymentHtml(lead.name, lead.finalized_price, vehicle, route, lead.id),
  });

  return NextResponse.json({ success: true, message: "Payment instructions sent to customer." }, { status: 200 });
}
