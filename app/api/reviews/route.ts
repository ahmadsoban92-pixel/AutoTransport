import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

// POST /api/reviews — submit a new review (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { author_name, rating, content } = body as {
      author_name?: string;
      rating?: unknown;
      content?: string;
    };

    if (
      !author_name?.trim() ||
      !content?.trim() ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({ author_name: author_name.trim(), rating, content: content.trim() })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Review insert error:", error.message);
      // Don't leak the raw DB error message to the client
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/reviews — public read (anon key, RLS allows select)
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ reviews: [] });
    }

    // Use anon key for public reads — service role not needed here
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("reviews")
      .select("id, author_name, rating, content, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ reviews: [] });
    return NextResponse.json({ reviews: data });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}
