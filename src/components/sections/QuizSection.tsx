"use client";

import type { ModuleSection } from "@/lib/types";
import QuizRenderer from "../QuizRenderer";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function QuizSection({ section, moduleId }: Props) {
  return (
    <QuizRenderer
      flashcards={section.data.flashcards || []}
      vocabulary={section.data.vocabulary || []}
      moduleId={moduleId}
    />
  );
}
