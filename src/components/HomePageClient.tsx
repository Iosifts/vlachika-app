"use client";

import { startTransition, useEffect, useState, useCallback } from "react";
import type { Module } from "@/lib/types";
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

  useEffect(() => {
    startTransition(() => {
      setCustomModules(loadCustomModules());
    });
  }, []);

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
            Μαθήματα Βλάχικης Γλώσσας
          </h2>

          <p className="mt-4 text-warm-600 max-w-2xl mx-auto text-lg leading-8">
            Μάθε βλάχικα βήμα-βήμα μέσα από οργανωμένες ενότητες με θεωρία,
            λεξιλόγιο, ασκήσεις, κάρτες επανάληψης και quiz. Συμμετέχεις
            στην καταγραφή και διατήρηση της γλώσσας.
          </p>

          <p className="mt-3 text-sm sm:text-base text-warm-500 max-w-xl mx-auto leading-7">
            Η γραφή ακολουθεί ακριβώς το προτεινόμενο σύστημα εγγραφισμού.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#lessons"
              className="inline-flex items-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-sky-700 hover:shadow-md"
            >
              Συνέχισε στα μαθήματα
            </a>
          </div>
        </div>
      </section>

      {/* ─── Lessons section ─── */}
      <section id="lessons" className="pb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warm-500">
              Learning Path
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-warm-800">
              Μαθήματα
            </h3>
          </div>
          <p className="hidden max-w-md text-sm leading-6 text-warm-500 sm:block">
            Προχώρησε οργανωμένα από τη θεωρία στο λεξιλόγιο, στις ασκήσεις και στην επανάληψη.
          </p>
        </div>
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
      </section>

      {/* ─── Documentation / preservation section ─── */}
      <section id="documentation" className="pb-12">
        <div className="surface-panel rounded-[30px] px-5 py-7 sm:px-7 sm:py-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warm-500">
                Contribution
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-warm-800">
                Τεκμηρίωση & Διατήρηση
              </h3>
            </div>
            <p className="hidden max-w-md text-sm leading-6 text-warm-500 sm:block">
              Κατέγραψε ομιλητές, φράσεις και ηχογραφήσεις σε έναν πιο οργανωμένο χώρο εργασίας.
            </p>
          </div>

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
        </div>
      </section>

      {/* ─── Other custom modules ─── */}
      {otherCustomModules.filter((m) => m.type !== "lesson").length > 0 && (
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
