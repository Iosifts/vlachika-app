"use client";

import { useState, useCallback, useRef } from "react";
import type {
  SpeakerRegistration,
  PhraseEntry,
  RegistrationAudioFile,
} from "@/lib/types";
import {
  fetchRegistrations,
  fetchRegistration,
  createRegistration,
  saveMetadata,
  saveNotes,
  addPhrase,
  updatePhrase,
  removePhrase,
  uploadAudio,
  removeAudio,
  getActiveId,
  setActiveId,
} from "@/lib/services/registrations";
import {
  loadPhraseAudioLinks,
  savePhraseAudioLink,
} from "@/lib/registrations";

// ─── Empty defaults ────────────────────────────────────

function emptyRegistration(): SpeakerRegistration {
  return {
    id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
    phrases: [],
    audioFiles: [],
    notes: "",
  };
}

function emptyPhrase(): PhraseEntry {
  return {
    id: crypto.randomUUID(),
    vlach: "",
    greek: "",
    context: "",
    notes: "",
    status: "draft",
  };
}

function hasAnyContent(reg: SpeakerRegistration): boolean {
  return (
    !!reg.metadata.speakerName?.trim() ||
    !!reg.metadata.name?.trim() ||
    reg.phrases.length > 0 ||
    reg.audioFiles.length > 0 ||
    !!reg.notes?.trim()
  );
}

// Apply the phrase→audio link map from localStorage onto a registration's
// phrases. Persistence of audioFileId is browser-local; the audio files
// themselves still live in Supabase (or localStorage) the normal way.
function applyAudioLinks(
  moduleId: string,
  reg: SpeakerRegistration
): SpeakerRegistration {
  const links = loadPhraseAudioLinks(moduleId);
  if (Object.keys(links).length === 0) return reg;
  return {
    ...reg,
    phrases: reg.phrases.map((p) =>
      links[p.id] ? { ...p, audioFileId: links[p.id] } : p
    ),
  };
}

// ─── Hook ──────────────────────────────────────────────

export function useActiveRegistration(moduleId: string) {
  const [registration, setRegistration] = useState<SpeakerRegistration>(emptyRegistration);
  const [allRegistrations, setAllRegistrations] = useState<SpeakerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const initRef = useRef(false);

  // ── Flash message ──

  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1500);
  }, []);

  const showError = useCallback((msg: string) => {
    setFlash(`⚠ ${msg}`);
    setTimeout(() => setFlash(null), 4000);
  }, []);

  // ── Load everything ──
  //
  // We do NOT auto-create a registration here. The wizard component decides
  // when to start one (so users see a clean landing screen first).

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const regs = (await fetchRegistrations(moduleId)).map((r) =>
        applyAudioLinks(moduleId, r)
      );
      const activeId = getActiveId(moduleId);

      // Try to resume an existing draft, but only if the user has actually
      // put content into it. Empty placeholders are filtered out.
      let active: SpeakerRegistration | null = null;
      if (activeId) {
        active = regs.find((r) => r.id === activeId) ?? null;
      }
      if (active && !hasAnyContent(active)) {
        active = null;
      }

      setRegistration(active ?? emptyRegistration());
      setAllRegistrations(regs.filter(hasAnyContent));
    } catch (err) {
      console.error("[useActiveRegistration.load]", err);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  // Init on first render (called from component useEffect)
  const init = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;
    await load();
  }, [load]);

  // Returns the id of an active registration, creating one on first use.
  // All write helpers below funnel through this so callers don't have to
  // worry about whether a registration row exists yet.
  const ensureActive = useCallback(async (): Promise<string> => {
    if (registration.id) return registration.id;
    const created = await createRegistration(moduleId);
    setActiveId(moduleId, created.id);
    setRegistration(created);
    return created.id;
  }, [moduleId, registration.id]);

  // Discards the current draft if it is empty (id="") and resets state.
  const discardEmpty = useCallback(() => {
    if (!registration.id) {
      setRegistration(emptyRegistration());
    }
  }, [registration.id]);

  // ── Speaker metadata ──

  const doSaveMetadata = useCallback(
    async (metadata: Record<string, string>) => {
      setSaving(true);
      try {
        const id = await ensureActive();
        await saveMetadata(moduleId, id, metadata);
        setRegistration((prev) => ({ ...prev, id, metadata }));
        showFlash("Στοιχεία ομιλητή αποθηκεύτηκαν");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, ensureActive, showFlash]
  );

  // ── Phrases ──

  const doAddPhrase = useCallback(
    async (phrase: PhraseEntry) => {
      setSaving(true);
      try {
        const id = await ensureActive();
        const saved = await addPhrase(moduleId, id, phrase);
        setRegistration((prev) => ({
          ...prev,
          id,
          phrases: [...prev.phrases, saved],
        }));
        showFlash("Φράση αποθηκεύτηκε");
        return saved;
      } finally {
        setSaving(false);
      }
    },
    [moduleId, ensureActive, showFlash]
  );

  const doUpdatePhrase = useCallback(
    async (phrase: PhraseEntry) => {
      setSaving(true);
      try {
        const id = await ensureActive();
        await updatePhrase(moduleId, id, phrase);
        setRegistration((prev) => ({
          ...prev,
          id,
          phrases: prev.phrases.map((p) => (p.id === phrase.id ? phrase : p)),
        }));
        showFlash("Φράση αποθηκεύτηκε");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, ensureActive, showFlash]
  );

  const doRemovePhrase = useCallback(
    async (phraseId: string) => {
      if (!registration.id) return;
      setSaving(true);
      try {
        await removePhrase(moduleId, registration.id, phraseId);
        setRegistration((prev) => ({
          ...prev,
          phrases: prev.phrases.filter((p) => p.id !== phraseId),
        }));
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id]
  );

  // ── Audio ──

  const doUploadAudio = useCallback(
    async (file: File): Promise<RegistrationAudioFile | null> => {
      setSaving(true);
      try {
        const id = await ensureActive();
        const entry = await uploadAudio(moduleId, id, file);
        if (entry) {
          setRegistration((prev) => ({
            ...prev,
            id,
            audioFiles: [...prev.audioFiles, entry],
          }));
          showFlash("Ηχογράφηση προστέθηκε");
        } else {
          showError(
            "Δεν ήταν δυνατό το ανέβασμα. Έλεγξε τη σύνδεση ή τον Supabase storage bucket «audio»."
          );
        }
        return entry;
      } catch (err) {
        console.error("[uploadAudio]", err);
        showError("Σφάλμα κατά το ανέβασμα ηχογράφησης.");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [moduleId, ensureActive, showFlash, showError]
  );

  // Link/unlink a phrase to an audio file. The link is stored in localStorage
  // (no Supabase schema migration required) and immediately reflected in
  // local state so the UI updates.
  const doLinkPhraseAudio = useCallback(
    (phraseId: string, audioId: string | null) => {
      savePhraseAudioLink(moduleId, phraseId, audioId);
      setRegistration((prev) => ({
        ...prev,
        phrases: prev.phrases.map((p) =>
          p.id === phraseId
            ? { ...p, audioFileId: audioId ?? undefined }
            : p
        ),
      }));
    },
    [moduleId]
  );

  const doRemoveAudio = useCallback(
    async (audioId: string) => {
      if (!registration.id) return;
      setSaving(true);
      try {
        await removeAudio(moduleId, registration.id, audioId);
        setRegistration((prev) => ({
          ...prev,
          audioFiles: prev.audioFiles.filter((a) => a.id !== audioId),
        }));
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id]
  );

  // ── Notes ──

  const doSaveNotes = useCallback(
    async (notes: string) => {
      setSaving(true);
      try {
        const id = await ensureActive();
        await saveNotes(moduleId, id, notes);
        setRegistration((prev) => ({ ...prev, id, notes }));
        showFlash("Σημειώσεις αποθηκεύτηκαν");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, ensureActive, showFlash]
  );

  // ── Switch registration ──

  const switchTo = useCallback(
    async (id: string) => {
      setActiveId(moduleId, id);
      const reg = await fetchRegistration(moduleId, id);
      if (reg) setRegistration(applyAudioLinks(moduleId, reg));
    },
    [moduleId]
  );

  // ── Create new ──

  const createNew = useCallback(async () => {
    setLoading(true);
    try {
      const created = await createRegistration(moduleId);
      setActiveId(moduleId, created.id);
      setRegistration(created);
      // Refresh the list
      const regs = (await fetchRegistrations(moduleId)).map((r) =>
        applyAudioLinks(moduleId, r)
      );
      setAllRegistrations(regs.filter(hasAnyContent));
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  // Mark the current registration as "done" and return to a clean slate.
  // The data stays persisted in storage; this just resets local UI state.
  const finishActive = useCallback(async () => {
    setRegistration(emptyRegistration());
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(`vlachika-active-registration-${moduleId}`);
    }
    showFlash("Καταγραφή αποθηκεύτηκε");
    // Refresh the archive sidebar list
    const regs = (await fetchRegistrations(moduleId)).map((r) =>
      applyAudioLinks(moduleId, r)
    );
    setAllRegistrations(regs.filter(hasAnyContent));
  }, [moduleId, showFlash]);

  // ── Update local metadata (before save) ──

  const setLocalMetadata = useCallback(
    (fn: (prev: Record<string, string>) => Record<string, string>) => {
      setRegistration((prev) => ({
        ...prev,
        metadata: fn(prev.metadata),
      }));
    },
    []
  );

  const setLocalNotes = useCallback((notes: string) => {
    setRegistration((prev) => ({ ...prev, notes }));
  }, []);

  return {
    // State
    registration,
    allRegistrations,
    loading,
    saving,
    flash,
    /** True when the active registration has been persisted at least once. */
    hasActive: !!registration.id,

    // Init
    init,
    ensureActive,
    discardEmpty,

    // Metadata
    setLocalMetadata,
    saveMetadata: doSaveMetadata,

    // Phrases
    addPhrase: doAddPhrase,
    updatePhrase: doUpdatePhrase,
    removePhrase: doRemovePhrase,
    emptyPhrase,

    // Audio
    uploadAudio: doUploadAudio,
    removeAudio: doRemoveAudio,
    linkPhraseAudio: doLinkPhraseAudio,

    // Notes
    setLocalNotes,
    saveNotes: doSaveNotes,

    // Navigation
    switchTo,
    createNew,
    finishActive,
  };
}
