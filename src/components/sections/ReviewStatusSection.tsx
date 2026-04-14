"use client";

import type { ModuleSection, ReviewChecklistItem } from "@/lib/types";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function ReviewStatusSection({ section }: Props) {
  const heading =
    typeof section.data?.heading === "string"
      ? section.data.heading
      : "Κατάσταση ελέγχου";
  const items = Array.isArray(section.data?.checklist)
    ? (section.data.checklist as ReviewChecklistItem[]).filter(
        (item) => item?.label
      )
    : [];

  if (items.length === 0) {
    return (
      <p className="text-sm leading-7 text-warm-500">
        Δεν υπάρχουν ακόμη στοιχεία ελέγχου για αυτή την ενότητα.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-warm-800">{heading}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="rounded-2xl border border-warm-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-warm-800">{item.label}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                  item.done
                    ? "bg-olive-100 text-olive-700"
                    : "bg-terra-100 text-terra-700"
                }`}
              >
                {item.done ? "Done" : "Pending"}
              </span>
            </div>
            {item.notes && (
              <p className="mt-2 text-sm leading-6 text-warm-600">
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
