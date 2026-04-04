"use client";

import type { ModuleSection } from "@/lib/types";
import TheorySection from "./sections/TheorySection";
import VocabularySection from "./sections/VocabularySection";
import ExerciseSection from "./sections/ExerciseSection";
import FlashcardSection from "./sections/FlashcardSection";
import QuizSection from "./sections/QuizSection";
import InstructionsSection from "./sections/InstructionsSection";
import PhraseCollectionSection from "./sections/PhraseCollectionSection";
import AudioUploadSection from "./sections/AudioUploadSection";
import MetadataFormSection from "./sections/MetadataFormSection";
import NotesSection from "./sections/NotesSection";
import RegistrationArchiveSection from "./sections/RegistrationArchiveSection";
import SpeakerRegistrationWorkflow from "./sections/SpeakerRegistrationWorkflow";
import LinksSection from "./sections/LinksSection";
import ResourcesSection from "./sections/ResourcesSection";
import ExamplesSection from "./sections/ExamplesSection";
import ReviewStatusSection from "./sections/ReviewStatusSection";

/**
 * Section renderer registry.
 *
 * Maps SectionType → React component.
 * Each component receives { section, moduleId } and renders autonomously.
 * To add a new section type: create a component, add one line here.
 */

interface SectionProps {
  section: ModuleSection;
  moduleId: string;
}

const SECTION_REGISTRY: Record<string, React.ComponentType<SectionProps>> = {
  theory: TheorySection,
  vocabulary: VocabularySection,
  exercises: ExerciseSection,
  flashcards: FlashcardSection,
  quiz: QuizSection,
  instructions: InstructionsSection,
  phrase_collection: PhraseCollectionSection,
  audio_upload: AudioUploadSection,
  metadata_form: MetadataFormSection,
  notes: NotesSection,
  registration_archive: RegistrationArchiveSection,
  speaker_registration: SpeakerRegistrationWorkflow,
  links: LinksSection,
  resources: ResourcesSection,
  examples: ExamplesSection,
  review_status: ReviewStatusSection,
};

export default function SectionRenderer({
  section,
  moduleId,
}: SectionProps) {
  const Component = SECTION_REGISTRY[section.type];

  if (!Component) {
    return (
      <div className="text-warm-400 text-center py-12 text-sm">
        Ο τύπος ενότητας &ldquo;{section.type}&rdquo; δεν υποστηρίζεται ακόμα.
      </div>
    );
  }

  return <Component section={section} moduleId={moduleId} />;
}
