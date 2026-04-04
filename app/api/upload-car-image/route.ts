import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST /api/upload-car-image
 * Accepts a multipart form with a "file" field.
 * Uploads to Supabase Storage bucket "car-images" (private).
 * Returns a signed URL valid for 7 days (brokers only).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WebP are allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("car-images")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Generate a long-lived signed URL (1 year) for broker access
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from("car-images")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: "Failed to generate image URL" }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl }, { status: 201 });
  } catch (err) {
    console.error("upload-car-image error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
