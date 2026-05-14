/**
 * Admin moderation endpoint for /feedback comments.
 *
 * Security model:
 *  - Authorization: Bearer <ADMIN_PASSWORD>   (compared to env var)
 *  - Uses SUPABASE_SERVICE_ROLE_KEY server-side only.
 *  - Service role key NEVER leaves this module.
 *
 * Endpoints:
 *  - GET    /api/admin/feedback              → list pending + approved
 *  - PATCH  /api/admin/feedback              → { id } → status = 'approved'
 *  - DELETE /api/admin/feedback?id=<uuid>    → hard delete
 */

import { createClient } from "@supabase/supabase-js";

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
  // No session / no autoRefresh — pure service role.
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req: Request) {
  if (!authOk(req)) return json(401, { error: "unauthorized" });

  const sb = adminClient();
  if (!sb) return json(500, { error: "server misconfigured" });

  const { data, error } = await sb
    .from("feedback")
    .select("id, text, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return json(500, { error: error.message });
  return json(200, { items: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!authOk(req)) return json(401, { error: "unauthorized" });

  let payload: { id?: string };
  try {
    payload = (await req.json()) as { id?: string };
  } catch {
    return json(400, { error: "invalid json" });
  }
  if (!payload.id) return json(400, { error: "id required" });

  const sb = adminClient();
  if (!sb) return json(500, { error: "server misconfigured" });

  const { error } = await sb
    .from("feedback")
    .update({ status: "approved" })
    .eq("id", payload.id);

  if (error) return json(500, { error: error.message });
  return json(200, { ok: true });
}

export async function DELETE(req: Request) {
  if (!authOk(req)) return json(401, { error: "unauthorized" });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return json(400, { error: "id required" });

  const sb = adminClient();
  if (!sb) return json(500, { error: "server misconfigured" });

  const { error } = await sb.from("feedback").delete().eq("id", id);
  if (error) return json(500, { error: error.message });
  return json(200, { ok: true });
}
