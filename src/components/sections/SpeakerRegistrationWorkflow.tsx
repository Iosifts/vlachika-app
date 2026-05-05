"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { ModuleSection, PhraseEntry } from "@/lib/types";
import { useActiveRegistration } from "@/hooks/useActiveRegistration";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

type MetadataField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
};

type PhraseField = {
  name: string;
  label: string;
  required?: boolean;
};

type Step = "speaker" | "phrases" | "notes" | "review";
const STEP_ORDER: Step[] = ["speaker", "phrases", "notes", "review"];
const STEP_LABEL: Record<Step, string> = {
  speaker: "Στοιχεία",
  phrases: "Φράσεις",
  notes: "Σημειώσεις",
  review: "Ολοκλήρωση",
};

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
    section.data as {
      metadataFields: MetadataField[];
      phraseFields: PhraseField[];
      suggestedPrompts?: string[];
      audioConfig?: { maxSizeMB?: number };
    };

  const reg = useActiveRegistration(moduleId);
  const [step, setStep] = useState<Step>("speaker");
  const [reachedStep, setReachedStep] = useState<Step>("speaker");
  const initOnceRef = useRef(false);

  useEffect(() => {
    reg.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After loading, position the user at the right step.
  useEffect(() => {
    if (reg.loading || initOnceRef.current) return;
    initOnceRef.current = true;
    const r = reg.registration;
    if (!r.id) {
      setStep("speaker");
      setReachedStep("speaker");
      return;
    }
    if (r.phrases.length > 0) {
      setStep("phrases");
      setReachedStep("phrases");
    } else if (r.metadata.speakerName?.trim()) {
      setStep("phrases");
      setReachedStep("phrases");
    } else {
      setStep("speaker");
      setReachedStep("speaker");
    }
  }, [reg.loading, reg.registration]);

  if (reg.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-warm-400 text-sm animate-pulse">Φόρτωση...</div>
      </div>
    );
  }

  // ─── Landing screen ───────────────────────────────────────
  // Shown when there's no active registration with content. Avoids the
  // "blank registration appearing before I've done anything" feeling.

  if (!reg.hasActive) {
    return (
      <Landing
        existing={reg.allRegistrations}
        onStart={async () => {
          await reg.ensureActive();
          setStep("speaker");
          setReachedStep("speaker");
          initOnceRef.current = true;
        }}
        onResume={async (id) => {
          await reg.switchTo(id);
          initOnceRef.current = false; // let the effect re-evaluate step
        }}
        flash={reg.flash}
      />
    );
  }

  const currentIdx = STEP_ORDER.indexOf(step);
  const reachedIdx = STEP_ORDER.indexOf(reachedStep);

  const advance = (to: Step) => {
    setStep(to);
    if (STEP_ORDER.indexOf(to) > reachedIdx) setReachedStep(to);
  };

  // ─── Wizard ───────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {reg.flash && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-olive-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-pulse">
          {reg.flash}
        </div>
      )}

      <ActiveBar reg={reg} />

      <Stepper
        currentIdx={currentIdx}
        reachedIdx={reachedIdx}
        onJump={(idx) => {
          if (idx <= reachedIdx) setStep(STEP_ORDER[idx]);
        }}
      />

      {step === "speaker" && (
        <SpeakerStep
          fields={metadataFields}
          metadata={reg.registration.metadata}
          saving={reg.saving}
          onChange={(name, value) =>
            reg.setLocalMetadata((prev) => ({ ...prev, [name]: value }))
          }
          onContinue={async () => {
            await reg.saveMetadata(reg.registration.metadata);
            advance("phrases");
          }}
        />
      )}

      {step === "phrases" && (
        <PhrasesStep
          fields={phraseFields}
          suggestedPrompts={suggestedPrompts ?? []}
          phrases={reg.registration.phrases}
          audioFiles={reg.registration.audioFiles}
          maxSizeMB={audioConfig?.maxSizeMB ?? 50}
          saving={reg.saving}
          emptyPhrase={reg.emptyPhrase}
          onAddPhrase={reg.addPhrase}
          onUpdatePhrase={reg.updatePhrase}
          onRemovePhrase={reg.removePhrase}
          onUploadAudio={reg.uploadAudio}
          onRemoveAudio={reg.removeAudio}
          onLinkPhraseAudio={reg.linkPhraseAudio}
          onBack={() => setStep("speaker")}
          onContinue={() => advance("notes")}
        />
      )}

      {step === "notes" && (
        <NotesStep
          notes={reg.registration.notes}
          saving={reg.saving}
          onChange={(v) => reg.setLocalNotes(v)}
          onSave={() => reg.saveNotes(reg.registration.notes)}
          onBack={() => setStep("phrases")}
          onContinue={async () => {
            await reg.saveNotes(reg.registration.notes);
            advance("review");
          }}
        />
      )}

      {step === "review" && (
        <ReviewStep
          metadata={reg.registration.metadata}
          phrases={reg.registration.phrases}
          audioFiles={reg.registration.audioFiles}
          notes={reg.registration.notes}
          saving={reg.saving}
          onBack={() => setStep("notes")}
          onFinish={async () => {
            await reg.finishActive();
            setStep("speaker");
            setReachedStep("speaker");
            initOnceRef.current = true;
          }}
          onStartAnother={async () => {
            await reg.createNew();
            setStep("speaker");
            setReachedStep("speaker");
            initOnceRef.current = true;
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Active bar — small "currently editing" header with switcher
// ═══════════════════════════════════════════════════════════════

function ActiveBar({
  reg,
}: {
  reg: ReturnType<typeof useActiveRegistration>;
}) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const r = reg.registration;
  const name =
    r.metadata.speakerName?.trim() ||
    r.metadata.name?.trim() ||
    "Νέος ομιλητής";
  const place = r.metadata.speakerPlace || r.metadata.place || "";
  const subtitle = [
    `${r.phrases.length} ${r.phrases.length === 1 ? "φράση" : "φράσεις"}`,
    `${r.audioFiles.length} ${r.audioFiles.length === 1 ? "ηχογράφηση" : "ηχογραφήσεις"}`,
  ].join(" · ");

  return (
    <div className="surface-card rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-warm-400">
            Καταγραφή σε εξέλιξη
          </p>
          <p className="text-base font-semibold text-warm-800">
            {name}
            {place && (
              <span className="text-warm-500 font-normal"> — {place}</span>
            )}
          </p>
          <p className="text-xs text-warm-400 mt-0.5">{subtitle}</p>
        </div>
        {reg.allRegistrations.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSwitcher((v) => !v)}
            className="rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-xs font-medium text-warm-600 hover:bg-warm-50 transition-colors"
          >
            Άλλη καταγραφή ({reg.allRegistrations.length})
          </button>
        )}
      </div>

      {showSwitcher && reg.allRegistrations.length > 0 && (
        <div className="mt-3 -mx-4 -mb-4 border-t border-warm-100 divide-y divide-warm-100">
          {reg.allRegistrations
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((other) => {
              const isActive = other.id === r.id;
              const otherLabel =
                other.metadata.speakerName ||
                other.metadata.name ||
                "Χωρίς όνομα";
              return (
                <button
                  key={other.id}
                  type="button"
                  disabled={isActive}
                  onClick={async () => {
                    await reg.switchTo(other.id);
                    setShowSwitcher(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-olive-50 text-olive-700 font-medium cursor-default"
                      : "hover:bg-warm-50 text-warm-700"
                  }`}
                >
                  <span>{otherLabel}</span>
                  <span className="ml-2 text-xs text-warm-400">
                    {other.phrases.length} φράσεις
                    {isActive && " · ενεργή"}
                  </span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Stepper
// ═══════════════════════════════════════════════════════════════

function Stepper({
  currentIdx,
  reachedIdx,
  onJump,
}: {
  currentIdx: number;
  reachedIdx: number;
  onJump: (idx: number) => void;
}) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
      {STEP_ORDER.map((s, idx) => {
        const reached = idx <= reachedIdx;
        const active = idx === currentIdx;
        return (
          <li key={s} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              disabled={!reached}
              onClick={() => onJump(idx)}
              className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-olive-600 text-white"
                  : reached
                    ? "bg-olive-50 text-olive-700 hover:bg-olive-100"
                    : "bg-warm-100 text-warm-400 cursor-not-allowed"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                  active
                    ? "bg-white text-olive-700"
                    : reached
                      ? "bg-olive-600 text-white"
                      : "bg-warm-200 text-warm-500"
                }`}
              >
                {idx + 1}
              </span>
              {STEP_LABEL[s]}
            </button>
            {idx < STEP_ORDER.length - 1 && (
              <span
                className={`block h-px w-4 sm:w-8 ${
                  idx < reachedIdx ? "bg-olive-400" : "bg-warm-200"
                }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ═══════════════════════════════════════════════════════════════
// Landing — "no active registration"
// ═══════════════════════════════════════════════════════════════

function Landing({
  existing,
  onStart,
  onResume,
  flash,
}: {
  existing: ReturnType<typeof useActiveRegistration>["allRegistrations"];
  onStart: () => Promise<void>;
  onResume: (id: string) => Promise<void>;
  flash: string | null;
}) {
  return (
    <div className="space-y-6">
      {flash && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-olive-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-pulse">
          {flash}
        </div>
      )}
      <div className="surface-card rounded-2xl p-8 sm:p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-14 0M12 18v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-warm-800">
          Έτοιμος/η να καταγράψεις έναν ομιλητή;
        </h3>
        <p className="mt-2 text-sm text-warm-500 max-w-md mx-auto">
          Θα σε καθοδηγήσουμε βήμα βήμα: πρώτα τα στοιχεία του ομιλητή, μετά
          φράση + ηχογράφηση μαζί, και στο τέλος σημειώσεις.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-sm font-semibold text-white hover:bg-olive-700 transition-colors"
        >
          Ξεκίνα νέα καταγραφή
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
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>

      {existing.length > 0 && (
        <div className="surface-card rounded-xl overflow-hidden">
          <p className="px-4 py-2.5 bg-warm-50 text-xs font-medium text-warm-500 uppercase tracking-wide">
            ή συνέχισε προηγούμενη
          </p>
          <div className="divide-y divide-warm-100">
            {existing
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((r) => {
                const name =
                  r.metadata.speakerName ||
                  r.metadata.name ||
                  "Χωρίς όνομα";
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onResume(r.id)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-warm-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-warm-800">{name}</p>
                      <p className="text-xs text-warm-400 mt-0.5">
                        {r.phrases.length} φράσεις · {r.audioFiles.length}{" "}
                        ηχογραφήσεις
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-warm-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 1 — Speaker metadata
// ═══════════════════════════════════════════════════════════════

function SpeakerStep({
  fields,
  metadata,
  saving,
  onChange,
  onContinue,
}: {
  fields: MetadataField[];
  metadata: Record<string, string>;
  saving: boolean;
  onChange: (name: string, value: string) => void;
  onContinue: () => void;
}) {
  // Only the required fields are shown by default. Optional fields collapse
  // behind a single toggle so the form doesn't dump everything at once.
  const required = fields.filter((f) => f.required);
  const optional = fields.filter((f) => !f.required);
  const [showOptional, setShowOptional] = useState(false);

  const canContinue = required.every((f) => metadata[f.name]?.trim());

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
      <header>
        <h3 className="text-lg font-semibold text-warm-800">
          Ποιον ομιλητή καταγράφεις;
        </h3>
        <p className="text-sm text-warm-500 mt-1">
          Συμπλήρωσε τα βασικά. Τα υπόλοιπα μπορείς να τα προσθέσεις αργότερα.
        </p>
      </header>

      <div className="space-y-4">
        {required.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={metadata[field.name] || ""}
            onChange={(v) => onChange(field.name, v)}
          />
        ))}
      </div>

      {optional.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="text-xs font-medium text-olive-600 hover:text-olive-800 inline-flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showOptional ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            {showOptional
              ? "Λιγότερα στοιχεία"
              : `Περισσότερα στοιχεία (${optional.length} προαιρετικά)`}
          </button>
          {showOptional && (
            <div className="mt-4 space-y-4">
              {optional.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={metadata[field.name] || ""}
                  onChange={(v) => onChange(field.name, v)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || saving}
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση & συνέχεια"}
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
              d="M14 5l7 7-7 7M3 12h18"
            />
          </svg>
        </button>
        {!canContinue && (
          <p className="text-xs text-warm-400">
            Συμπλήρωσε τα πεδία με αστερίσκο για να συνεχίσεις.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: MetadataField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-warm-600 mb-1">
        {field.label}
        {field.required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type={field.type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-warm-300 bg-warm-50 text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-olive-400 focus:bg-white placeholder:text-warm-400"
        placeholder={field.label}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 2 — Phrases (each with its own audio)
// ═══════════════════════════════════════════════════════════════

type ActiveSubStep = "text" | "audio";

function PhrasesStep({
  fields,
  suggestedPrompts,
  phrases,
  audioFiles,
  maxSizeMB,
  saving,
  emptyPhrase,
  onAddPhrase,
  onUpdatePhrase,
  onRemovePhrase,
  onUploadAudio,
  onRemoveAudio,
  onLinkPhraseAudio,
  onBack,
  onContinue,
}: {
  fields: PhraseField[];
  suggestedPrompts: string[];
  phrases: PhraseEntry[];
  audioFiles: ReturnType<
    typeof useActiveRegistration
  >["registration"]["audioFiles"];
  maxSizeMB: number;
  saving: boolean;
  emptyPhrase: () => PhraseEntry;
  onAddPhrase: (p: PhraseEntry) => Promise<PhraseEntry | undefined>;
  onUpdatePhrase: (p: PhraseEntry) => Promise<void>;
  onRemovePhrase: (id: string) => Promise<void>;
  onUploadAudio: (
    file: File
  ) => Promise<ReturnType<
    typeof useActiveRegistration
  >["registration"]["audioFiles"][number] | null>;
  onRemoveAudio: (id: string) => Promise<void>;
  onLinkPhraseAudio: (phraseId: string, audioId: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [draft, setDraft] = useState<PhraseEntry>(() => emptyPhrase());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<ActiveSubStep>("text");
  // The phrase id (saved) for which we're currently capturing audio.
  const [pendingAudioPhraseId, setPendingAudioPhraseId] = useState<string | null>(
    null
  );
  // For attaching audio to an already-saved phrase from the list.
  const [attachingToId, setAttachingToId] = useState<string | null>(null);

  const audioById = useMemo(() => {
    const m = new Map<string, (typeof audioFiles)[number]>();
    for (const a of audioFiles) m.set(a.id, a);
    return m;
  }, [audioFiles]);

  const canContinue = phrases.length > 0;

  const resetDraft = () => {
    setDraft(emptyPhrase());
    setEditingId(null);
    setActiveSub("text");
    setPendingAudioPhraseId(null);
  };

  const handleSaveText = async () => {
    if (!draft.vlach.trim()) return;
    if (editingId) {
      await onUpdatePhrase({ ...draft, id: editingId });
      // After editing existing text, stay in audio sub-step for that phrase.
      setPendingAudioPhraseId(editingId);
      setActiveSub("audio");
    } else {
      const saved = await onAddPhrase({ ...draft, status: "draft" });
      const newId = saved?.id ?? draft.id;
      setPendingAudioPhraseId(newId);
      setActiveSub("audio");
    }
  };

  const handleAttachAudio = async (file: File, phraseId: string) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Το αρχείο "${file.name}" υπερβαίνει το όριο ${maxSizeMB}MB.`);
      return;
    }
    const audio = await onUploadAudio(file);
    if (!audio) return; // upload failed; the hook already flashed an error
    onLinkPhraseAudio(phraseId, audio.id);
  };

  const handleDetachAudio = async (phrase: PhraseEntry) => {
    if (!phrase.audioFileId) return;
    const audioId = phrase.audioFileId;
    onLinkPhraseAudio(phrase.id, null);
    await onRemoveAudio(audioId);
  };

  const handleEditExisting = (phrase: PhraseEntry) => {
    setDraft({ ...phrase });
    setEditingId(phrase.id);
    setPendingAudioPhraseId(null);
    setActiveSub("text");
  };

  const handleNextPhrase = () => {
    resetDraft();
  };

  return (
    <div className="space-y-5">
      {/* Saved phrases list */}
      {phrases.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-warm-500 font-medium">
            Καταγεγραμμένες φράσεις ({phrases.length})
          </p>
          {phrases.map((phrase, idx) => {
            const audio = phrase.audioFileId
              ? audioById.get(phrase.audioFileId)
              : undefined;
            const isAttaching = attachingToId === phrase.id;
            return (
              <article
                key={phrase.id}
                className="surface-card rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-warm-400 mb-0.5">
                      Φράση {idx + 1}
                    </p>
                    <p className="vlach-text text-base">{phrase.vlach}</p>
                    {phrase.greek && (
                      <p className="text-sm text-warm-600 mt-0.5">
                        {phrase.greek}
                      </p>
                    )}
                    {phrase.context && (
                      <p className="text-xs text-warm-400 mt-1 italic">
                        {phrase.context}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditExisting(phrase)}
                      className="text-xs font-medium text-sky-600 hover:text-sky-800"
                    >
                      Επεξ.
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePhrase(phrase.id)}
                      className="text-xs font-medium text-rose-500 hover:text-rose-700"
                    >
                      Διαγ.
                    </button>
                  </div>
                </div>

                <div className="border-t border-warm-100 pt-2">
                  {audio ? (
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 text-olive-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19V6l12-3v13"
                        />
                      </svg>
                      {audio.url ? (
                        <audio controls className="h-8 flex-1 max-w-md">
                          <source src={audio.url} type={audio.type} />
                        </audio>
                      ) : (
                        <span className="text-xs text-warm-500">
                          {audio.name}
                        </span>
                      )}
                      <span className="text-xs text-warm-400">
                        {formatSize(audio.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDetachAudio(phrase)}
                        className="text-xs font-medium text-warm-400 hover:text-rose-500"
                      >
                        Αφαίρεση
                      </button>
                    </div>
                  ) : isAttaching ? (
                    <AudioDropzone
                      maxSizeMB={maxSizeMB}
                      saving={saving}
                      onPick={async (file) => {
                        await handleAttachAudio(file, phrase.id);
                        setAttachingToId(null);
                      }}
                      onCancel={() => setAttachingToId(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAttachingToId(phrase.id)}
                      className="text-xs font-medium text-olive-600 hover:text-olive-800 inline-flex items-center gap-1"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 11a7 7 0 01-14 0M12 18v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"
                        />
                      </svg>
                      + Προσθήκη ηχογράφησης
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Active phrase form */}
      <ActivePhraseCard
        fields={fields}
        draft={draft}
        editingId={editingId}
        activeSub={activeSub}
        suggestedPrompts={suggestedPrompts}
        showSuggestions={phrases.length === 0 && !editingId}
        saving={saving}
        maxSizeMB={maxSizeMB}
        pendingAudioPhraseId={pendingAudioPhraseId}
        existingAudio={
          pendingAudioPhraseId
            ? phrases.find((p) => p.id === pendingAudioPhraseId)?.audioFileId
              ? audioById.get(
                  phrases.find((p) => p.id === pendingAudioPhraseId)!
                    .audioFileId!
                )
              : undefined
            : undefined
        }
        onChangeField={(name, value) =>
          setDraft((prev) => ({ ...prev, [name]: value }))
        }
        onCancelEdit={resetDraft}
        onSaveText={handleSaveText}
        onAttachAudio={(file) => {
          if (pendingAudioPhraseId)
            handleAttachAudio(file, pendingAudioPhraseId);
        }}
        onSkipAudio={handleNextPhrase}
        onFinishPhrase={handleNextPhrase}
        onDetachAudio={() => {
          const target = phrases.find((p) => p.id === pendingAudioPhraseId);
          if (target) handleDetachAudio(target);
        }}
      />

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-warm-200">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-warm-500 hover:text-warm-700 inline-flex items-center gap-1"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Στοιχεία ομιλητή
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Συνέχεια στις σημειώσεις
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
              d="M14 5l7 7-7 7M3 12h18"
            />
          </svg>
        </button>
      </div>
      {!canContinue && (
        <p className="text-xs text-warm-400 text-right">
          Πρόσθεσε τουλάχιστον μία φράση για να συνεχίσεις.
        </p>
      )}
    </div>
  );
}

function ActivePhraseCard({
  fields,
  draft,
  editingId,
  activeSub,
  suggestedPrompts,
  showSuggestions,
  saving,
  maxSizeMB,
  pendingAudioPhraseId,
  existingAudio,
  onChangeField,
  onCancelEdit,
  onSaveText,
  onAttachAudio,
  onSkipAudio,
  onFinishPhrase,
  onDetachAudio,
}: {
  fields: PhraseField[];
  draft: PhraseEntry;
  editingId: string | null;
  activeSub: ActiveSubStep;
  suggestedPrompts: string[];
  showSuggestions: boolean;
  saving: boolean;
  maxSizeMB: number;
  pendingAudioPhraseId: string | null;
  existingAudio?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  };
  onChangeField: (name: string, value: string) => void;
  onCancelEdit: () => void;
  onSaveText: () => void;
  onAttachAudio: (file: File) => void;
  onSkipAudio: () => void;
  onFinishPhrase: () => void;
  onDetachAudio: () => void;
}) {
  const isEditing = !!editingId;

  return (
    <div className="rounded-2xl border-2 border-olive-200 bg-olive-50/30 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-olive-700 font-semibold">
            {activeSub === "text"
              ? isEditing
                ? "Επεξεργασία φράσης"
                : "Νέα φράση"
              : "Ηχογράφηση για αυτή τη φράση"}
          </p>
          <p className="text-sm text-warm-600 mt-0.5">
            {activeSub === "text"
              ? "Γράψε τη φράση ακριβώς όπως τη λέει ο ομιλητής."
              : "Ανέβασε ή ηχογράφησε τη φράση για ζωντανό αρχείο."}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-warm-400 hover:text-warm-600"
          >
            Ακύρωση
          </button>
        )}
      </div>

      {activeSub === "text" && (
        <>
          {showSuggestions && suggestedPrompts.length > 0 && (
            <div className="rounded-lg bg-white/70 border border-olive-100 p-3">
              <p className="text-xs text-warm-500 mb-2 font-medium">
                Ιδέες — τι να ρωτήσεις:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((prompt, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-full bg-warm-50 px-2.5 py-1 text-[11px] text-warm-600 italic"
                  >
                    &ldquo;{prompt}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-warm-600 mb-1">
                  {field.label}
                  {field.required && (
                    <span className="text-rose-500 ml-0.5">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={
                    (draft as unknown as Record<string, string>)[field.name] ||
                    ""
                  }
                  onChange={(e) => onChangeField(field.name, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-warm-300 bg-white text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-olive-400 placeholder:text-warm-400"
                  placeholder={field.label}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSaveText}
              disabled={!draft.vlach.trim() || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? "Αποθήκευση..."
                : isEditing
                  ? "Αποθήκευση"
                  : "Αποθήκευση & ηχογράφηση"}
            </button>
            {!draft.vlach.trim() && (
              <p className="text-xs text-warm-400">
                Συμπλήρωσε τη φράση στα βλάχικα.
              </p>
            )}
          </div>
        </>
      )}

      {activeSub === "audio" && pendingAudioPhraseId && (
        <div className="space-y-3">
          {existingAudio ? (
            <div className="rounded-lg bg-white border border-olive-200 p-3 flex items-center gap-3">
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
                  d="M9 19V6l12-3v13"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {existingAudio.name}
                </p>
                <p className="text-xs text-warm-400">
                  {formatSize(existingAudio.size)}
                </p>
              </div>
              {existingAudio.url && (
                <audio controls className="h-8 max-w-[180px]">
                  <source src={existingAudio.url} type={existingAudio.type} />
                </audio>
              )}
              <button
                type="button"
                onClick={onDetachAudio}
                className="text-xs font-medium text-warm-400 hover:text-rose-500"
              >
                Αφαίρεση
              </button>
            </div>
          ) : (
            <AudioDropzone
              maxSizeMB={maxSizeMB}
              saving={saving}
              onPick={onAttachAudio}
              hint="Δεν είναι υποχρεωτικό — μπορείς να το παραλείψεις."
            />
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onFinishPhrase}
              className="inline-flex items-center gap-2 rounded-lg bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 transition-colors"
            >
              {existingAudio ? "Επόμενη φράση" : "Επόμενη φράση"}
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
                  d="M14 5l7 7-7 7M3 12h18"
                />
              </svg>
            </button>
            {!existingAudio && (
              <button
                type="button"
                onClick={onSkipAudio}
                className="text-xs font-medium text-warm-500 hover:text-warm-700 underline"
              >
                Παράλειψη ηχογράφησης
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AudioDropzone({
  maxSizeMB,
  saving,
  onPick,
  onCancel,
  hint,
}: {
  maxSizeMB: number;
  saving: boolean;
  onPick: (file: File) => void | Promise<void>;
  onCancel?: () => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <div
        className="rounded-xl border-2 border-dashed border-olive-200 bg-white p-5 text-center cursor-pointer hover:border-olive-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <svg
          className="w-7 h-7 mx-auto text-olive-400 mb-1.5"
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
        <p className="text-sm text-warm-700 font-medium">
          {saving ? "Ανέβασμα..." : "Πάτα για ανέβασμα ηχογράφησης"}
        </p>
        <p className="text-xs text-warm-400 mt-0.5">
          MP3, WAV, OGG, M4A — μέχρι {maxSizeMB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>
      {(hint || onCancel) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-warm-400">{hint}</span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-warm-400 hover:text-warm-600"
            >
              Ακύρωση
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 3 — Notes
// ═══════════════════════════════════════════════════════════════

function NotesStep({
  notes,
  saving,
  onChange,
  onSave,
  onBack,
  onContinue,
}: {
  notes: string;
  saving: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4">
      <header>
        <h3 className="text-lg font-semibold text-warm-800">
          Σημειώσεις (προαιρετικά)
        </h3>
        <p className="text-sm text-warm-500 mt-1">
          Παρατηρήσεις για τον ομιλητή ή τη συνέντευξη: ντοπιολαλιά, ιδιαίτερες
          εκφράσεις, πλαίσιο.
        </p>
      </header>
      <textarea
        rows={6}
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        placeholder="Παρατηρήσεις, ιδιαιτερότητες ντοπιολαλιάς, πλαίσιο συνέντευξης..."
        className="w-full px-4 py-3 rounded-xl border border-warm-300 bg-warm-50 text-sm text-warm-900 leading-7 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:bg-white placeholder:text-warm-400 resize-y"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-warm-200">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-warm-500 hover:text-warm-700 inline-flex items-center gap-1"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Φράσεις
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700 transition-colors disabled:opacity-40"
        >
          {saving ? "Αποθήκευση..." : "Συνέχεια στην ολοκλήρωση"}
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
              d="M14 5l7 7-7 7M3 12h18"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Step 4 — Review
// ═══════════════════════════════════════════════════════════════

function ReviewStep({
  metadata,
  phrases,
  audioFiles,
  notes,
  saving,
  onBack,
  onFinish,
  onStartAnother,
}: {
  metadata: Record<string, string>;
  phrases: PhraseEntry[];
  audioFiles: ReturnType<
    typeof useActiveRegistration
  >["registration"]["audioFiles"];
  notes: string;
  saving: boolean;
  onBack: () => void;
  onFinish: () => void;
  onStartAnother: () => void;
}) {
  const filledMeta = Object.entries(metadata).filter(([, v]) => !!v?.trim());
  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
      <header>
        <h3 className="text-lg font-semibold text-warm-800">
          Ολοκλήρωση καταγραφής
        </h3>
        <p className="text-sm text-warm-500 mt-1">
          Ρίξε μια τελευταία ματιά πριν ξεκινήσεις άλλον ομιλητή. Όλα είναι ήδη
          αποθηκευμένα.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStat
          label="Φράσεις"
          value={phrases.length}
          accent="olive"
        />
        <SummaryStat
          label="Ηχογραφήσεις"
          value={audioFiles.length}
          accent="sky"
        />
        <SummaryStat
          label="Στοιχεία ομιλητή"
          value={filledMeta.length}
          accent="warm"
        />
      </div>

      {filledMeta.length > 0 && (
        <details className="rounded-lg bg-warm-50 px-4 py-3 group" open>
          <summary className="cursor-pointer text-sm font-medium text-warm-700 list-none flex items-center justify-between">
            <span>Στοιχεία</span>
            <svg
              className="w-4 h-4 text-warm-400 group-open:rotate-180 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            {filledMeta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-warm-400">{k}</dt>
                <dd className="text-warm-700">{v}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {notes && (
        <details className="rounded-lg bg-warm-50 px-4 py-3 group">
          <summary className="cursor-pointer text-sm font-medium text-warm-700 list-none flex items-center justify-between">
            <span>Σημειώσεις</span>
            <svg
              className="w-4 h-4 text-warm-400 group-open:rotate-180 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <p className="mt-2 text-sm text-warm-700 whitespace-pre-wrap leading-7">
            {notes}
          </p>
        </details>
      )}

      <div className="rounded-xl bg-olive-50 border border-olive-200 px-4 py-3 text-sm text-olive-700 flex items-start gap-2">
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>
          Όλα έχουν αποθηκευτεί αυτόματα. Πάτα <strong>Ολοκλήρωση</strong> για
          να την κλείσεις και να εμφανιστεί στο «Αρχείο καταγραφών».
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-warm-200">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-warm-500 hover:text-warm-700 inline-flex items-center gap-1"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Πίσω στις σημειώσεις
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStartAnother}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-lg border border-warm-200 bg-white px-4 py-2 text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors disabled:opacity-40"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Νέος ομιλητής
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700 transition-colors disabled:opacity-40"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Ολοκλήρωση
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "olive" | "sky" | "warm";
}) {
  const tone =
    accent === "olive"
      ? "bg-olive-50 text-olive-700"
      : accent === "sky"
        ? "bg-sky-50 text-sky-700"
        : "bg-warm-50 text-warm-700";
  return (
    <div className={`rounded-xl px-4 py-3 ${tone}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-semibold mt-0.5">{value}</p>
    </div>
  );
}
