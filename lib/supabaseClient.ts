import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Guard: don't crash when Supabase is not configured yet
  if (!url.startsWith("http") || !key) {
    return null;
  }

  if (!_client) {
    _client = createClient(url, key);
  }
  return _client;
}

// Proxy that gracefully returns null for unconfigured Supabase
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) return () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } });
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
