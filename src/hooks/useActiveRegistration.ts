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

  // ── Load everything ──

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let regs = await fetchRegistrations(moduleId);
      const activeId = getActiveId(moduleId);

      // Find or create active registration
      let active: SpeakerRegistration | null = null;
      if (activeId) {
        active = regs.find((r) => r.id === activeId) ?? null;
      }
      if (!active && regs.length > 0) {
        active = regs[0];
        setActiveId(moduleId, active.id);
      }
      if (!active) {
        active = await createRegistration(moduleId);
        regs = [active, ...regs];
      }

      setRegistration(active);
      setAllRegistrations(regs);
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

  // ── Speaker metadata ──

  const doSaveMetadata = useCallback(
    async (metadata: Record<string, string>) => {
      setSaving(true);
      try {
        await saveMetadata(moduleId, registration.id, metadata);
        setRegistration((prev) => ({ ...prev, metadata }));
        showFlash("Στοιχεία ομιλητή αποθηκεύτηκαν");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id, showFlash]
  );

  // ── Phrases ──

  const doAddPhrase = useCallback(
    async (phrase: PhraseEntry) => {
      setSaving(true);
      try {
        const saved = await addPhrase(moduleId, registration.id, phrase);
        setRegistration((prev) => ({
          ...prev,
          phrases: [...prev.phrases, saved],
        }));
        showFlash("Φράση αποθηκεύτηκε");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id, showFlash]
  );

  const doUpdatePhrase = useCallback(
    async (phrase: PhraseEntry) => {
      setSaving(true);
      try {
        await updatePhrase(moduleId, registration.id, phrase);
        setRegistration((prev) => ({
          ...prev,
          phrases: prev.phrases.map((p) => (p.id === phrase.id ? phrase : p)),
        }));
        showFlash("Φράση αποθηκεύτηκε");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id, showFlash]
  );

  const doRemovePhrase = useCallback(
    async (phraseId: string) => {
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
        const entry = await uploadAudio(moduleId, registration.id, file);
        if (entry) {
          setRegistration((prev) => ({
            ...prev,
            audioFiles: [...prev.audioFiles, entry],
          }));
          showFlash("Ηχογράφηση προστέθηκε");
        }
        return entry;
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id, showFlash]
  );

  const doRemoveAudio = useCallback(
    async (audioId: string) => {
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
        await saveNotes(moduleId, registration.id, notes);
        setRegistration((prev) => ({ ...prev, notes }));
        showFlash("Σημειώσεις αποθηκεύτηκαν");
      } finally {
        setSaving(false);
      }
    },
    [moduleId, registration.id, showFlash]
  );

  // ── Switch registration ──

  const switchTo = useCallback(
    async (id: string) => {
      setActiveId(moduleId, id);
      const reg = await fetchRegistration(moduleId, id);
      if (reg) setRegistration(reg);
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
      const regs = await fetchRegistrations(moduleId);
      setAllRegistrations(regs);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

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

    // Init
    init,

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

    // Notes
    setLocalNotes,
    saveNotes: doSaveNotes,

    // Navigation
    switchTo,
    createNew,
  };
}
