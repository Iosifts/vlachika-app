"use client";

import type { ModuleSection, TheoryContent } from "@/lib/types";
import TheoryRenderer from "../TheoryRenderer";
import TheoryContentRenderer from "../TheoryContentRenderer";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function TheorySection({ section }: Props) {
  const { theory, unitNumber } = section.data;

  if (!theory && section.data?.content) {
    return <TheoryContentRenderer content={section.data.content as TheoryContent} />;
  }

  return <TheoryRenderer theory={theory} unitNumber={unitNumber} />;
}
