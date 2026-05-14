/**
 * Lesson overrides — Supabase-backed cloud edits.
 *
 * Read path (public, anon key):
 *   fetchAllOverrides() / fetchOverride(id)
 *
 * Write path (admin, calls our server route):
 *   publishOverride(module, token)
 *   revertOverride(id, token)
 *
 * Falls back gracefully when Supabase isn't configured — overrides
 * are simply ignored and the static JSON wins.
 */

import type { Module } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";

interface OverrideRow {
  module_id: string;
  module_data: Module;
  updated_at: string;
}

/** Fetch every override (one round-trip). Safe on server + client. */
export async function fetchAllOverrides(): Promise<Map<string, Module>> {
  const sb = getSupabase();
  if (!sb) return new Map();

  const { data, error } = await sb
    .from("lesson_overrides")
    .select("module_id, module_data, updated_at");

  if (error || !data) {
    if (error) console.warn("[fetchAllOverrides]", error.message);
    return new Map();
  }

  const map = new Map<string, Module>();
  for (const row of data as OverrideRow[]) {
    if (row?.module_id && row?.module_data) {
      map.set(row.module_id, row.module_data);
    }
  }
  return map;
}

/** Fetch one override by module id. */
export async function fetchOverride(id: string): Promise<Module | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("lesson_overrides")
    .select("module_data")
    .eq("module_id", id)
    .maybeSingle();

  if (error) {
    console.warn("[fetchOverride]", error.message);
    return null;
  }
  if (!data) return null;
  return (data.module_data ?? null) as Module | null;
}

// ─── Admin write path (uses bearer token) ──────────────────

/** Publish an override. `token` is the admin password (Bearer). */
export async function publishOverride(
  mod: Module,
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/lessons", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ module: mod }),
  });
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => ({ error: "unknown" }));
  return { ok: false, error: body.error ?? `HTTP ${res.status}` };
}

/** Remove the override (revert to the bundled static JSON). */
export async function revertOverride(
  id: string,
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `/api/admin/lessons?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => ({ error: "unknown" }));
  return { ok: false, error: body.error ?? `HTTP ${res.status}` };
}
