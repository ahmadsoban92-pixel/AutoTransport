import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireApiAuth } from "@/lib/requireApiAuth";

// GET /api/contact — list all contact inquiries (CRM broker use only)
export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ inquiries: data }, { status: 200 });
}

// POST /api/contact — save a contact inquiry (public contact form — no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "name, phone and message are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("contact_inquiries")
      .insert([{ name: name.trim(), phone: phone.trim(), email: email?.trim() || null, message: message.trim() }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
