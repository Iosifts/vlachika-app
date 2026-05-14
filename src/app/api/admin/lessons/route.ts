/**
 * Admin endpoint for publishing / reverting lesson overrides.
 *
 *  PUT    /api/admin/lessons          { module: Module }   → upsert override
 *  DELETE /api/admin/lessons?id=...                         → remove override
 *
 * Auth: Authorization: Bearer <ADMIN_PASSWORD>.
 * Writes use SUPABASE_SERVICE_ROLE_KEY (server-only).
 */

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Module } from "@/lib/types";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function authOk(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";
  return token.length > 0 && token === expected;
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Quick sanity check on incoming module shape.
 * Doesn't try to fully validate — schema-level checks happen on render.
 */
function looksLikeModule(value: unknown): value is Module {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    v.id.length > 0 &&
    typeof v.title === "string" &&
    Array.isArray(v.sections)
  );
}

export async function PUT(req: Request) {
  if (!authOk(req)) return json(401, { error: "unauthorized" });

  let body: { module?: unknown };
  try {
    body = (await req.json()) as { module?: unknown };
  } catch {
    return json(400, { error: "invalid json" });
  }

  const mod = body.module;
  if (!looksLikeModule(mod)) {
    return json(400, { error: "invalid module shape" });
  }

  const sb = adminClient();
  if (!sb) return json(500, { error: "server misconfigured" });

  const { error } = await sb
    .from("lesson_overrides")
    .upsert(
      { module_id: mod.id, module_data: mod },
      { onConflict: "module_id" }
    );

  if (error) return json(500, { error: error.message });

  // Invalidate caches so visitors see the new content immediately.
  try {
    revalidatePath("/");
    revalidatePath(`/module/${mod.id}`);
  } catch {
    // revalidatePath may not be available in all edge runtimes — ignore.
  }

  return json(200, { ok: true });
}

export async function DELETE(req: Request) {
  if (!authOk(req)) return json(401, { error: "unauthorized" });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return json(400, { error: "id required" });

  const sb = adminClient();
  if (!sb) return json(500, { error: "server misconfigured" });

  const { error } = await sb
    .from("lesson_overrides")
    .delete()
    .eq("module_id", id);

  if (error) return json(500, { error: error.message });

  try {
    revalidatePath("/");
    revalidatePath(`/module/${id}`);
  } catch {
    /* noop */
  }

  return json(200, { ok: true });
}
