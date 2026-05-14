"use client";

import {
  startTransition,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Module, AccentColor } from "@/lib/types";
import type { CustomModuleData } from "@/lib/admin";
import {
  loadCustomModules,
  addCustomModule,
  deleteCustomModule,
  updateCustomModule,
} from "@/lib/admin";
import { useAdmin } from "./AdminContext";
import ModuleCard from "./ModuleCard";
import AdminModuleCreator from "./AdminModuleCreator";

interface Props {
  lessons: Module[];
  documentationModules: Module[];
}

function customToModule(c: CustomModuleData): Module {
  return {
    ...c,
    sections: c.sections.map((s) => ({
      ...s,
      data: s.data || {},
    })),
  } as unknown as Module;
}

export default function HomePageClient({ lessons, documentationModules }: Props) {
  const { isAdmin } = useAdmin();
  const [customModules, setCustomModules] = useState<CustomModuleData[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [editingModule, setEditingModule] = useState<CustomModuleData | null>(null);
  const [openSection, setOpenSection] = useState<
    "lessons" | "documentation" | null
  >(null);
  const lessonsRef = useRef<HTMLElement>(null);
  const docRef = useRef<HTMLElement>(null);

  useEffect(() => {
    startTransition(() => {
      setCustomModules(loadCustomModules());
    });
  }, []);

  const toggleSection = useCallback(
    (key: "lessons" | "documentation") => {
      setOpenSection((prev) => {
        const next = prev === key ? null : key;
        // Only scroll when actually opening (not when collapsing).
        if (next === key) {
          requestAnimationFrame(() => {
            const target = key === "lessons" ? lessonsRef : docRef;
            target.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        }
        return next;
      });
    },
    []
  );

  const handleSaveModule = useCallback(
    (mod: CustomModuleData) => {
      if (editingModule) {
        updateCustomModule(mod);
      } else {
        addCustomModule(mod);
      }
      setCustomModules(loadCustomModules());
      setShowCreator(false);
      setEditingModule(null);
    },
    [editingModule]
  );

  const handleDeleteCustom = useCallback((id: string) => {
    if (confirm("Σίγουρα θέλεις να διαγράψεις αυτή την ενότητα;")) {
      deleteCustomModule(id);
      setCustomModules(loadCustomModules());
    }
  }, []);

  // Combine static documentation + custom documentation modules
  const allDocModules = [
    ...documentationModules,
    ...customModules
      .filter((m) => m.type === "documentation_project")
      .map(customToModule),
  ];

  // Other custom modules (non-documentation)
  const otherCustomModules = customModules.filter(
    (m) => m.type !== "documentation_project"
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* ─── Hero ─── */}
      <section className="py-10 sm:py-14">
        <div className="surface-panel rounded-[32px] px-6 py-10 sm:px-10 sm:py-14 text-center">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-4 py-1.5 text-sm font-medium text-sky-700 shadow-sm">
            Armâneashce — 2026
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-warm-900">
            Μάθε Βλάχικα με τον δικό σου ρυθμό
          </h2>

          <p className="mt-4 text-warm-600 max-w-2xl mx-auto text-lg leading-8">
            Μικρές ενότητες με θεωρία, λεξιλόγιο, ασκήσεις και κάρτες
            επανάληψης. Χωρίς λογαριασμό, χωρίς πίεση — μαθαίνεις λίγο κάθε
            φορά και κρατάς τη γλώσσα ζωντανή.
          </p>

          <p className="mt-3 text-sm sm:text-base text-warm-500 max-w-xl mx-auto leading-7">
            Δωρεάν περιεχόμενο, φτιαγμένο για ελληνόφωνους.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setOpenSection("lessons");
                requestAnimationFrame(() => {
                  lessonsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                });
              }}
              className="inline-flex items-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-sky-700 hover:shadow-md"
            >
              Ξεκίνα τα μαθήματα
            </button>
            <a
              href="#start-here"
              className="inline-flex items-center rounded-2xl border border-warm-300 bg-white px-6 py-3 text-sm font-medium text-warm-700 transition-colors hover:border-warm-400 hover:bg-warm-50"
            >
              Πώς λειτουργεί;
            </a>
          </div>
        </div>
      </section>

      {/* ─── Start here / learner guidance ─── */}
      <section id="start-here" className="pb-6 scroll-mt-6">
        <div className="surface-card rounded-[28px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warm-500">
              Πώς να ξεκινήσεις
            </p>
          </div>
          <h3 className="mt-1.5 text-xl sm:text-2xl font-semibold text-warm-800">
            Πέντε απλά βήματα σε κάθε μάθημα
          </h3>
          <p className="mt-1 text-sm leading-6 text-warm-500 max-w-2xl">
            Κάθε ενότητα έχει την ίδια δομή. Ακολούθησε τη σειρά τη μία
            φορά και μετά γύρνα ελεύθερα όπου χρειάζεσαι.
          </p>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                n: 1,
                title: "Θεωρία",
                desc: "Διάβασε με την ησυχία σου.",
              },
              {
                n: 2,
                title: "Λεξιλόγιο",
                desc: "Δες τις λέξεις της ενότητας.",
              },
              {
                n: 3,
                title: "Κάρτες",
                desc: "Επανάλαβε με flashcards.",
              },
              {
                n: 4,
                title: "Ασκήσεις",
                desc: "Δοκίμασε ό,τι έμαθες.",
              },
              {
                n: 5,
                title: "Quiz",
                desc: "Έλεγξε τι κράτησες.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-warm-200 bg-white p-4"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                  {step.n}
                </span>
                <p className="mt-3 text-sm font-semibold text-warm-800">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-warm-500">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Lessons section ─── */}
      <CollapsibleSection
        ref={lessonsRef}
        id="lessons"
        accent="sky"
        eyebrow="Learning Path"
        title="Μαθήματα"
        subtitle="Προχώρησε οργανωμένα από τη θεωρία στο λεξιλόγιο, στις ασκήσεις και στην επανάληψη."
        count={
          lessons.length +
          otherCustomModules.filter((m) => m.type === "lesson").length
        }
        open={openSection === "lessons"}
        onToggle={() => toggleSection("lessons")}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((mod) => (
            <ModuleCard key={mod.id} module={mod} isAdmin={isAdmin} />
          ))}
          {/* Custom lesson-type modules */}
          {otherCustomModules
            .filter((m) => m.type === "lesson")
            .map((cm) => (
              <ModuleCard
                key={cm.id}
                module={customToModule(cm)}
                isAdmin={isAdmin}
                onEdit={() => {
                  setEditingModule(cm);
                  setShowCreator(true);
                }}
                onDelete={() => handleDeleteCustom(cm.id)}
              />
            ))}
        </div>
      </CollapsibleSection>

      {/* ─── Documentation / preservation section ─── */}
      {/* Hidden from public; only visible when admin mode is on. */}
      {isAdmin && (
        <CollapsibleSection
          ref={docRef}
          id="documentation"
          accent="rose"
          eyebrow="Contribution"
          title="Τεκμηρίωση & Διατήρηση"
          subtitle="Κατέγραψε ομιλητές, φράσεις και ηχογραφήσεις σε έναν πιο οργανωμένο χώρο εργασίας."
          count={allDocModules.length}
          open={openSection === "documentation"}
          onToggle={() => toggleSection("documentation")}
        >
          {allDocModules.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {allDocModules.map((mod) => {
                const customMod = customModules.find((cm) => cm.id === mod.id);
                return (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    isAdmin={isAdmin}
                    onEdit={
                      customMod
                        ? () => {
                            setEditingModule(customMod);
                            setShowCreator(true);
                          }
                        : undefined
                    }
                    onDelete={
                      customMod ? () => handleDeleteCustom(mod.id) : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* ─── Other custom modules (admin-only) ─── */}
      {isAdmin &&
        otherCustomModules.filter((m) => m.type !== "lesson").length > 0 && (
          <section className="pb-12">
            <h3 className="text-lg font-semibold text-warm-700 mb-6 flex items-center gap-2">
              <span>📂</span> Επιπλέον ενότητες
            </h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {otherCustomModules
                .filter((m) => m.type !== "lesson")
                .map((cm) => (
                  <ModuleCard
                    key={cm.id}
                    module={customToModule(cm)}
                    isAdmin={isAdmin}
                    onEdit={() => {
                      setEditingModule(cm);
                      setShowCreator(true);
                    }}
                    onDelete={() => handleDeleteCustom(cm.id)}
                  />
                ))}
            </div>
          </section>
        )}

      {/* ─── Admin: create module ─── */}
      {isAdmin && (
        <section className="pb-20">
          {showCreator ? (
            <AdminModuleCreator
              onSave={handleSaveModule}
              onCancel={() => {
                setShowCreator(false);
                setEditingModule(null);
              }}
              editModule={editingModule}
            />
          ) : (
            <button
              onClick={() => {
                setEditingModule(null);
                setShowCreator(true);
              }}
              className="w-full py-4 border-2 border-dashed border-sky-300 rounded-2xl text-sky-600 font-medium hover:bg-sky-50 hover:border-sky-400 transition-colors"
            >
              + Δημιουργία νέας ενότητας
            </button>
          )}
        </section>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// CollapsibleSection — accordion-style group of module cards
// ───────────────────────────────────────────────────────────────

const ACCENT_BAR: Record<AccentColor, string> = {
  sky: "from-sky-200 to-sky-400",
  rose: "from-rose-200 to-rose-400",
  olive: "from-olive-200 to-olive-400",
  terra: "from-terra-200 to-terra-400",
  warm: "from-warm-200 to-warm-400",
};

const ACCENT_BADGE: Record<AccentColor, string> = {
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  olive: "bg-olive-50 text-olive-700 border-olive-200",
  terra: "bg-terra-50 text-terra-700 border-terra-200",
  warm: "bg-warm-100 text-warm-700 border-warm-200",
};

const ACCENT_RING: Record<AccentColor, string> = {
  sky: "hover:border-sky-300",
  rose: "hover:border-rose-300",
  olive: "hover:border-olive-300",
  terra: "hover:border-terra-300",
  warm: "hover:border-warm-300",
};

interface CollapsibleSectionProps {
  ref?: React.Ref<HTMLElement>;
  id: string;
  accent: AccentColor;
  eyebrow: string;
  title: string;
  subtitle: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function CollapsibleSection({
  ref,
  id,
  accent,
  eyebrow,
  title,
  subtitle,
  count,
  open,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const panelId = `${id}-panel`;
  return (
    <section ref={ref} id={id} className="pb-6 scroll-mt-6">
      <div
        className={`surface-card rounded-[28px] overflow-hidden transition-colors ${ACCENT_RING[accent]}`}
      >
        {/* Header */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left flex items-stretch gap-4 px-5 py-5 sm:px-7 sm:py-6 hover:bg-warm-50/50 transition-colors"
        >
          {/* Accent bar */}
          <span
            aria-hidden
            className={`w-1.5 self-stretch rounded-full bg-gradient-to-b ${ACCENT_BAR[accent]}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warm-500">
                {eyebrow}
              </p>
              <span
                className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full border text-[11px] font-semibold ${ACCENT_BADGE[accent]}`}
              >
                {count}
              </span>
            </div>
            <h3 className="mt-1.5 text-xl sm:text-2xl font-semibold text-warm-800">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-warm-500 max-w-xl">
              {subtitle}
            </p>
          </div>
          {/* Chevron */}
          <span
            aria-hidden
            className={`self-center flex-shrink-0 w-9 h-9 rounded-full border border-warm-200 bg-white flex items-center justify-center text-warm-500 transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {/* Animated body. CSS grid trick: rows transition between 0fr ↔ 1fr
            for smooth height animation regardless of content size. */}
        <div
          id={panelId}
          aria-hidden={!open}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`px-5 pb-7 sm:px-7 sm:pb-8 transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
