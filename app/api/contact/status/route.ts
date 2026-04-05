import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireApiAuth } from "@/lib/requireApiAuth";

const VALID_STATUSES = ["Unhandled", "Picked Up", "Solved"] as const;
type InquiryStatus = (typeof VALID_STATUSES)[number];

// PATCH /api/contact/status — update inquiry status (CRM use only)
export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { id, status } = await request.json() as { id?: string; status?: string };

    if (!id || !status || !VALID_STATUSES.includes(status as InquiryStatus)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("contact_inquiries")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
