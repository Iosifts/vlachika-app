"use client";

import { useState, useEffect } from "react";
import type { Module, AccentColor } from "@/lib/types";
import { markSectionViewed } from "@/lib/progress";
import SectionRenderer from "./SectionRenderer";
import Link from "next/link";

const TAB_ACTIVE: Record<AccentColor, string> = {
  rose: "bg-rose-500 text-white",
  olive: "bg-olive-500 text-white",
  sky: "bg-sky-500 text-white",
  terra: "bg-terra-500 text-white",
  warm: "bg-warm-600 text-white",
};

const BADGE_BG: Record<AccentColor, string> = {
  rose: "bg-rose-500",
  olive: "bg-olive-500",
  sky: "bg-sky-500",
  terra: "bg-terra-500",
  warm: "bg-warm-600",
};

export default function ModulePageClient({ module: mod }: { module: Module }) {
  const sections = mod.sections.sort((a, b) => a.order - b.order);
  const [activeSectionId, setActiveSectionId] = useState(
    sections[0]?.id || ""
  );

  // Read ?tab= from URL on mount
  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab && sections.some((s) => s.id === urlTab)) {
      setActiveSectionId(urlTab);
    }
  }, [sections]);

  // Track viewed sections
  useEffect(() => {
    if (activeSectionId) {
      markSectionViewed(mod.id, activeSectionId);
    }
  }, [activeSectionId, mod.id]);

  const tabActive = TAB_ACTIVE[mod.accentColor] || "bg-warm-600 text-white";
  const badgeBg = BADGE_BG[mod.accentColor] || "bg-warm-600";
  const activeSection = sections.find((s) => s.id === activeSectionId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 mb-6 transition-colors"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Πίσω
      </Link>

      {/* Module header */}
      <header className="surface-panel rounded-2xl px-5 py-5 sm:px-7 sm:py-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${badgeBg}`}
          >
            {mod.type === "lesson" && mod.meta?.unitNumber
              ? `Ενότητα ${mod.meta.unitNumber}`
              : mod.type === "documentation_project"
              ? "Τεκμηρίωση"
              : mod.type === "fieldwork_task"
              ? "Έρευνα πεδίου"
              : mod.title}
          </span>
          {mod.status === "partial" && (
            <span className="text-xs text-warm-400 italic">Μερικό υλικό</span>
          )}
          {mod.lastUpdated && (
            <span className="text-xs text-warm-400">
              Ενημέρωση: {new Date(mod.lastUpdated).toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-warm-900">
          {mod.title}
        </h2>
        {mod.subtitle && (
          <p className="vlach-text text-lg mt-1">{mod.subtitle}</p>
        )}
        <p className="text-warm-500 mt-2 leading-7">{mod.description}</p>
      </header>

      {/* Section tabs + content live inside one continuous panel so the tab
          row never floats directly over the body backdrop image. */}
      <div className="surface-panel rounded-2xl overflow-hidden min-h-[400px]">
        {sections.length > 1 && (
          <nav className="flex flex-wrap gap-1 px-3 pt-3 sm:px-4 sm:pt-4 border-b border-warm-200">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeSectionId === sec.id
                    ? tabActive
                    : "text-warm-500 hover:text-warm-700 hover:bg-warm-100"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </nav>
        )}

        <div className="p-4 sm:p-6">
          {activeSection ? (
            <SectionRenderer section={activeSection} moduleId={mod.id} />
          ) : (
            <div className="text-warm-400 text-center py-12">
              Δεν υπάρχουν διαθέσιμες ενότητες.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
