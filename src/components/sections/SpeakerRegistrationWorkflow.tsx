"use client";

import { useState, useCallback, useRef } from "react";
import type {
  ModuleSection,
  PhraseEntry,
  RegistrationAudioFile,
  SpeakerRegistration,
} from "@/lib/types";
import {
  loadActiveRegistration,
  loadRegistrations,
  createAndActivateRegistration,
  setActiveRegistrationId,
  updateRegistrationMetadata,
  updateRegistrationPhrases,
  updateRegistrationAudioFiles,
  updateRegistrationNotes,
} from "@/lib/registrations";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

// ─── Helpers ────────────────────────────────────────────────

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

function speakerLabel(reg: SpeakerRegistration): string {
  const name =
    reg.metadata.speakerName || reg.metadata.name || "";
  const place =
    reg.metadata.speakerPlace || reg.metadata.place || "";
  if (name && place) return `${name} — ${place}`;
  if (name) return name;
  return "";
}

function hasContent(reg: SpeakerRegistration): boolean {
  return (
    !!reg.metadata.speakerName ||
    reg.phrases.length > 0 ||
    reg.audioFiles.length > 0 ||
    !!reg.notes
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main component ─────────────────────────────────────────

export default function SpeakerRegistrationWorkflow({
  section,
  moduleId,
}: Props) {
  const { metadataFields, phraseFields, suggestedPrompts, audioConfig } =
    section.data;

  // ── State ──────────────────────────────────────────────────

  const [registration, setRegistration] = useState<SpeakerRegistration>(() =>
    loadActiveRegistration(moduleId)
  );

  // UI state
  const [speakerSaved, setSpeakerSaved] = useState(() => hasContent(registration));
  const [showPhraseForm, setShowPhraseForm] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<PhraseEntry>(createEmptyEntry());
  const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // ── Reload registration from storage ───────────────────────

  const reload = useCallback(() => {
    const fresh = loadActiveRegistration(moduleId);
    setRegistration(fresh);
    setSpeakerSaved(hasContent(fresh));
  }, [moduleId]);

  // ── Flash "saved" indicator ────────────────────────────────

  const flash = useCallback((label: string) => {
    setSavedFlash(label);
    setTimeout(() => setSavedFlash(null), 1500);
  }, []);

  // ── Speaker metadata ──────────────────────────────────────

  const updateMetaField = (name: string, value: string) => {
    setRegistration((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [name]: value },
    }));
  };

  const saveSpeaker = () => {
    updateRegistrationMetadata(moduleId, registration.id, registration.metadata);
    setSpeakerSaved(true);
    flash("Στοιχεία ομιλητή αποθηκεύτηκαν");
  };

  // ── Phrases ────────────────────────────────────────────────

  const persistPhrases = useCallback(
    (updated: PhraseEntry[]) => {
      setRegistration((prev) => ({ ...prev, phrases: updated }));
      updateRegistrationPhrases(moduleId, registration.id, updated);
    },
    [moduleId, registration.id]
  );

  const addOrUpdatePhrase = () => {
    if (!currentPhrase.vlach.trim()) return;
    if (editingPhraseId) {
      persistPhrases(
        registration.phrases.map((p) =>
          p.id === editingPhraseId ? { ...currentPhrase, id: editingPhraseId } : p
        )
      );
    } else {
      persistPhrases([...registration.phrases, { ...currentPhrase, status: "draft" }]);
    }
    setCurrentPhrase(createEmptyEntry());
    setEditingPhraseId(null);
    setShowPhraseForm(false);
    flash("Φράση αποθηκεύτηκε");
  };

  const removePhrase = (id: string) => {
    persistPhrases(registration.phrases.filter((p) => p.id !== id));
    if (editingPhraseId === id) {
      setCurrentPhrase(createEmptyEntry());
      setEditingPhraseId(null);
    }
  };

  const startEditPhrase = (entry: PhraseEntry) => {
    setCurrentPhrase(entry);
    setEditingPhraseId(entry.id);
    setShowPhraseForm(true);
  };

  // ── Audio ──────────────────────────────────────────────────

  const maxSizeMB = audioConfig?.maxSizeMB || 50;

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    const newFiles: RegistrationAudioFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Το αρχείο "${file.name}" υπερβαίνει το όριο ${maxSizeMB}MB.`);
        continue;
      }
      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        addedAt: new Date().toISOString(),
      });
    }
    if (newFiles.length > 0) {
      const updated = [...registration.audioFiles, ...newFiles];
      setRegistration((prev) => ({ ...prev, audioFiles: updated }));
      updateRegistrationAudioFiles(moduleId, registration.id, updated);
      flash("Αρχείο ηχογράφησης προστέθηκε");
    }
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const removeAudio = (id: string) => {
    const updated = registration.audioFiles.filter((f) => f.id !== id);
    setRegistration((prev) => ({ ...prev, audioFiles: updated }));
    updateRegistrationAudioFiles(moduleId, registration.id, updated);
  };

  // ── Notes ──────────────────────────────────────────────────

  const saveNotes = () => {
    updateRegistrationNotes(moduleId, registration.id, registration.notes);
    flash("Σημειώσεις αποθηκεύτηκαν");
  };

  // ── Switch / new registration ──────────────────────────────

  const allRegistrations = loadRegistrations(moduleId);

  const switchTo = (id: string) => {
    setActiveRegistrationId(moduleId, id);
    setShowSwitcher(false);
    reload();
  };

  const startNew = () => {
    createAndActivateRegistration(moduleId);
    setShowSwitcher(false);
    reload();
    setSpeakerSaved(false);
    setShowPhraseForm(false);
    setCurrentPhrase(createEmptyEntry());
    setEditingPhraseId(null);
  };

  // ── Derived ────────────────────────────────────────────────

  const label = speakerLabel(registration);
  const hasSpeakerName = !!registration.metadata.speakerName?.trim();

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-8">
      {/* ── Saved flash ── */}
      {savedFlash && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-olive-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-pulse">
          {savedFlash}
        </div>
      )}

      {/* ── Top bar: current speaker + actions ── */}
      <div className="surface-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-warm-400">
            Ενεργή καταγραφή
          </p>
          <p className="text-lg font-semibold text-warm-800">
            {label || "Νέος ομιλητής (χωρίς όνομα)"}
          </p>
          <p className="text-xs text-warm-400 mt-0.5">
            {registration.phrases.length} φράσεις · {registration.audioFiles.length} ηχογραφήσεις
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="rounded-lg border border-warm-200 bg-white px-3 py-2 text-xs font-medium text-warm-600 hover:bg-warm-50 transition-colors"
          >
            Αλλαγή ομιλητή
          </button>
          <button
            type="button"
            onClick={startNew}
            className="rounded-lg bg-olive-600 px-3 py-2 text-xs font-medium text-white hover:bg-olive-700 transition-colors"
          >
            + Νέα καταγραφή
          </button>
        </div>
      </div>

      {/* ── Switcher dropdown ── */}
      {showSwitcher && allRegistrations.length > 1 && (
        <div className="surface-card rounded-xl overflow-hidden border border-warm-200">
          <p className="px-4 py-2 bg-warm-50 text-xs font-medium text-warm-500 uppercase tracking-wide">
            Υπάρχουσες καταγραφές
          </p>
          <div className="divide-y divide-warm-100">
            {allRegistrations
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((reg) => {
                const isActive = reg.id === registration.id;
                const regLabel = speakerLabel(reg) || "Χωρίς όνομα";
                return (
                  <button
                    key={reg.id}
                    type="button"
                    disabled={isActive}
                    onClick={() => switchTo(reg.id)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-olive-50 text-olive-700 font-medium cursor-default"
                        : "hover:bg-warm-50 text-warm-700"
                    }`}
                  >
                    <span>{regLabel}</span>
                    <span className="ml-2 text-xs text-warm-400">
                      {reg.phrases.length} φράσεις
                      {isActive && " · ενεργή"}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* STEP 1: Speaker details                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section>
        <button
          type="button"
          onClick={() => setSpeakerSaved(!speakerSaved || !hasSpeakerName ? false : !speakerSaved)}
          className="w-full flex items-center justify-between gap-3 mb-3"
        >
          <h3 className="text-base font-semibold text-warm-800 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-olive-100 text-olive-700 text-xs font-bold">
              1
            </span>
            Στοιχεία ομιλητή
            {hasSpeakerName && (
              <span className="text-xs font-normal text-olive-600 bg-olive-50 rounded px-2 py-0.5">
                {registration.metadata.speakerName}
              </span>
            )}
          </h3>
          {hasSpeakerName && (
            <span className="text-xs text-warm-400">
              {speakerSaved ? "Πάτα για επεξεργασία" : ""}
            </span>
          )}
        </button>

        {!speakerSaved && (
          <div className="surface-card rounded-xl p-5 space-y-4">
            {metadataFields?.map(
              (field: {
                name: string;
                label: string;
                type?: string;
                required?: boolean;
              }) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-warm-600 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-rose-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field.type || "text"}
                    value={registration.metadata[field.name] || ""}
                    onChange={(e) => updateMetaField(field.name, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
                    placeholder={field.label}
                  />
                </div>
              )
            )}
            <button
              type="button"
              onClick={saveSpeaker}
              disabled={!registration.metadata.speakerName?.trim()}
              className="px-5 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Αποθήκευση στοιχείων
            </button>
            {!registration.metadata.speakerName?.trim() && (
              <p className="text-xs text-warm-400 italic">
                Συμπλήρωσε τουλάχιστον το όνομα ομιλητή για να συνεχίσεις.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* STEP 2+: Content (only if speaker has a name)          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {hasSpeakerName && (
        <>
          {/* ── 2. Phrases ── */}
          <section>
            <h3 className="text-base font-semibold text-warm-800 flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-olive-100 text-olive-700 text-xs font-bold">
                2
              </span>
              Φράσεις
              <span className="text-xs font-normal text-warm-400">
                ({registration.phrases.length})
              </span>
            </h3>

            {/* Suggested prompts */}
            {suggestedPrompts && suggestedPrompts.length > 0 && registration.phrases.length === 0 && (
              <div className="mb-4">
                <p className="text-xs text-warm-500 mb-2">
                  Ιδέες — τι να ρωτήσεις τον ομιλητή:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt: string, i: number) => (
                    <span
                      key={i}
                      className="inline-block rounded-full bg-warm-50 px-3 py-1.5 text-xs text-warm-600 italic"
                    >
                      &ldquo;{prompt}&rdquo;
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Phrase list */}
            {registration.phrases.length > 0 && (
              <div className="surface-card rounded-xl overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-warm-50 text-warm-600 text-left text-xs uppercase tracking-wider">
                        <th className="px-4 py-2.5 font-medium">Βλάχικα</th>
                        <th className="px-4 py-2.5 font-medium">Ελληνικά</th>
                        <th className="px-4 py-2.5 font-medium hidden sm:table-cell">
                          Πλαίσιο
                        </th>
                        <th className="px-4 py-2.5 font-medium w-28"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100">
                      {registration.phrases.map((entry) => (
                        <tr
                          key={entry.id}
                          className="hover:bg-warm-50/60 transition-colors"
                        >
                          <td className="px-4 py-2.5 vlach-text">{entry.vlach}</td>
                          <td className="px-4 py-2.5 text-warm-700">
                            {entry.greek || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-warm-500 hidden sm:table-cell">
                            {entry.context || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditPhrase(entry)}
                                className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                              >
                                Επεξ.
                              </button>
                              <button
                                type="button"
                                onClick={() => removePhrase(entry.id)}
                                className="text-rose-500 hover:text-rose-700 text-xs font-medium"
                              >
                                Διαγ.
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add/edit phrase form */}
            {showPhraseForm ? (
              <div className="surface-card rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-warm-700">
                    {editingPhraseId ? "Επεξεργασία φράσης" : "Νέα φράση"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhraseForm(false);
                      setCurrentPhrase(createEmptyEntry());
                      setEditingPhraseId(null);
                    }}
                    className="text-xs text-warm-400 hover:text-warm-600"
                  >
                    Ακύρωση
                  </button>
                </div>
                {phraseFields?.map(
                  (field: {
                    name: string;
                    label: string;
                    required?: boolean;
                  }) => (
                    <div key={field.name}>
                      <label className="block text-xs font-medium text-warm-500 mb-1">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-500 ml-0.5">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={
                          (currentPhrase as unknown as Record<string, string>)[
                            field.name
                          ] || ""
                        }
                        onChange={(e) =>
                          setCurrentPhrase((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300"
                        placeholder={field.label}
                      />
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={addOrUpdatePhrase}
                  disabled={!currentPhrase.vlach.trim()}
                  className="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingPhraseId ? "Αποθήκευση αλλαγών" : "Προσθήκη"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCurrentPhrase(createEmptyEntry());
                  setEditingPhraseId(null);
                  setShowPhraseForm(true);
                }}
                className="rounded-lg border-2 border-dashed border-warm-200 px-4 py-3 text-sm text-warm-500 hover:border-olive-300 hover:text-olive-600 transition-colors w-full"
              >
                + Προσθήκη φράσης
              </button>
            )}
          </section>

          {/* ── 3. Audio ── */}
          <section>
            <h3 className="text-base font-semibold text-warm-800 flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-olive-100 text-olive-700 text-xs font-bold">
                3
              </span>
              Ηχογραφήσεις
              <span className="text-xs font-normal text-warm-400">
                ({registration.audioFiles.length})
              </span>
            </h3>

            {registration.audioFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                {registration.audioFiles.map((file) => (
                  <div
                    key={file.id}
                    className="surface-card rounded-lg p-3 flex items-center gap-3"
                  >
                    <svg
                      className="w-5 h-5 text-olive-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-warm-400">{formatSize(file.size)}</p>
                    </div>
                    {file.url && (
                      <audio controls className="h-8 max-w-[200px]">
                        <source src={file.url} type={file.type} />
                      </audio>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAudio(file.id)}
                      className="text-warm-300 hover:text-rose-500 transition-colors flex-shrink-0"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className="rounded-xl border-2 border-dashed border-warm-200 p-6 text-center cursor-pointer hover:border-olive-300 transition-colors"
              onClick={() => audioInputRef.current?.click()}
            >
              <svg
                className="w-8 h-8 mx-auto text-warm-300 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-4h8m-4-12a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z"
                />
              </svg>
              <p className="text-sm text-warm-500">
                Πάτα για ανέβασμα ηχογράφησης
              </p>
              <p className="text-xs text-warm-400 mt-1">
                MP3, WAV, OGG, M4A — μέχρι {maxSizeMB}MB
              </p>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleAudioUpload}
              />
            </div>
          </section>

          {/* ── 4. Notes ── */}
          <section>
            <h3 className="text-base font-semibold text-warm-800 flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-olive-100 text-olive-700 text-xs font-bold">
                4
              </span>
              Σημειώσεις
            </h3>
            <textarea
              rows={4}
              value={registration.notes}
              onChange={(e) =>
                setRegistration((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Παρατηρήσεις, ιδιαιτερότητες ντοπιολαλιάς, πλαίσιο συνέντευξης..."
              className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-y"
            />
            <button
              type="button"
              onClick={saveNotes}
              className="mt-2 px-4 py-2 bg-warm-700 text-white rounded-lg text-xs font-medium hover:bg-warm-800 transition-colors"
            >
              Αποθήκευση σημειώσεων
            </button>
          </section>

          {/* ── Finish / new ── */}
          <div className="border-t border-warm-200 pt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startNew}
              className="rounded-lg bg-olive-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-700 transition-colors"
            >
              Ολοκλήρωση & νέα καταγραφή
            </button>
            <p className="text-xs text-warm-400 self-center">
              Η τρέχουσα καταγραφή αποθηκεύεται αυτόματα. Πατώντας εδώ δημιουργείς
              νέα κενή καταγραφή για νέο ομιλητή.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
