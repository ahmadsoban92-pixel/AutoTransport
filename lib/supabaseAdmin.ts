// lib/supabaseAdmin.ts
// Server-side singleton using the service role key.
// ONLY import this in API routes — never in client components or pages.
// The service role key bypasses RLS, so this client has full DB access.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

/**
 * Returns a Supabase client authenticated as a service-role user.
 * Throws if NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set.
 * Safe to call multiple times — client is a singleton.
 */
export function getAdminClient(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  _admin = createClient(url, key, {
    auth: {
      persistSession: false,  // server-side — never persist
      autoRefreshToken: false,
    },
  });

  return _admin;
}
