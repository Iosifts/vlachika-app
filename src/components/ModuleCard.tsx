import Link from "next/link";
import type { Module, ModuleType, AccentColor } from "@/lib/types";

// ─── Visual config per module type ──────────────────────────

const TYPE_LABELS: Record<ModuleType, string> = {
  lesson: "Μάθημα",
  exercise_set: "Ασκήσεις",
  documentation_project: "Τεκμηρίωση",
  fieldwork_task: "Έρευνα πεδίου",
  archive: "Αρχείο",
  vocabulary_bank: "Λεξιλόγιο",
  grammar_focus: "Γραμματική",
  coming_soon: "Προσεχώς",
};

const TYPE_ICONS: Record<ModuleType, string> = {
  lesson: "📖",
  exercise_set: "✏️",
  documentation_project: "🎙️",
  fieldwork_task: "🏔️",
  archive: "📚",
  vocabulary_bank: "📝",
  grammar_focus: "🔤",
  coming_soon: "⏳",
};

const ACCENT_BORDER: Record<AccentColor, string> = {
  rose: "border-l-rose-400",
  olive: "border-l-olive-400",
  sky: "border-l-sky-400",
  terra: "border-l-terra-400",
  warm: "border-l-warm-400",
};

const ACCENT_BADGE: Record<AccentColor, string> = {
  rose: "bg-rose-100 text-rose-700",
  olive: "bg-olive-100 text-olive-700",
  sky: "bg-sky-100 text-sky-700",
  terra: "bg-terra-100 text-terra-700",
  warm: "bg-warm-200 text-warm-700",
};

const CTA_BG: Record<AccentColor, string> = {
  rose: "bg-rose-600 hover:bg-rose-700",
  olive: "bg-olive-600 hover:bg-olive-700",
  sky: "bg-sky-600 hover:bg-sky-700",
  terra: "bg-terra-600 hover:bg-terra-700",
  warm: "bg-warm-700 hover:bg-warm-800",
};

// ─── Helpers ────────────────────────────────────────────────

function formatDateGreek(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isRecentUpdate(isoDate: string): boolean {
  const updated = new Date(isoDate).getTime();
  const now = Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  return now - updated < twoDays;
}

// ─── Component ──────────────────────────────────────────────

interface ModuleCardProps {
  module: Module;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ModuleCard({ module, isAdmin, onEdit, onDelete }: ModuleCardProps) {
  const border = ACCENT_BORDER[module.accentColor];
  const badge = ACCENT_BADGE[module.accentColor];
  const ctaBg = CTA_BG[module.accentColor];
  const typeLabel = TYPE_LABELS[module.type] || module.type;
  const typeIcon = TYPE_ICONS[module.type] || "📄";
  const isComingSoon = module.status === "coming_soon";
  const recent = module.lastUpdated ? isRecentUpdate(module.lastUpdated) : false;

  if (isComingSoon) {
    return (
      <div className="flex flex-col">
        <div className="surface-card rounded-2xl border-l-4 border-l-warm-200 p-7 flex min-h-[280px] flex-col items-center justify-center text-center opacity-70">
          <span className="text-3xl mb-3">{typeIcon}</span>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-warm-100 text-warm-500 mb-3">
            {typeLabel}
          </span>
          <h3 className="text-xl font-semibold text-warm-600 mb-2">
            {module.title}
          </h3>
          <p className="text-sm text-warm-400 max-w-xs leading-6">
            {module.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col">
      <div
        className={`surface-card rounded-[26px] border-l-4 ${border} overflow-hidden flex flex-col flex-1 transition-all duration-300 group-hover:-translate-y-1`}
      >
        {/* Optional header image */}
        {module.image?.src && (
          <div className="-mx-px -mt-px aspect-[16/9] overflow-hidden bg-warm-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={module.image.src}
              alt={module.image.alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-7 flex flex-col flex-1">
        {/* Top row: type badge + status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcon}</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge}`}
            >
              {typeLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {module.status === "partial" && (
              <span className="text-xs text-warm-400 italic">μερικό υλικό</span>
            )}
            {module.status === "draft" && (
              <span className="text-xs text-warm-400 italic">πρόχειρο</span>
            )}
            {isAdmin && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="rounded-md p-1.5 text-sky-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                    title="Επεξεργασία"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="rounded-md p-1.5 text-warm-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    title="Διαγραφή"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-warm-800 mb-1">
          {module.title}
        </h3>
        {module.subtitle && (
          <p className="vlach-text text-sm mb-2">{module.subtitle}</p>
        )}

        {/* Description */}
        <p className="text-sm text-warm-500 leading-6 flex-1 mb-5">
          {module.description}
        </p>

        {/* Tags */}
        {module.tags && module.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {module.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-warm-100 text-warm-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Section quick links */}
        {module.sections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {module.sections.map((sec) => (
              <Link
                key={sec.id}
                href={`/module/${module.id}?tab=${encodeURIComponent(sec.id)}`}
                className="text-xs px-3 py-1.5 rounded-full bg-white/70 text-warm-600 hover:bg-white hover:text-warm-700 transition-colors"
              >
                {sec.title}
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/module/${module.id}`}
          className={`block text-center py-3 rounded-2xl text-white text-sm font-medium shadow-sm transition-all duration-300 group-hover:shadow-md ${ctaBg}`}
        >
          {module.type === "documentation_project" || module.type === "fieldwork_task"
            ? "Ξεκίνα καταγραφή"
            : "Μπαίνω στο μάθημα"}
        </Link>
        </div>
      </div>

      {/* Last update — below the card */}
      {module.lastUpdated && (
        <div className="flex items-center gap-2 mt-2.5 px-2">
          {recent && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-olive-600 bg-olive-50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-olive-500 animate-pulse" />
              Νέα ενημέρωση
            </span>
          )}
          <span className="text-xs text-warm-400">
            Τελ. ενημέρωση: {formatDateGreek(module.lastUpdated)}
          </span>
        </div>
      )}
    </div>
  );
}
