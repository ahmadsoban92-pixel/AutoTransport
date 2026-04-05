import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireApiAuth } from "@/lib/requireApiAuth";

const MAX_SIZE  = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

/**
 * POST /api/upload-car-image
 * Requires: Authorization: Bearer <supabase_jwt>
 * Accepts: multipart/form-data with a "file" field (JPG, PNG, WebP, ≤5MB)
 * Returns: { url: string } — 1-year signed URL for broker access
 */
export async function POST(request: NextRequest) {
  // Only authenticated brokers may upload
  const auth = await requireApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
    }

    const ext = EXT_MAP[file.type] ?? "jpg";
    // Prefix with userId so files can be scoped to the uploader in future
    const fileName = `${auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const supabase = getAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("car-images")
      .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from("car-images")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: "Failed to generate image URL" }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl }, { status: 201 });
  } catch (err) {
    console.error("upload-car-image error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
