"use client";

import { useState, useCallback } from "react";
import type { ModuleSection, PhraseEntry } from "@/lib/types";
import {
  loadActiveRegistration,
  updateRegistrationPhrases,
} from "@/lib/registrations";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

function createEmptyEntry(): PhraseEntry {
  return {
    id: crypto.randomUUID(),
    vlach: "",
    greek: "",
    context: "",
    notes: "",
    status: "draft",
  };
}

export default function PhraseCollectionSection({ section, moduleId }: Props) {
  const { suggestedPrompts, fields } = section.data;
  const activeRegistration = loadActiveRegistration(moduleId);

  const [entries, setEntries] = useState<PhraseEntry[]>(() => {
    return activeRegistration.phrases || [];
  });

  const [currentEntry, setCurrentEntry] = useState<PhraseEntry>(createEmptyEntry());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"list" | "form">(
    entries.length > 0 ? "list" : "form"
  );

  const persist = useCallback(
    (updated: PhraseEntry[]) => {
      setEntries(updated);
      updateRegistrationPhrases(moduleId, activeRegistration.id, updated);
    },
    [activeRegistration.id, moduleId]
  );

  const addEntry = () => {
    if (!currentEntry.vlach.trim()) return;

    if (editingEntryId) {
      persist(
        entries.map((entry) =>
          entry.id === editingEntryId
            ? { ...currentEntry, id: editingEntryId, status: "draft" }
            : entry
        )
      );
    } else {
      persist([...entries, { ...currentEntry, status: "draft" }]);
    }

    setCurrentEntry(createEmptyEntry());
    setEditingEntryId(null);
    setActiveView("list");
  };

  const removeEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
    if (editingEntryId === id) {
      setCurrentEntry(createEmptyEntry());
      setEditingEntryId(null);
    }
  };

  const editEntry = (entry: PhraseEntry) => {
    setCurrentEntry(entry);
    setEditingEntryId(entry.id);
    setActiveView("form");
  };

  const cancelEdit = () => {
    setCurrentEntry(createEmptyEntry());
    setEditingEntryId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-warm-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveView("list")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "list"
              ? "bg-olive-600 text-white"
              : "bg-warm-100 text-warm-600 hover:bg-warm-200"
          }`}
        >
          Καταγεγραμμένες φράσεις ({entries.length})
        </button>
        <button
          type="button"
          onClick={() => {
            if (!editingEntryId) setCurrentEntry(createEmptyEntry());
            setActiveView("form");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "form"
              ? "bg-olive-600 text-white"
              : "bg-warm-100 text-warm-600 hover:bg-warm-200"
          }`}
        >
          {editingEntryId ? "Επεξεργασία καταγραφής" : "Νέα καταγραφή"}
        </button>
      </div>

      {/* Suggested prompts */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-warm-600 mb-3">
            Ιδέες για ερωτήσεις στον ομιλητή:
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestedPrompts.map((prompt: string, i: number) => (
              <div
                key={i}
                className="surface-card rounded-lg p-3 text-sm text-warm-600 italic"
              >
                &ldquo;{prompt}&rdquo;
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === "form" && (
        <div className="surface-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-warm-800">
              {editingEntryId ? "Επεξεργασία καταγραφής" : "Νέα καταγραφή"}
            </h4>
            {editingEntryId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm font-medium text-warm-500 hover:text-warm-700"
              >
                Ακύρωση επεξεργασίας
              </button>
            )}
          </div>
          {fields?.map((field: { name: string; label: string; required?: boolean }) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                {field.label}
                {field.required && (
                  <span className="text-rose-500 ml-1">*</span>
                )}
              </label>
              <input
                type="text"
                value={(currentEntry as unknown as Record<string, string>)[field.name] || ""}
                onChange={(e) =>
                  setCurrentEntry((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
                placeholder={field.label}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addEntry}
              disabled={!currentEntry.vlach.trim()}
              className="px-5 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingEntryId ? "Αποθήκευση αλλαγών" : "+ Προσθήκη φράσης"}
            </button>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveView("list")}
                className="px-5 py-2.5 bg-warm-100 text-warm-700 rounded-lg text-sm font-medium hover:bg-warm-200 transition-colors"
              >
                Προβολή καταγραφών
              </button>
            )}
          </div>
        </div>
      )}

      {activeView === "list" && (
        entries.length > 0 ? (
          <div className="surface-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-warm-50 text-warm-600 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Βλάχικα</th>
                    <th className="px-4 py-3 font-medium">Ελληνικά</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Πλαίσιο</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Σημειώσεις</th>
                    <th className="px-4 py-3 font-medium w-32">Ενέργεια</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-warm-50/60 transition-colors">
                      <td className="px-4 py-3 vlach-text">{entry.vlach}</td>
                      <td className="px-4 py-3 text-warm-700">{entry.greek || "—"}</td>
                      <td className="px-4 py-3 text-warm-500 hidden sm:table-cell">{entry.context || "—"}</td>
                      <td className="px-4 py-3 text-warm-400 text-xs hidden md:table-cell">{entry.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => editEntry(entry)}
                            className="text-sky-600 hover:text-sky-800 text-xs font-medium transition-colors"
                          >
                            Επεξεργασία
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-medium transition-colors"
                          >
                            Διαγραφή
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="surface-card rounded-xl p-6 text-center">
            <p className="text-warm-600">
              Δεν υπάρχουν ακόμη καταγεγραμμένες φράσεις.
            </p>
            <button
              type="button"
              onClick={() => setActiveView("form")}
              className="mt-4 px-5 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors"
            >
              Δημιούργησε την πρώτη καταγραφή
            </button>
          </div>
        )
      )}
    </div>
  );
}
