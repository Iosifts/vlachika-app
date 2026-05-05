/**
 * Registration service — single source of truth for speaker registration CRUD.
 *
 * Strategy:
 *   - If Supabase is configured → use it as primary store.
 *   - Otherwise → fall back to localStorage (same as before).
 *
 * Every function is async. Components use hooks that call these.
 */

import type {
  SpeakerRegistration,
  PhraseEntry,
  RegistrationAudioFile,
} from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import * as local from "@/lib/registrations";

// ─── Helpers ────────────────────────────────────────────

function supabaseToRegistration(
  row: Record<string, unknown>,
  phrases: Record<string, unknown>[],
  audioFiles: Record<string, unknown>[]
): SpeakerRegistration {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    metadata: (row.metadata ?? {}) as Record<string, string>,
    notes: (row.notes ?? "") as string,
    phrases: phrases.map((p) => ({
      id: p.id as string,
      vlach: p.vlach as string,
      greek: (p.greek ?? "") as string,
      context: (p.context ?? "") as string,
      notes: (p.notes ?? "") as string,
      status: (p.status ?? "draft") as PhraseEntry["status"],
    })),
    audioFiles: audioFiles.map((a) => ({
      id: a.id as string,
      name: a.file_name as string,
      size: a.file_size as number,
      type: a.mime_type as string,
      url: a.public_url as string, // resolved at query time
      addedAt: a.added_at as string,
    })),
  };
}

// ─── Load all registrations ─────────────────────────────

export async function fetchRegistrations(
  moduleId: string
): Promise<SpeakerRegistration[]> {
  const sb = getSupabase();
  if (!sb) return local.loadRegistrations(moduleId);

  const { data: rows, error } = await sb
    .from("speaker_registrations")
    .select("*")
    .eq("module_id", moduleId)
    .order("updated_at", { ascending: false });

  if (error || !rows) {
    console.warn("[fetchRegistrations]", error);
    return local.loadRegistrations(moduleId);
  }

  // Batch-load children for all registrations
  const ids = rows.map((r) => r.id);

  const [phrasesRes, audioRes] = await Promise.all([
    sb
      .from("registration_phrases")
      .select("*")
      .in("registration_id", ids)
      .order("sort_order"),
    sb.from("registration_audio").select("*").in("registration_id", ids),
  ]);

  const phrasesMap = new Map<string, Record<string, unknown>[]>();
  for (const p of phrasesRes.data ?? []) {
    const arr = phrasesMap.get(p.registration_id) ?? [];
    arr.push(p);
    phrasesMap.set(p.registration_id, arr);
  }

  // Resolve public URLs for audio files
  const audioMap = new Map<string, Record<string, unknown>[]>();
  for (const a of audioRes.data ?? []) {
    const { data: urlData } = sb.storage
      .from("audio")
      .getPublicUrl(a.storage_path);
    const enriched = { ...a, public_url: urlData?.publicUrl ?? "" };
    const arr = audioMap.get(a.registration_id) ?? [];
    arr.push(enriched);
    audioMap.set(a.registration_id, arr);
  }

  return rows.map((row) =>
    supabaseToRegistration(
      row,
      phrasesMap.get(row.id) ?? [],
      audioMap.get(row.id) ?? []
    )
  );
}

// ─── Load one registration by ID ────────────────────────

export async function fetchRegistration(
  moduleId: string,
  registrationId: string
): Promise<SpeakerRegistration | null> {
  const sb = getSupabase();
  if (!sb) {
    const all = local.loadRegistrations(moduleId);
    return all.find((r) => r.id === registrationId) ?? null;
  }

  const { data: row, error } = await sb
    .from("speaker_registrations")
    .select("*")
    .eq("id", registrationId)
    .single();

  if (error || !row) return null;

  const [phrasesRes, audioRes] = await Promise.all([
    sb
      .from("registration_phrases")
      .select("*")
      .eq("registration_id", registrationId)
      .order("sort_order"),
    sb
      .from("registration_audio")
      .select("*")
      .eq("registration_id", registrationId),
  ]);

  const audioWithUrls = (audioRes.data ?? []).map((a) => {
    const { data: urlData } = sb.storage
      .from("audio")
      .getPublicUrl(a.storage_path);
    return { ...a, public_url: urlData?.publicUrl ?? "" };
  });

  return supabaseToRegistration(
    row,
    phrasesRes.data ?? [],
    audioWithUrls
  );
}

// ─── Create a new empty registration ────────────────────

export async function createRegistration(
  moduleId: string
): Promise<SpeakerRegistration> {
  const sb = getSupabase();
  if (!sb) {
    return local.createAndActivateRegistration(moduleId);
  }

  const { data, error } = await sb
    .from("speaker_registrations")
    .insert({ module_id: moduleId })
    .select()
    .single();

  if (error || !data) {
    console.warn("[createRegistration]", error);
    return local.createAndActivateRegistration(moduleId);
  }

  // Store active id locally (lightweight, no need for DB)
  local.setActiveRegistrationId(moduleId, data.id);

  return supabaseToRegistration(data, [], []);
}

// ─── Save speaker metadata ─────────────────────────────

export async function saveMetadata(
  moduleId: string,
  registrationId: string,
  metadata: Record<string, string>
): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    local.updateRegistrationMetadata(moduleId, registrationId, metadata);
    return;
  }

  const { error } = await sb
    .from("speaker_registrations")
    .update({ metadata })
    .eq("id", registrationId);

  if (error) console.warn("[saveMetadata]", error);
}

// ─── Save notes ─────────────────────────────────────────

export async function saveNotes(
  moduleId: string,
  registrationId: string,
  notes: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    local.updateRegistrationNotes(moduleId, registrationId, notes);
    return;
  }

  const { error } = await sb
    .from("speaker_registrations")
    .update({ notes })
    .eq("id", registrationId);

  if (error) console.warn("[saveNotes]", error);
}

// ─── Phrase CRUD ────────────────────────────────────────

export async function addPhrase(
  moduleId: string,
  registrationId: string,
  phrase: PhraseEntry
): Promise<PhraseEntry> {
  const sb = getSupabase();
  if (!sb) {
    const reg = local.loadRegistrations(moduleId).find((r) => r.id === registrationId);
    const updated = [...(reg?.phrases ?? []), phrase];
    local.updateRegistrationPhrases(moduleId, registrationId, updated);
    return phrase;
  }

  const { data, error } = await sb
    .from("registration_phrases")
    .insert({
      id: phrase.id,
      registration_id: registrationId,
      vlach: phrase.vlach,
      greek: phrase.greek ?? "",
      context: phrase.context ?? "",
      notes: phrase.notes ?? "",
      status: phrase.status ?? "draft",
    })
    .select()
    .single();

  if (error) console.warn("[addPhrase]", error);

  // Touch parent updated_at
  await sb
    .from("speaker_registrations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", registrationId);

  return data
    ? {
        id: data.id,
        vlach: data.vlach,
        greek: data.greek,
        context: data.context,
        notes: data.notes,
        status: data.status,
        audioFileId: phrase.audioFileId,
      }
    : phrase;
}

export async function updatePhrase(
  moduleId: string,
  registrationId: string,
  phrase: PhraseEntry
): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    const reg = local.loadRegistrations(moduleId).find((r) => r.id === registrationId);
    const updated = (reg?.phrases ?? []).map((p) =>
      p.id === phrase.id ? phrase : p
    );
    local.updateRegistrationPhrases(moduleId, registrationId, updated);
    return;
  }

  const { error } = await sb
    .from("registration_phrases")
    .update({
      vlach: phrase.vlach,
      greek: phrase.greek ?? "",
      context: phrase.context ?? "",
      notes: phrase.notes ?? "",
      status: phrase.status ?? "draft",
    })
    .eq("id", phrase.id);

  if (error) console.warn("[updatePhrase]", error);

  await sb
    .from("speaker_registrations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", registrationId);
}

export async function removePhrase(
  moduleId: string,
  registrationId: string,
  phraseId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    const reg = local.loadRegistrations(moduleId).find((r) => r.id === registrationId);
    const updated = (reg?.phrases ?? []).filter((p) => p.id !== phraseId);
    local.updateRegistrationPhrases(moduleId, registrationId, updated);
    return;
  }

  const { error } = await sb
    .from("registration_phrases")
    .delete()
    .eq("id", phraseId);

  if (error) console.warn("[removePhrase]", error);
}

// ─── Audio upload + delete ──────────────────────────────

export async function uploadAudio(
  moduleId: string,
  registrationId: string,
  file: File
): Promise<RegistrationAudioFile | null> {
  const sb = getSupabase();

  // Common file metadata
  const fileId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (!sb) {
    // localStorage fallback — blob URL (temporary, lost on reload)
    const entry: RegistrationAudioFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      addedAt: now,
    };
    const reg = local.loadRegistrations(moduleId).find((r) => r.id === registrationId);
    const updated = [...(reg?.audioFiles ?? []), entry];
    local.updateRegistrationAudioFiles(moduleId, registrationId, updated);
    return entry;
  }

  // Upload to Supabase Storage
  const storagePath = `${moduleId}/${registrationId}/${fileId}-${file.name}`;
  const { error: uploadError } = await sb.storage
    .from("audio")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.warn("[uploadAudio]", uploadError);
    return null;
  }

  // Get public URL
  const { data: urlData } = sb.storage
    .from("audio")
    .getPublicUrl(storagePath);

  // Insert DB row
  const { data, error: dbError } = await sb
    .from("registration_audio")
    .insert({
      id: fileId,
      registration_id: registrationId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (dbError) {
    console.warn("[uploadAudio db]", dbError);
    return null;
  }

  // Touch parent
  await sb
    .from("speaker_registrations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", registrationId);

  return {
    id: data.id,
    name: data.file_name,
    size: data.file_size,
    type: data.mime_type,
    url: urlData?.publicUrl ?? "",
    addedAt: data.added_at,
  };
}

export async function removeAudio(
  moduleId: string,
  registrationId: string,
  audioId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    const reg = local.loadRegistrations(moduleId).find((r) => r.id === registrationId);
    const updated = (reg?.audioFiles ?? []).filter((a) => a.id !== audioId);
    local.updateRegistrationAudioFiles(moduleId, registrationId, updated);
    return;
  }

  // Get storage path before deleting the row
  const { data: row } = await sb
    .from("registration_audio")
    .select("storage_path")
    .eq("id", audioId)
    .single();

  if (row?.storage_path) {
    await sb.storage.from("audio").remove([row.storage_path]);
  }

  const { error } = await sb
    .from("registration_audio")
    .delete()
    .eq("id", audioId);

  if (error) console.warn("[removeAudio]", error);
}

// ─── Delete entire registration ─────────────────────────

export async function deleteRegistrationById(
  moduleId: string,
  registrationId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    local.deleteRegistration(moduleId, registrationId);
    return;
  }

  // Delete audio files from storage first
  const { data: audioRows } = await sb
    .from("registration_audio")
    .select("storage_path")
    .eq("registration_id", registrationId);

  if (audioRows && audioRows.length > 0) {
    const paths = audioRows.map((a) => a.storage_path);
    await sb.storage.from("audio").remove(paths);
  }

  // Cascade delete handles phrases + audio rows
  const { error } = await sb
    .from("speaker_registrations")
    .delete()
    .eq("id", registrationId);

  if (error) console.warn("[deleteRegistration]", error);
}

// ─── Active registration ID (always localStorage) ──────

export function getActiveId(moduleId: string): string | null {
  return local.getActiveRegistrationId(moduleId);
}

export function setActiveId(moduleId: string, id: string): void {
  local.setActiveRegistrationId(moduleId, id);
}
