"use client";

import type { ExampleItem, ModuleSection } from "@/lib/types";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function ExamplesSection({ section }: Props) {
  const items = Array.isArray(section.data?.examples)
    ? (section.data.examples as ExampleItem[]).filter(
        (item) => item?.vlach || item?.greek
      )
    : [];

  if (items.length === 0) {
    return (
      <p className="text-sm leading-7 text-warm-500">
        Δεν υπάρχουν παραδείγματα για αυτή την ενότητα.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((example, index) => (
        <div
          key={`${example.vlach || example.greek || "example"}-${index}`}
          className="rounded-2xl border border-warm-200 bg-white px-5 py-4 shadow-sm"
        >
          {example.title && (
            <p className="mb-2 text-sm font-medium text-warm-500">
              {example.title}
            </p>
          )}
          {example.vlach && (
            <p className="vlach-text text-lg leading-7">{example.vlach}</p>
          )}
          {example.greek && (
            <p className="mt-1 text-sm leading-6 text-warm-600">
              {example.greek}
            </p>
          )}
          {example.note && (
            <p className="mt-3 text-xs leading-5 text-warm-500">
              {example.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
