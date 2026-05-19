import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { getStripeClient } from "@/lib/stripeClient";

// IMPORTANT: Next.js App Router does not parse the body for webhooks.
// We read the raw bytes manually so Stripe can verify the signature.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || webhookSecret === "whsec_REPLACE_ME") {
    console.error("[webhook] Missing stripe-signature or webhook secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  // Read raw body for signature verification
  const rawBody = await request.arrayBuffer();
  const bodyBuffer = Buffer.from(rawBody);

  let event;
  try {
    event = stripe.webhooks.constructEvent(bodyBuffer, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle relevant events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      metadata?: { leadId?: string };
      payment_status?: string;
    };

    const leadId = session.metadata?.leadId;
    if (!leadId) {
      console.warn("[webhook] checkout.session.completed missing leadId metadata");
      return NextResponse.json({ received: true });
    }

    const supabase = getAdminClient();

    const { error } = await supabase
      .from("leads")
      .update({
        status:                "Booked",
        stripe_payment_status: "paid",
      })
      .eq("id", leadId);

    if (error) {
      console.error("[webhook] Failed to update lead:", error.message);
      // Still return 200 to Stripe — we don't want retries for DB errors
      // Log and handle via alerting/monitoring
    } else {
      console.info(`[webhook] Lead ${leadId} marked as Booked (payment confirmed)`);
    }
  }

  if (event.type === "charge.refunded") {
    // Handle refunds — mark payment status
    const charge = event.data.object as { metadata?: { leadId?: string } };
    const leadId = charge.metadata?.leadId;
    if (leadId) {
      const supabase = getAdminClient();
      await supabase
        .from("leads")
        .update({ stripe_payment_status: "refunded" })
        .eq("id", leadId);
    }
  }

  // Always return 200 quickly to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}
