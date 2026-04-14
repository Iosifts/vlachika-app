"use client";

import type { ModuleSection, ResourceItem } from "@/lib/types";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  worksheet: "Worksheet",
  audio: "Audio",
  video: "Video",
  reference: "Reference",
  download: "Download",
};

export default function ResourcesSection({ section }: Props) {
  const heading =
    typeof section.data?.heading === "string" ? section.data.heading : "";
  const items = Array.isArray(section.data?.items)
    ? (section.data.items as ResourceItem[]).filter((item) => item?.title)
    : [];

  if (items.length === 0) {
    return (
      <p className="text-sm leading-7 text-warm-500">
        Δεν υπάρχουν πρόσθετοι πόροι για αυτή την ενότητα.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {heading && (
        <h3 className="text-xl font-semibold text-warm-800">{heading}</h3>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-2xl border border-warm-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-warm-800">
                {item.title}
              </p>
              {item.type && (
                <span className="rounded-full bg-olive-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-olive-700">
                  {TYPE_LABELS[item.type] || item.type}
                </span>
              )}
              {item.metadata && (
                <span className="text-xs text-warm-400">{item.metadata}</span>
              )}
            </div>

            {item.description && (
              <p className="mt-2 text-sm leading-6 text-warm-600">
                {item.description}
              </p>
            )}

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-sky-700 transition-colors hover:text-sky-800"
              >
                Άνοιγμα πόρου
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
