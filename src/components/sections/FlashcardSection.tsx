"use client";

import type { ModuleSection } from "@/lib/types";
import FlashcardViewer from "../FlashcardViewer";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function FlashcardSection({ section, moduleId }: Props) {
  return (
    <FlashcardViewer
      flashcards={section.data.flashcards || []}
      moduleId={moduleId}
    />
  );
}
