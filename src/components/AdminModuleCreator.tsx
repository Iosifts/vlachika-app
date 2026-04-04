"use client";

import { useMemo, useState } from "react";
import type { CustomModuleData, CustomSectionData } from "@/lib/admin";

const MODULE_TYPES = [
  { value: "lesson", label: "Μάθημα" },
  { value: "exercise_set", label: "Ασκήσεις" },
  { value: "documentation_project", label: "Τεκμηρίωση" },
  { value: "fieldwork_task", label: "Έρευνα πεδίου" },
  { value: "archive", label: "Αρχείο" },
  { value: "vocabulary_bank", label: "Λεξιλόγιο" },
  { value: "grammar_focus", label: "Γραμματική" },
];

const SECTION_TYPES = [
  { value: "theory", label: "Θεωρία" },
  { value: "vocabulary", label: "Λεξιλόγιο" },
  { value: "exercises", label: "Ασκήσεις" },
  { value: "flashcards", label: "Κάρτες" },
  { value: "quiz", label: "Quiz" },
  { value: "examples", label: "Παραδείγματα" },
  { value: "instructions", label: "Οδηγίες" },
  { value: "phrase_collection", label: "Καταγραφή φράσεων" },
  { value: "audio_upload", label: "Ηχογραφήσεις" },
  { value: "metadata_form", label: "Φόρμα στοιχείων" },
  { value: "notes", label: "Σημειώσεις" },
  { value: "links", label: "Σύνδεσμοι" },
  { value: "resources", label: "Πόροι" },
  { value: "review_status", label: "Κατάσταση ελέγχου" },
];

const ACCENT_COLORS = [
  { value: "sky", label: "Μπλε" },
  { value: "olive", label: "Πράσινο" },
  { value: "rose", label: "Ροζ" },
  { value: "terra", label: "Μπρονζέ" },
  { value: "warm", label: "Ουδέτερο" },
];

interface Props {
  onSave: (mod: CustomModuleData) => void;
  onCancel: () => void;
  editModule?: CustomModuleData | null;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultSectionData(type: string): Record<string, unknown> {
  switch (type) {
    case "theory":
      return {
        content: {
          intro: "",
          paragraphs: [""],
          bulletPoints: [],
          examples: [{ vlach: "", greek: "" }],
        },
      };
    case "vocabulary":
      return {
        sections: [
          {
            title: "Βασικό λεξιλόγιο",
            items: [{ vlach: "", greek: "", definite: "", indefinite: "" }],
          },
        ],
      };
    case "exercises":
      return {
        exercises: [
          {
            id: uid("exercise"),
            type: "fill_in_the_blank",
            title: "Νέα άσκηση",
            instruction: "Συμπλήρωσε το κενό.",
            items: [{ number: 1, prompt: "", answer: "" }],
          },
        ],
        unitNumber: 0,
      };
    case "flashcards":
      return {
        flashcards: [{ type: "vocabulary", front: "", back: "" }],
      };
    case "quiz":
      return {
        flashcards: [{ front: "", back: "" }],
        vocabulary: [],
      };
    case "examples":
      return {
        examples: [{ title: "", vlach: "", greek: "", note: "" }],
      };
    case "instructions":
      return {
        heading: "Οδηγίες",
        steps: ["Πρώτο βήμα"],
        note: "",
      };
    case "phrase_collection":
      return {
        suggestedPrompts: ["Πώς το λέμε αυτό;"],
        fields: [
          { name: "vlach", label: "Φράση στα βλάχικα", required: true },
          { name: "greek", label: "Μετάφραση στα ελληνικά" },
          { name: "context", label: "Πλαίσιο χρήσης" },
          { name: "notes", label: "Σημειώσεις" },
        ],
      };
    case "audio_upload":
      return {
        instructions: "Ανέβασε ηχογραφήσεις εδώ.",
        maxSizeMB: 50,
      };
    case "metadata_form":
      return {
        fields: [{ name: "name", label: "Όνομα", type: "text", required: true }],
      };
    case "notes":
      return {
        placeholder: "Γράψε σημειώσεις εδώ...",
      };
    case "links":
      return {
        heading: "Χρήσιμοι σύνδεσμοι",
        items: [{ label: "", url: "", description: "", kind: "external" }],
      };
    case "resources":
      return {
        heading: "Υλικό",
        items: [{ title: "", description: "", url: "", type: "reference", metadata: "" }],
      };
    case "review_status":
      return {
        heading: "Κατάσταση ελέγχου",
        checklist: [{ label: "", done: false, notes: "" }],
      };
    default:
      return {};
  }
}

function createEmptySection(order: number): CustomSectionData {
  return {
    id: uid(`section-${order}`),
    type: "theory",
    title: "",
    order,
    data: getDefaultSectionData("theory"),
  };
}

function JsonFallback({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState("");

  return (
    <div className="mt-4 rounded-xl border border-warm-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-warm-700">Προχωρημένες ρυθμίσεις JSON</p>
      <textarea
        rows={10}
        value={draft}
        onChange={(e) => {
          const nextDraft = e.target.value;
          setDraft(nextDraft);
          try {
            const parsed = JSON.parse(nextDraft);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
              setError("Το data πρέπει να είναι JSON object.");
              return;
            }
            setError("");
            onChange(parsed as Record<string, unknown>);
          } catch {
            setError("Μη έγκυρο JSON.");
          }
        }}
        className="w-full rounded-lg border border-warm-200 px-3 py-2.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
        spellCheck={false}
      />
      {error ? (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-warm-400">Χρησιμοποίησέ το μόνο αν χρειάζεσαι κάτι που δεν καλύπτουν τα πεδία.</p>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
}: {
  section: CustomSectionData;
  onChange: (updates: Partial<CustomSectionData>) => void;
}) {
  const data = (section.data || {}) as Record<string, unknown>;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateData = (nextData: Record<string, unknown>) => onChange({ data: nextData });

  const updateTheory = (path: string, value: unknown) => {
    const content = (data.content || {}) as Record<string, unknown>;
    updateData({ ...data, content: { ...content, [path]: value } });
  };

  const renderEditor = () => {
    if (section.type === "theory") {
      const content = (data.content || {}) as Record<string, unknown>;
      const paragraphs = Array.isArray(content.paragraphs)
        ? (content.paragraphs as string[])
        : [""];
      const bulletPoints = Array.isArray(content.bulletPoints)
        ? (content.bulletPoints as string[])
        : [];
      const examples = Array.isArray(content.examples)
        ? (content.examples as { vlach?: string; greek?: string }[])
        : [];

      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-warm-600">Εισαγωγή</label>
            <textarea
              rows={3}
              value={String(content.intro || "")}
              onChange={(e) => updateTheory("intro", e.target.value)}
              className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Σύντομη εισαγωγή της θεωρίας..."
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-warm-600">Παράγραφοι</label>
              <button
                type="button"
                onClick={() => updateTheory("paragraphs", [...paragraphs, ""])}
                className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
              >
                + Παράγραφος
              </button>
            </div>
            <div className="space-y-2">
              {paragraphs.map((paragraph, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) =>
                      updateTheory(
                        "paragraphs",
                        paragraphs.map((item, i) => (i === idx ? e.target.value : item))
                      )
                    }
                    className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder={`Παράγραφος ${idx + 1}`}
                  />
                  {paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTheory(
                          "paragraphs",
                          paragraphs.filter((_, i) => i !== idx)
                        )
                      }
                      className="self-start rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-warm-600">Σημεία / bullets</label>
              <button
                type="button"
                onClick={() => updateTheory("bulletPoints", [...bulletPoints, ""])}
                className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
              >
                + Σημείο
              </button>
            </div>
            <div className="space-y-2">
              {bulletPoints.map((point, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) =>
                      updateTheory(
                        "bulletPoints",
                        bulletPoints.map((item, i) => (i === idx ? e.target.value : item))
                      )
                    }
                    className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder={`Σημείο ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateTheory(
                        "bulletPoints",
                        bulletPoints.filter((_, i) => i !== idx)
                      )
                    }
                    className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-warm-600">Παραδείγματα</label>
              <button
                type="button"
                onClick={() =>
                  updateTheory("examples", [...examples, { vlach: "", greek: "" }])
                }
                className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
              >
                + Παράδειγμα
              </button>
            </div>
            <div className="space-y-2">
              {examples.map((example, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    type="text"
                    value={example.vlach || ""}
                    onChange={(e) =>
                      updateTheory(
                        "examples",
                        examples.map((item, i) =>
                          i === idx ? { ...item, vlach: e.target.value } : item
                        )
                      )
                    }
                    className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Βλάχικα"
                  />
                  <input
                    type="text"
                    value={example.greek || ""}
                    onChange={(e) =>
                      updateTheory(
                        "examples",
                        examples.map((item, i) =>
                          i === idx ? { ...item, greek: e.target.value } : item
                        )
                      )
                    }
                    className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Ελληνικά"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateTheory(
                        "examples",
                        examples.filter((_, i) => i !== idx)
                      )
                    }
                    className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section.type === "vocabulary") {
      const vocabSections = Array.isArray(data.sections)
        ? (data.sections as Array<Record<string, unknown>>)
        : [];

      return (
        <div className="space-y-4">
          {vocabSections.map((vocabSection, sectionIndex) => {
            const items = Array.isArray(vocabSection.items)
              ? (vocabSection.items as Array<Record<string, unknown>>)
              : [];
            return (
              <div key={sectionIndex} className="rounded-xl border border-warm-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={String(vocabSection.title || "")}
                    onChange={(e) =>
                      updateData({
                        ...data,
                        sections: vocabSections.map((item, i) =>
                          i === sectionIndex ? { ...item, title: e.target.value } : item
                        ),
                      })
                    }
                    className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Τίτλος ομάδας λεξιλογίου"
                  />
                  {vocabSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateData({
                          ...data,
                          sections: vocabSections.filter((_, i) => i !== sectionIndex),
                        })
                      }
                      className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid gap-2 sm:grid-cols-4">
                      <input
                        type="text"
                        value={String(item.vlach || "")}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            sections: vocabSections.map((group, i) =>
                              i === sectionIndex
                                ? {
                                    ...group,
                                    items: items.map((entry, j) =>
                                      j === itemIndex
                                        ? { ...entry, vlach: e.target.value }
                                        : entry
                                    ),
                                  }
                                : group
                            ),
                          })
                        }
                        className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Βλάχικα"
                      />
                      <input
                        type="text"
                        value={String(item.greek || "")}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            sections: vocabSections.map((group, i) =>
                              i === sectionIndex
                                ? {
                                    ...group,
                                    items: items.map((entry, j) =>
                                      j === itemIndex
                                        ? { ...entry, greek: e.target.value }
                                        : entry
                                    ),
                                  }
                                : group
                            ),
                          })
                        }
                        className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Ελληνικά"
                      />
                      <input
                        type="text"
                        value={String(item.definite || "")}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            sections: vocabSections.map((group, i) =>
                              i === sectionIndex
                                ? {
                                    ...group,
                                    items: items.map((entry, j) =>
                                      j === itemIndex
                                        ? { ...entry, definite: e.target.value }
                                        : entry
                                    ),
                                  }
                                : group
                            ),
                          })
                        }
                        className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Οριστικό άρθρο"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={String(item.indefinite || "")}
                          onChange={(e) =>
                            updateData({
                              ...data,
                              sections: vocabSections.map((group, i) =>
                                i === sectionIndex
                                  ? {
                                      ...group,
                                      items: items.map((entry, j) =>
                                        j === itemIndex
                                          ? { ...entry, indefinite: e.target.value }
                                          : entry
                                      ),
                                    }
                                  : group
                              ),
                            })
                          }
                          className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                          placeholder="Αόριστο άρθρο"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateData({
                              ...data,
                              sections: vocabSections.map((group, i) =>
                                i === sectionIndex
                                  ? {
                                      ...group,
                                      items: items.filter((_, j) => j !== itemIndex),
                                    }
                                  : group
                              ),
                            })
                          }
                          className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateData({
                      ...data,
                      sections: vocabSections.map((group, i) =>
                        i === sectionIndex
                          ? {
                              ...group,
                              items: [
                                ...items,
                                { vlach: "", greek: "", definite: "", indefinite: "" },
                              ],
                            }
                          : group
                      ),
                    })
                  }
                  className="mt-3 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
                >
                  + Λέξη
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() =>
              updateData({
                ...data,
                sections: [
                  ...vocabSections,
                  {
                    title: "Νέα ομάδα λεξιλογίου",
                    items: [{ vlach: "", greek: "", definite: "", indefinite: "" }],
                  },
                ],
              })
            }
            className="rounded-lg border border-dashed border-sky-300 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            + Νέα ομάδα λεξιλογίου
          </button>
        </div>
      );
    }

    if (section.type === "flashcards") {
      const flashcards = Array.isArray(data.flashcards)
        ? (data.flashcards as Array<Record<string, unknown>>)
        : [];

      return (
        <div className="space-y-2">
          {flashcards.map((card, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-[140px_1fr_1fr_auto]">
              <input
                type="text"
                value={String(card.type || "")}
                onChange={(e) =>
                  updateData({
                    ...data,
                    flashcards: flashcards.map((item, i) =>
                      i === idx ? { ...item, type: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Τύπος"
              />
              <input
                type="text"
                value={String(card.front || "")}
                onChange={(e) =>
                  updateData({
                    ...data,
                    flashcards: flashcards.map((item, i) =>
                      i === idx ? { ...item, front: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Μπροστά"
              />
              <input
                type="text"
                value={String(card.back || "")}
                onChange={(e) =>
                  updateData({
                    ...data,
                    flashcards: flashcards.map((item, i) =>
                      i === idx ? { ...item, back: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Πίσω"
              />
              <button
                type="button"
                onClick={() =>
                  updateData({
                    ...data,
                    flashcards: flashcards.filter((_, i) => i !== idx),
                  })
                }
                className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              updateData({
                ...data,
                flashcards: [...flashcards, { type: "vocabulary", front: "", back: "" }],
              })
            }
            className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
          >
            + Κάρτα
          </button>
        </div>
      );
    }

    if (section.type === "instructions") {
      const steps = Array.isArray(data.steps) ? (data.steps as string[]) : [];
      return (
        <div className="space-y-4">
          <input
            type="text"
            value={String(data.heading || "")}
            onChange={(e) => updateData({ ...data, heading: e.target.value })}
            className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="Επικεφαλίδα"
          />
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) =>
                    updateData({
                      ...data,
                      steps: steps.map((item, i) => (i === idx ? e.target.value : item)),
                    })
                  }
                  className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder={`Βήμα ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    updateData({ ...data, steps: steps.filter((_, i) => i !== idx) })
                  }
                  className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateData({ ...data, steps: [...steps, ""] })}
              className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
            >
              + Βήμα
            </button>
          </div>
          <textarea
            rows={3}
            value={String(data.note || "")}
            onChange={(e) => updateData({ ...data, note: e.target.value })}
            className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="Σημαντική σημείωση"
          />
        </div>
      );
    }

    if (section.type === "notes") {
      return (
        <input
          type="text"
          value={String(data.placeholder || "")}
          onChange={(e) => updateData({ ...data, placeholder: e.target.value })}
          className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          placeholder="Κείμενο placeholder"
        />
      );
    }

    if (section.type === "audio_upload") {
      return (
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <textarea
            rows={3}
            value={String(data.instructions || "")}
            onChange={(e) => updateData({ ...data, instructions: e.target.value })}
            className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="Οδηγίες για το ανέβασμα"
          />
          <input
            type="number"
            min={1}
            value={Number(data.maxSizeMB || 50)}
            onChange={(e) => updateData({ ...data, maxSizeMB: Number(e.target.value) })}
            className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="MB"
          />
        </div>
      );
    }

    if (section.type === "metadata_form") {
      const fields = Array.isArray(data.fields)
        ? (data.fields as Array<Record<string, unknown>>)
        : [];
      return (
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_1fr_140px_120px_auto]">
              <input
                type="text"
                value={String(field.name || "")}
                onChange={(e) =>
                  updateData({
                    ...data,
                    fields: fields.map((item, i) =>
                      i === idx ? { ...item, name: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="name"
              />
              <input
                type="text"
                value={String(field.label || "")}
                onChange={(e) =>
                  updateData({
                    ...data,
                    fields: fields.map((item, i) =>
                      i === idx ? { ...item, label: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Ετικέτα"
              />
              <select
                value={String(field.type || "text")}
                onChange={(e) =>
                  updateData({
                    ...data,
                    fields: fields.map((item, i) =>
                      i === idx ? { ...item, type: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="text">text</option>
                <option value="date">date</option>
                <option value="textarea">textarea</option>
              </select>
              <label className="flex items-center gap-2 rounded-lg border border-warm-200 px-3 py-2.5 text-sm text-warm-600">
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  onChange={(e) =>
                    updateData({
                      ...data,
                      fields: fields.map((item, i) =>
                        i === idx ? { ...item, required: e.target.checked } : item
                      ),
                    })
                  }
                />
                Υποχρ.
              </label>
              <button
                type="button"
                onClick={() =>
                  updateData({ ...data, fields: fields.filter((_, i) => i !== idx) })
                }
                className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateData({
                ...data,
                fields: [
                  ...fields,
                  { name: "", label: "", type: "text", required: false },
                ],
              })
            }
            className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
          >
            + Πεδίο
          </button>
        </div>
      );
    }

    if (section.type === "phrase_collection") {
      const prompts = Array.isArray(data.suggestedPrompts)
        ? (data.suggestedPrompts as string[])
        : [];
      return (
        <div className="space-y-2">
          {prompts.map((prompt, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) =>
                  updateData({
                    ...data,
                    suggestedPrompts: prompts.map((item, i) =>
                      i === idx ? e.target.value : item
                    ),
                  })
                }
                className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Ερώτηση / prompt"
              />
              <button
                type="button"
                onClick={() =>
                  updateData({
                    ...data,
                    suggestedPrompts: prompts.filter((_, i) => i !== idx),
                  })
                }
                className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateData({ ...data, suggestedPrompts: [...prompts, ""] })
            }
            className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
          >
            + Prompt
          </button>
        </div>
      );
    }

    if (section.type === "exercises") {
      const exercises = Array.isArray(data.exercises)
        ? (data.exercises as Array<Record<string, unknown>>)
        : [];

      return (
        <div className="space-y-4">
          {exercises.map((exercise, idx) => {
            const items = Array.isArray(exercise.items)
              ? (exercise.items as Array<Record<string, unknown>>)
              : [];
            return (
              <div key={String(exercise.id || idx)} className="rounded-xl border border-warm-200 bg-white p-4">
                <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                  <select
                    value={String(exercise.type || "fill_in_the_blank")}
                    onChange={(e) =>
                      updateData({
                        ...data,
                        exercises: exercises.map((item, i) =>
                          i === idx ? { ...item, type: e.target.value } : item
                        ),
                      })
                    }
                    className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="fill_in_the_blank">Συμπλήρωση κενού</option>
                    <option value="fill_in_article">Άρθρο</option>
                    <option value="fill_in_connector">Σύνδεσμος</option>
                    <option value="sentence_transformation">Μετασχηματισμός</option>
                  </select>
                  <input
                    type="text"
                    value={String(exercise.title || "")}
                    onChange={(e) =>
                      updateData({
                        ...data,
                        exercises: exercises.map((item, i) =>
                          i === idx ? { ...item, title: e.target.value } : item
                        ),
                      })
                    }
                    className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Τίτλος άσκησης"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateData({
                        ...data,
                        exercises: exercises.filter((_, i) => i !== idx),
                      })
                    }
                    className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={String(exercise.instruction || "")}
                  onChange={(e) =>
                    updateData({
                      ...data,
                      exercises: exercises.map((item, i) =>
                        i === idx ? { ...item, instruction: e.target.value } : item
                      ),
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="Οδηγίες άσκησης"
                />

                <div className="mt-3 space-y-2">
                  {items.map((item, itemIdx) => (
                    <div key={itemIdx} className="grid gap-2 sm:grid-cols-[70px_1fr_1fr_auto]">
                      <input
                        type="number"
                        min={1}
                        value={Number(item.number || itemIdx + 1)}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            exercises: exercises.map((exerciseItem, i) =>
                              i === idx
                                ? {
                                    ...exerciseItem,
                                    items: items.map((entry, j) =>
                                      j === itemIdx
                                        ? { ...entry, number: Number(e.target.value) }
                                        : entry
                                    ),
                                  }
                                : exerciseItem
                            ),
                          })
                        }
                        className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                      <input
                        type="text"
                        value={String(item.prompt || "")}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            exercises: exercises.map((exerciseItem, i) =>
                              i === idx
                                ? {
                                    ...exerciseItem,
                                    items: items.map((entry, j) =>
                                      j === itemIdx
                                        ? { ...entry, prompt: e.target.value }
                                        : entry
                                    ),
                                  }
                                : exerciseItem
                            ),
                          })
                        }
                        className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Εκφώνηση"
                      />
                      <input
                        type="text"
                        value={String(item.answer || "")}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            exercises: exercises.map((exerciseItem, i) =>
                              i === idx
                                ? {
                                    ...exerciseItem,
                                    items: items.map((entry, j) =>
                                      j === itemIdx
                                        ? { ...entry, answer: e.target.value }
                                        : entry
                                    ),
                                  }
                                : exerciseItem
                            ),
                          })
                        }
                        className="rounded-lg border border-warm-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Απάντηση"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateData({
                            ...data,
                            exercises: exercises.map((exerciseItem, i) =>
                              i === idx
                                ? {
                                    ...exerciseItem,
                                    items: items.filter((_, j) => j !== itemIdx),
                                  }
                                : exerciseItem
                            ),
                          })
                        }
                        className="rounded-lg px-2 py-2 text-warm-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateData({
                        ...data,
                        exercises: exercises.map((exerciseItem, i) =>
                          i === idx
                            ? {
                                ...exerciseItem,
                                items: [
                                  ...items,
                                  { number: items.length + 1, prompt: "", answer: "" },
                                ],
                              }
                            : exerciseItem
                        ),
                      })
                    }
                    className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
                  >
                    + Ερώτηση
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() =>
              updateData({
                ...data,
                exercises: [
                  ...exercises,
                  {
                    id: uid("exercise"),
                    type: "fill_in_the_blank",
                    title: "Νέα άσκηση",
                    instruction: "",
                    items: [{ number: 1, prompt: "", answer: "" }],
                  },
                ],
              })
            }
            className="rounded-lg border border-dashed border-sky-300 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            + Νέα άσκηση
          </button>
        </div>
      );
    }

    return (
      <p className="text-sm text-warm-500">
        Για αυτόν τον τύπο δεν υπάρχει ακόμα ειδική φόρμα. Μπορείς να χρησιμοποιήσεις τις προχωρημένες ρυθμίσεις JSON.
      </p>
    );
  };

  return (
    <div className="space-y-4">
      {renderEditor()}
      <button
        type="button"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="text-xs font-medium text-warm-500 hover:text-warm-700"
      >
        {showAdvanced ? "Απόκρυψη προχωρημένων ρυθμίσεων" : "Προβολή προχωρημένων ρυθμίσεων"}
      </button>
      {showAdvanced && <JsonFallback value={data} onChange={updateData} />}
    </div>
  );
}

export default function AdminModuleCreator({
  onSave,
  onCancel,
  editModule,
}: Props) {
  const [title, setTitle] = useState(editModule?.title || "");
  const [subtitle, setSubtitle] = useState(editModule?.subtitle || "");
  const [description, setDescription] = useState(editModule?.description || "");
  const [moduleType, setModuleType] = useState(editModule?.type || "lesson");
  const [accentColor, setAccentColor] = useState(editModule?.accentColor || "sky");
  const [tags, setTags] = useState(editModule?.tags?.join(", ") || "");
  const [sections, setSections] = useState<CustomSectionData[]>(
    editModule?.sections || [createEmptySection(0)]
  );

  const hasTitle = useMemo(() => title.trim().length > 0, [title]);

  const addSection = () => {
    setSections((prev) => [...prev, createEmptySection(prev.length)]);
  };

  const updateSection = (idx: number, updates: Partial<CustomSectionData>) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== idx) return section;
        if (updates.type && updates.type !== section.type) {
          return {
            ...section,
            ...updates,
            data: getDefaultSectionData(updates.type),
          };
        }
        return { ...section, ...updates };
      })
    );
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!hasTitle) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-zα-ωά-ώ0-9\s]/gi, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);

    const mod: CustomModuleData = {
      id: editModule?.id || `custom-${slug}-${Date.now()}`,
      type: moduleType,
      status: "published",
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      audience: "all",
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      order: editModule?.order || 200 + (Date.now() % 1000),
      accentColor,
      lastUpdated: new Date().toISOString().split("T")[0],
      sections: sections.map((section, index) => ({ ...section, order: index })),
    };

    onSave(mod);
  };

  return (
    <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
      <h3 className="text-xl font-semibold text-warm-800">
        {editModule ? "Επεξεργασία ενότητας" : "Νέα ενότητα"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-warm-600">Τίτλος *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="π.χ. Ενότητα 7 — Η οικογένεια"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-warm-600">Υπότιτλος (βλάχικα)</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="π.χ. Familia"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-warm-600">Περιγραφή</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          placeholder="Σύντομη περιγραφή για την κάρτα..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-warm-600">Τύπος</label>
          <select
            value={moduleType}
            onChange={(e) => setModuleType(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            {MODULE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-warm-600">Χρώμα</label>
          <select
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            {ACCENT_COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-warm-600">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="π.χ. γραμματική, ρήματα"
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-base font-semibold text-warm-700">Ενότητες</h4>
          <button
            type="button"
            onClick={addSection}
            className="rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-200"
          >
            + Προσθήκη
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div key={section.id} className="rounded-xl border border-warm-200 bg-warm-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="w-6 text-xs font-medium text-warm-400">#{idx + 1}</span>
                <select
                  value={section.type}
                  onChange={(e) => updateSection(idx, { type: e.target.value })}
                  className="flex-1 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {SECTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(idx, { title: e.target.value })}
                  className="flex-1 rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="Τίτλος ενότητας"
                />
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(idx)}
                    className="text-warm-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                )}
              </div>

              <input
                type="text"
                value={section.description || ""}
                onChange={(e) => updateSection(idx, { description: e.target.value })}
                className="mb-4 w-full rounded-lg border border-warm-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Περιγραφή (προαιρετικά)"
              />

              <SectionEditor
                section={section}
                onChange={(updates) => updateSection(idx, updates)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasTitle}
          className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
        >
          {editModule ? "Αποθήκευση" : "Δημιουργία"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-warm-100 px-6 py-2.5 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-200"
        >
          Ακύρωση
        </button>
      </div>
    </div>
  );
}
