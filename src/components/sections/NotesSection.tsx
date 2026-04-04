"use client";

import { useState, useCallback } from "react";
import type { ModuleSection } from "@/lib/types";
import {
  loadActiveRegistration,
  updateRegistrationNotes,
} from "@/lib/registrations";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function NotesSection({ section, moduleId }: Props) {
  const placeholder = section.data?.placeholder || "Γράψε σημειώσεις εδώ...";
  const activeRegistration = loadActiveRegistration(moduleId);

  const [text, setText] = useState<string>(() => {
    return activeRegistration.notes || "";
  });

  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    updateRegistrationNotes(moduleId, activeRegistration.id, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [activeRegistration.id, moduleId, text]);

  return (
    <div className="space-y-4">
      <textarea
        rows={8}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-300 resize-y"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-warm-700 text-white rounded-lg text-sm font-medium hover:bg-warm-800 transition-colors"
        >
          Αποθήκευση
        </button>
        {saved && (
          <span className="text-sm text-olive-600 animate-pulse">
            Αποθηκεύτηκε
          </span>
        )}
      </div>
      <p className="text-xs text-warm-400 italic">
        Οι σημειώσεις αποθηκεύονται στην ενεργή καταγραφή.
      </p>
    </div>
  );
}
