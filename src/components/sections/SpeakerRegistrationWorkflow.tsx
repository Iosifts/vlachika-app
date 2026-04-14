"use client";

import { useState, useEffect, useRef } from "react";
import type { ModuleSection, PhraseEntry } from "@/lib/types";
import { useActiveRegistration } from "@/hooks/useActiveRegistration";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SpeakerRegistrationWorkflow({
  section,
  moduleId,
}: Props) {
  const { metadataFields, phraseFields, suggestedPrompts, audioConfig } =
    section.data;

  const reg = useActiveRegistration(moduleId);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Local UI state
  const [speakerSaved, setSpeakerSaved] = useState(false);
  const [showPhraseForm, setShowPhraseForm] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<PhraseEntry>(reg.emptyPhrase());
  const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const hasInitialized = useRef(false);

  // Init on mount
  useEffect(() => {
    reg.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set speakerSaved ONLY on initial load — not while user is typing
  useEffect(() => {
    if (reg.loading || hasInitialized.current) return;
    hasInitialized.current = true;
    const hasName = !!reg.registration.metadata.speakerName?.trim();
    const hasContent =
      hasName ||
      reg.registration.phrases.length > 0 ||
      reg.registration.audioFiles.length > 0;
    setSpeakerSaved(hasContent && hasName);
  }, [reg.loading, reg.registration]);

  // ── Derived ──

  const { registration } = reg;
  const label = (() => {
    const name = registration.metadata.speakerName || "";
    const place = registration.metadata.speakerPlace || "";
    if (name && place) return `${name} — ${place}`;
    if (name) return name;
    return "";
  })();
  const hasSpeakerName = !!registration.metadata.speakerName?.trim();
  const maxSizeMB = audioConfig?.maxSizeMB || 50;

  // ── Handlers ──

  const handleSaveSpeaker = async () => {
    await reg.saveMetadata(registration.metadata);
    setSpeakerSaved(true);
  };

  const handleAddOrUpdatePhrase = async () => {
    if (!currentPhrase.vlach.trim()) return;
    if (editingPhraseId) {
      await reg.updatePhrase({ ...currentPhrase, id: editingPhraseId });
    } else {
      await reg.addPhrase({ ...currentPhrase, status: "draft" });
    }
    setCurrentPhrase(reg.emptyPhrase());
    setEditingPhraseId(null);
    setShowPhraseForm(false);
  };

  const handleEditPhrase = (entry: PhraseEntry) => {
    setCurrentPhrase(entry);
    setEditingPhraseId(entry.id);
    setShowPhraseForm(true);
  };

  const handleRemovePhrase = async (id: string) => {
    await reg.removePhrase(id);
    if (editingPhraseId === id) {
      setCurrentPhrase(reg.emptyPhrase());
      setEditingPhraseId(null);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Το αρχείο "${file.name}" υπερβαίνει το όριο ${maxSizeMB}MB.`);
        continue;
      }
      await reg.uploadAudio(file);
    }
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handleSaveNotes = async () => {
    await reg.saveNotes(registration.notes);
  };

  const handleSwitchTo = async (id: string) => {
    await reg.switchTo(id);
    setShowSwitcher(false);
    // Re-evaluate on next render cycle
    hasInitialized.current = false;
    setSpeakerSaved(false);
  };

  const handleStartNew = async () => {
    await reg.createNew();
    setShowSwitcher(false);
    hasInitialized.current = false;
    setSpeakerSaved(false);
    setShowPhraseForm(false);
    setCurrentPhrase(reg.emptyPhrase());
    setEditingPhraseId(null);
  };

  // ── Loading ──

  if (reg.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-warm-400 text-sm animate-pulse">Φόρτωση...</div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="space-y-8">
      {/* ── Flash ── */}
      {reg.flash && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-olive-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-pulse">
          {reg.flash}
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="surface-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-warm-400">
            Ενεργή καταγραφή
          </p>
          <p className="text-lg font-semibold text-warm-800">
            {label || "Νέος ομιλητής (χωρίς όνομα)"}
          </p>
          <p className="text-xs text-warm-400 mt-0.5">
            {registration.phrases.length} φράσεις ·{" "}
            {registration.audioFiles.length} ηχογραφήσεις
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
            onClick={handleStartNew}
            disabled={reg.saving}
            className="rounded-lg bg-olive-600 px-3 py-2 text-xs font-medium text-white hover:bg-olive-700 transition-colors disabled:opacity-50"
          >
            + Νέα καταγραφή
          </button>
        </div>
      </div>

      {/* ── Switcher ── */}
      {showSwitcher && reg.allRegistrations.length > 1 && (
        <div className="surface-card rounded-xl overflow-hidden border border-warm-200">
          <p className="px-4 py-2 bg-warm-50 text-xs font-medium text-warm-500 uppercase tracking-wide">
            Υπάρχουσες καταγραφές
          </p>
          <div className="divide-y divide-warm-100">
            {reg.allRegistrations
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((r) => {
                const isActive = r.id === registration.id;
                const rLabel =
                  r.metadata.speakerName || r.metadata.name || "Χωρίς όνομα";
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={isActive}
                    onClick={() => handleSwitchTo(r.id)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-olive-50 text-olive-700 font-medium cursor-default"
                        : "hover:bg-warm-50 text-warm-700"
                    }`}
                  >
                    <span>{rLabel}</span>
                    <span className="ml-2 text-xs text-warm-400">
                      {r.phrases.length} φράσεις
                      {isActive && " · ενεργή"}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* ═══ STEP 1: Speaker details ═══ */}
      <section>
        <button
          type="button"
          onClick={() =>
            setSpeakerSaved(!speakerSaved || !hasSpeakerName ? false : !speakerSaved)
          }
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
                    onChange={(e) =>
                      reg.setLocalMetadata((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-300 bg-warm-50 text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-olive-400 focus:bg-white placeholder:text-warm-400"
                    placeholder={field.label}
                  />
                </div>
              )
            )}
            <button
              type="button"
              onClick={handleSaveSpeaker}
              disabled={!registration.metadata.speakerName?.trim() || reg.saving}
              className="px-5 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reg.saving ? "Αποθήκευση..." : "Αποθήκευση στοιχείων"}
            </button>
            {!registration.metadata.speakerName?.trim() && (
              <p className="text-xs text-warm-400 italic">
                Συμπλήρωσε τουλάχιστον το όνομα ομιλητή για να συνεχίσεις.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ═══ STEPS 2-4: Only if speaker is identified ═══ */}
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

            {/* Suggested prompts (only when no phrases yet) */}
            {suggestedPrompts?.length > 0 &&
              registration.phrases.length === 0 && (
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

            {/* Phrase table */}
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
                          <td className="px-4 py-2.5 vlach-text">
                            {entry.vlach}
                          </td>
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
                                onClick={() => handleEditPhrase(entry)}
                                className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                              >
                                Επεξ.
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePhrase(entry.id)}
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
                      setCurrentPhrase(reg.emptyPhrase());
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
                          (
                            currentPhrase as unknown as Record<string, string>
                          )[field.name] || ""
                        }
                        onChange={(e) =>
                          setCurrentPhrase((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-warm-300 bg-warm-50 text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:bg-white placeholder:text-warm-400"
                        placeholder={field.label}
                      />
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={handleAddOrUpdatePhrase}
                  disabled={!currentPhrase.vlach.trim() || reg.saving}
                  className="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingPhraseId ? "Αποθήκευση αλλαγών" : "Προσθήκη"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCurrentPhrase(reg.emptyPhrase());
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
                      <p className="text-xs text-warm-400">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    {file.url && (
                      <audio controls className="h-8 max-w-[200px]">
                        <source src={file.url} type={file.type} />
                      </audio>
                    )}
                    <button
                      type="button"
                      onClick={() => reg.removeAudio(file.id)}
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
              onChange={(e) => reg.setLocalNotes(e.target.value)}
              placeholder="Παρατηρήσεις, ιδιαιτερότητες ντοπιολαλιάς, πλαίσιο συνέντευξης..."
              className="w-full px-4 py-3 rounded-xl border border-warm-300 bg-warm-50 text-sm text-warm-900 leading-7 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:bg-white placeholder:text-warm-400 resize-y"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={reg.saving}
              className="mt-2 px-4 py-2 bg-warm-700 text-white rounded-lg text-xs font-medium hover:bg-warm-800 transition-colors disabled:opacity-50"
            >
              {reg.saving ? "Αποθήκευση..." : "Αποθήκευση σημειώσεων"}
            </button>
          </section>

          {/* ── Finish ── */}
          <div className="border-t border-warm-200 pt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStartNew}
              disabled={reg.saving}
              className="rounded-lg bg-olive-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-700 transition-colors disabled:opacity-50"
            >
              Ολοκλήρωση & νέα καταγραφή
            </button>
            <p className="text-xs text-warm-400 self-center">
              Η τρέχουσα καταγραφή αποθηκεύεται αυτόματα. Πατώντας εδώ
              δημιουργείς νέα κενή καταγραφή για νέο ομιλητή.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
