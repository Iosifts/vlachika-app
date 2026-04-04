"use client";

import type { ModuleSection } from "@/lib/types";
import ExerciseRenderer from "../ExerciseRenderer";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function ExerciseSection({ section }: Props) {
  return (
    <ExerciseRenderer
      exercises={section.data.exercises || []}
      unitNumber={section.data.unitNumber || 0}
    />
  );
}
