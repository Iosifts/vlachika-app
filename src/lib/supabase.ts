import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase client for browser use.
 *
 * Returns `null` when env vars are missing — the app
 * gracefully falls back to localStorage in that case.
 */

let _client: SupabaseClient | null = null;
let _checked = false;

export function getSupabase(): SupabaseClient | null {
  if (_checked) return _client;
  _checked = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.info(
      "[vlachika] Supabase not configured — using localStorage fallback."
    );
    return null;
  }

  _client = createClient(url, key);
  return _client;
}

/** Quick check without initialising the client */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
