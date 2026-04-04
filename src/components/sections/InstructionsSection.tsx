"use client";

import type { ModuleSection } from "@/lib/types";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function InstructionsSection({ section }: Props) {
  const { heading, steps, note } = section.data;

  return (
    <div className="space-y-6">
      {heading && (
        <h3 className="text-xl font-semibold text-warm-800">{heading}</h3>
      )}

      {steps && steps.length > 0 && (
        <ol className="space-y-3">
          {steps.map((step: string, i: number) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </span>
              <p className="text-warm-700 leading-7 pt-1">{step}</p>
            </li>
          ))}
        </ol>
      )}

      {note && (
        <div className="bg-olive-50 border-l-4 border-olive-300 rounded-r-lg p-4 text-sm text-olive-800 leading-6">
          <strong className="block mb-1">Σημαντικό:</strong>
          {note}
        </div>
      )}
    </div>
  );
}
