import Link from "next/link";
import type { LessonMeta } from "@/lib/types";

const UNIT_COLORS: Record<number, string> = {
  1: "border-l-rose-400 hover:shadow-rose-100",
  2: "border-l-olive-400 hover:shadow-olive-100",
  3: "border-l-sky-400 hover:shadow-sky-100",
  4: "border-l-terra-400 hover:shadow-terra-100",
  6: "border-l-warm-500 hover:shadow-warm-100",
};

const UNIT_BADGE_COLORS: Record<number, string> = {
  1: "bg-rose-100 text-rose-700",
  2: "bg-olive-100 text-olive-700",
  3: "bg-sky-100 text-sky-700",
  4: "bg-terra-100 text-terra-700",
  6: "bg-warm-200 text-warm-700",
};

export default function LessonCard({ meta }: { meta: LessonMeta }) {
  const colorClass = UNIT_COLORS[meta.number] || "border-l-warm-400";
  const badgeColor = UNIT_BADGE_COLORS[meta.number] || "bg-warm-100 text-warm-700";

  return (
    <div
      className={`bg-white rounded-xl border-l-4 ${colorClass} shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col`}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}
        >
          Ενότητα {meta.number}
        </span>
        {meta.materialStatus === "μερικό" && (
          <span className="text-xs text-warm-400 italic">μερικό υλικό</span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-warm-800 mb-2">
        {meta.title}
        {meta.titleVlach && (
          <span className="block text-sm font-normal vlach-text mt-0.5">
            {meta.titleVlach}
          </span>
        )}
      </h3>

      <p className="text-sm text-warm-600 flex-1 mb-4">{meta.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {["Θεωρία", "Λεξιλόγιο", "Ασκήσεις", "Κάρτες", "Quiz"].map((btn) => (
          <Link
            key={btn}
            href={`/lesson/${meta.number}?tab=${encodeURIComponent(btn)}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-warm-100 text-warm-600 hover:bg-warm-200 hover:text-warm-800 transition-colors"
          >
            {btn}
          </Link>
        ))}
      </div>

      <Link
        href={`/lesson/${meta.number}`}
        className="block text-center py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors"
      >
        Μπαίνω στο μάθημα
      </Link>
    </div>
  );
}
