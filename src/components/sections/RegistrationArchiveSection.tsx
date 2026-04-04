"use client";

import { useState } from "react";
import type { ModuleSection, SpeakerRegistration } from "@/lib/types";
import {
  deleteRegistration,
  loadRegistrations,
  setActiveRegistrationId,
} from "@/lib/registrations";
import { useAdmin } from "../AdminContext";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

function speakerLabel(reg: SpeakerRegistration) {
  const name = reg.metadata.speakerName || reg.metadata.name || "Χωρίς όνομα";
  const place = reg.metadata.speakerPlace || reg.metadata.place;
  return place ? `${name} — ${place}` : name;
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

export default function RegistrationArchiveSection({ moduleId }: Props) {
  const { isAdmin } = useAdmin();
  const [registrations, setRegistrations] = useState<SpeakerRegistration[]>(
    () => loadRegistrations(moduleId).filter(hasContent)
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    registrations[0]?.id || null
  );

  const selected =
    registrations.find((r) => r.id === selectedId) || null;

  const handleDelete = (id: string) => {
    if (!confirm("Σίγουρα θέλεις να διαγράψεις αυτή την καταγραφή;")) return;
    const next = deleteRegistration(moduleId, id);
    const filtered = next.filter(hasContent);
    setRegistrations(filtered);
    setSelectedId(filtered[0]?.id || null);
  };

  const handleActivate = (id: string) => {
    setActiveRegistrationId(moduleId, id);
    alert(
      "Η καταγραφή ενεργοποιήθηκε. Πήγαινε στην καρτέλα «Καταγραφή ομιλητή» για επεξεργασία."
    );
  };

  if (registrations.length === 0) {
    return (
      <div className="surface-card rounded-xl p-8 text-center">
        <svg
          className="w-12 h-12 mx-auto text-warm-200 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-warm-500 text-sm">
          Δεν υπάρχουν ακόμη αποθηκευμένες καταγραφές με περιεχόμενο.
        </p>
        <p className="text-warm-400 text-xs mt-1">
          Χρησιμοποίησε την καρτέλα «Καταγραφή ομιλητή» για να ξεκινήσεις.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-warm-800">
          Αρχείο καταγραφών
        </h3>
        <p className="mt-1 text-sm text-warm-500">
          Όλες οι αποθηκευμένες καταγραφές ομιλητών. Επίλεξε μία για προβολή
          λεπτομερειών.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* ── List ── */}
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="divide-y divide-warm-100">
            {registrations
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((reg) => {
                const isSel = reg.id === selected?.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedId(reg.id)}
                    className={`w-full px-4 py-4 text-left transition-colors ${
                      isSel ? "bg-sky-50" : "bg-transparent hover:bg-warm-50"
                    }`}
                  >
                    <p className="font-medium text-warm-800">
                      {speakerLabel(reg)}
                    </p>
                    <p className="mt-1 text-xs text-warm-400">
                      {reg.phrases.length} φράσεις · {reg.audioFiles.length}{" "}
                      ηχογρ. ·{" "}
                      {new Date(reg.updatedAt).toLocaleDateString("el-GR")}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* ── Detail ── */}
        <div className="surface-card rounded-xl p-6">
          {selected ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-warm-800">
                    {speakerLabel(selected)}
                  </h4>
                  <p className="text-xs text-warm-400 mt-0.5">
                    Δημιουργία:{" "}
                    {new Date(selected.createdAt).toLocaleDateString("el-GR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · Τελ. ενημέρωση:{" "}
                    {new Date(selected.updatedAt).toLocaleDateString("el-GR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleActivate(selected.id)}
                      className="rounded-lg border border-warm-200 px-3 py-1.5 text-xs font-medium text-warm-600 hover:bg-warm-50 transition-colors"
                    >
                      Επεξεργασία
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selected.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      Διαγραφή
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata grid */}
              {Object.keys(selected.metadata).length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-warm-700 mb-2">
                    Στοιχεία ομιλητή
                  </h5>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(selected.metadata)
                      .filter(([, v]) => !!v)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-lg bg-warm-50 px-3 py-2"
                        >
                          <p className="text-xs text-warm-400">{key}</p>
                          <p className="text-sm text-warm-700">{value}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Phrases */}
              <div>
                <h5 className="text-sm font-semibold text-warm-700 mb-2">
                  Φράσεις ({selected.phrases.length})
                </h5>
                {selected.phrases.length > 0 ? (
                  <div className="space-y-2">
                    {selected.phrases.map((phrase) => (
                      <div
                        key={phrase.id}
                        className="rounded-lg border border-warm-200 bg-white p-3"
                      >
                        <p className="vlach-text text-base">{phrase.vlach}</p>
                        {phrase.greek && (
                          <p className="text-sm text-warm-600 mt-0.5">
                            {phrase.greek}
                          </p>
                        )}
                        {(phrase.context || phrase.notes) && (
                          <div className="mt-1.5 space-y-0.5 text-xs text-warm-400">
                            {phrase.context && <p>Πλαίσιο: {phrase.context}</p>}
                            {phrase.notes && (
                              <p>Σημειώσεις: {phrase.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-warm-400">Χωρίς φράσεις.</p>
                )}
              </div>

              {/* Audio files */}
              <div>
                <h5 className="text-sm font-semibold text-warm-700 mb-2">
                  Ηχογραφήσεις ({selected.audioFiles.length})
                </h5>
                {selected.audioFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selected.audioFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-warm-200 bg-white px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-warm-800">
                            {file.name}
                          </p>
                          <p className="text-xs text-warm-400">
                            {formatSize(file.size)}
                          </p>
                        </div>
                        {file.url ? (
                          <audio controls className="h-8 max-w-[200px]">
                            <source src={file.url} type={file.type} />
                          </audio>
                        ) : (
                          <span className="text-xs text-warm-400">
                            Μόνο metadata
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-warm-400">
                    Χωρίς ηχογραφήσεις.
                  </p>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <h5 className="text-sm font-semibold text-warm-700 mb-2">
                    Σημειώσεις
                  </h5>
                  <div className="rounded-lg border border-warm-200 bg-white p-4 text-sm leading-7 text-warm-700 whitespace-pre-wrap">
                    {selected.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-warm-400 text-center py-8">
              Επίλεξε μια καταγραφή από τη λίστα.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
