"use client";

import type { LinkItem, ModuleSection } from "@/lib/types";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

const KIND_LABELS: Record<string, string> = {
  youtube: "YouTube",
  article: "Άρθρο",
  audio: "Ήχος",
  download: "Λήψη",
  external: "Σύνδεσμος",
};

export default function LinksSection({ section }: Props) {
  const heading =
    typeof section.data?.heading === "string" ? section.data.heading : "";
  const items = Array.isArray(section.data?.items)
    ? (section.data.items as LinkItem[]).filter(
        (item) => item?.label && item?.url
      )
    : [];

  if (items.length === 0) {
    return (
      <p className="text-sm leading-7 text-warm-500">
        Δεν υπάρχουν διαθέσιμοι σύνδεσμοι για αυτή την ενότητα.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {heading && (
        <h3 className="text-xl font-semibold text-warm-800">{heading}</h3>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <a
            key={`${item.url}-${index}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-warm-200 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-warm-800 transition-colors group-hover:text-sky-700">
                {item.label}
              </p>
              <span className="rounded-full bg-warm-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-warm-500">
                {KIND_LABELS[item.kind || "external"] || KIND_LABELS.external}
              </span>
            </div>
            {item.description && (
              <p className="text-sm leading-6 text-warm-600">
                {item.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
