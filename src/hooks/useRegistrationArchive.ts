"use client";

import { useState, useCallback, useRef } from "react";
import type { SpeakerRegistration } from "@/lib/types";
import {
  fetchRegistrations,
  deleteRegistrationById,
  setActiveId,
} from "@/lib/services/registrations";

function hasContent(reg: SpeakerRegistration): boolean {
  return (
    !!reg.metadata.speakerName ||
    reg.phrases.length > 0 ||
    reg.audioFiles.length > 0 ||
    !!reg.notes
  );
}

export function useRegistrationArchive(moduleId: string) {
  const [registrations, setRegistrations] = useState<SpeakerRegistration[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  const selected = registrations.find((r) => r.id === selectedId) ?? null;

  const init = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;
    setLoading(true);
    try {
      const all = await fetchRegistrations(moduleId);
      const withContent = all.filter(hasContent);
      setRegistrations(withContent);
      setSelectedId(withContent[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const activate = useCallback(
    (id: string) => {
      setActiveId(moduleId, id);
    },
    [moduleId]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await deleteRegistrationById(moduleId, id);
        const all = await fetchRegistrations(moduleId);
        const withContent = all.filter(hasContent);
        setRegistrations(withContent);
        setSelectedId(withContent[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    },
    [moduleId]
  );

  return {
    registrations,
    selected,
    selectedId,
    loading,
    init,
    select,
    activate,
    remove,
  };
}
