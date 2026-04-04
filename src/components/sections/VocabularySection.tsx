"use client";

import type { ModuleSection } from "@/lib/types";
import VocabularyGrid from "../VocabularyGrid";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function VocabularySection({ section }: Props) {
  return <VocabularyGrid sections={section.data.sections || []} />;
}
