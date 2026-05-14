/**
 * Feedback service — public-facing CRUD via Supabase anon client.
 *
 * Public reads/writes only. Moderation goes through /api/admin/feedback.
 * RLS enforces:
 *   - anon may INSERT only with status = 'pending'
 *   - anon may SELECT only rows where status = 'approved'
 *   - anon cannot UPDATE / DELETE
 */

import { getSupabase } from "@/lib/supabase";

export interface FeedbackItem {
  id: string;
  text: string;
  createdAt: string;
}

export const FEEDBACK_MAX_LENGTH = 1200;

/** Insert a new pending comment. Returns true on success. */
export async function submitFeedback(text: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const trimmed = text.trim();
  if (!trimmed || trimmed.length > FEEDBACK_MAX_LENGTH) return false;

  const { error } = await sb
    .from("feedback")
    .insert({ text: trimmed, status: "pending" });

  if (error) {
    console.warn("[submitFeedback]", error);
    return false;
  }
  return true;
}

/** Fetch approved comments, newest first. */
export async function fetchApprovedFeedback(): Promise<FeedbackItem[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("feedback")
    .select("id, text, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.warn("[fetchApprovedFeedback]", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    text: row.text as string,
    createdAt: row.created_at as string,
  }));
}
