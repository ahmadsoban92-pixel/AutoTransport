// lib/requireApiAuth.ts
// Auth guard for CRM-only API routes.
// Usage:
//   const auth = await requireApiAuth(request);
//   if (!auth.ok) return auth.response;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AuthSuccess = { ok: true;  userId: string; email: string };
type AuthFailure = { ok: false; response: NextResponse };

export async function requireApiAuth(
  request: NextRequest
): Promise<AuthSuccess | AuthFailure> {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Verify the token against Supabase (anon key is correct here — we're
  // just validating the user's JWT, not performing privileged operations)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true,
    userId: user.id,
    email:  user.email ?? "",
  };
}
