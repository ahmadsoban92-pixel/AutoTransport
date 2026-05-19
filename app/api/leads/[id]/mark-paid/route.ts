import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireApiAuth } from "@/lib/requireApiAuth";

// Broker manually marks a lead as paid after verifying the bank/PayPal transfer.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  const { id: leadId } = await params;

  const supabase = getAdminClient();

  const { error } = await supabase
    .from("leads")
    .update({
      stripe_payment_status: "paid",
      status:                "Booked",
    })
    .eq("id", leadId);

  if (error) {
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
