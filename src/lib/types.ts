// ═══════════════════════════════════════════════════════════════
// Module system — core types
// ═══════════════════════════════════════════════════════════════

/** Every module has a type that determines its visual treatment and behaviour */
export type ModuleType =
  | "lesson"
  | "exercise_set"
  | "documentation_project"
  | "fieldwork_task"
  | "archive"
  | "vocabulary_bank"
  | "grammar_focus"
  | "coming_soon";

/** Lifecycle status */
export type ModuleStatus =
  | "published"
  | "draft"
  | "partial"
  | "coming_soon"
  | "archived";

/** Who is the target audience for this module? */
export type ModuleAudience =
  | "learner"
  | "contributor"
  | "researcher"
  | "all";

/** Accent colour key (maps to CSS palette) */
export type AccentColor =
  | "rose"
  | "olive"
  | "sky"
  | "terra"
  | "warm";

/**
 * Reusable educational image descriptor.
 *
 * `src` can be:
 *   - A path under /public, e.g. "/images/lessons/family.jpg"
 *   - An absolute URL to Supabase Storage / any host
 *
 * Images are always optional; the UI degrades cleanly when missing.
 */
export interface LessonImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

// ─── Module ─────────────────────────────────────────────────

export interface Module {
  id: string;
  type: ModuleType;
  status: ModuleStatus;
  title: string;
  subtitle?: string;
  description: string;
  audience: ModuleAudience;
  tags?: string[];
  order: number;
  accentColor: AccentColor;
  /** Optional header image shown on the module card and lesson page. */
  image?: LessonImage;
  sections: ModuleSection[];
  /** ISO date string of last edit */
  lastUpdated?: string;
  /** Arbitrary extra metadata (legacy unit number, source files, etc.) */
  meta?: Record<string, unknown>;
}

// ─── Section types ──────────────────────────────────────────

export type SectionType =
  | "theory"
  | "vocabulary"
  | "exercises"
  | "flashcards"
  | "quiz"
  | "examples"
  | "instructions"
  | "phrase_collection"
  | "audio_upload"
  | "metadata_form"
  | "notes"
  | "registration_archive"
  | "speaker_registration"
  | "links"
  | "resources"
  | "review_status";

export interface ModuleSection {
  id: string;
  type: SectionType;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  data: any;
}

// ═══════════════════════════════════════════════════════════════
// Native module content blocks
// ═══════════════════════════════════════════════════════════════

export interface TheoryContentBlock {
  type:
    | "heading"
    | "paragraph"
    | "callout"
    | "bullet_list"
    | "numbered_list"
    | "example_pair"
    | "table"
    | "dialogue"
    | "youtube"
    | "image"
    | "quote";
  title?: string;
  text?: string;
  items?: string[];
  columns?: string[];
  rows?: Array<Record<string, string>>;
  vlach?: string;
  greek?: string;
  lines?: Array<{
    speaker?: string;
    text: string;
    greek?: string;
  }>;
  url?: string;
  caption?: string;
  /** Image block: alt-text required, credit optional. */
  alt?: string;
  credit?: string;
  tone?: "info" | "warning" | "success" | "neutral";
}

export interface TheoryContent {
  intro?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  examples?: Array<{
    title?: string;
    vlach?: string;
    greek?: string;
  }>;
  blocks?: TheoryContentBlock[];
}

// ═══════════════════════════════════════════════════════════════
// Vocabulary types
// ═══════════════════════════════════════════════════════════════

export interface VocabularyItem {
  vlach: string;
  greek?: string | null;
  definite?: string;
  indefinite?: string;
  meaning_source?: string;
  /** Optional illustrative image. */
  image?: LessonImage;
}

export interface VocabularySection {
  title: string;
  items: VocabularyItem[];
}

// ═══════════════════════════════════════════════════════════════
// Flashcard type
// ═══════════════════════════════════════════════════════════════

export interface Flashcard {
  type?: string;
  front: string;
  back: string;
}

export interface LinkItem {
  label: string;
  url: string;
  description?: string;
  kind?: "youtube" | "article" | "audio" | "download" | "external";
}

export interface ResourceItem {
  title: string;
  description?: string;
  url?: string;
  type?: "pdf" | "worksheet" | "audio" | "video" | "reference" | "download";
  metadata?: string;
}

export interface ExampleItem {
  title?: string;
  vlach?: string;
  greek?: string;
  note?: string;
}

export interface ReviewChecklistItem {
  label: string;
  done?: boolean;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════
// Progress tracking
// ═══════════════════════════════════════════════════════════════

export interface ModuleProgress {
  viewedSections: string[];
  flashcardsPracticed: number;
  quizScore: number | null;
  completed: boolean;
  /** For contribution modules: locally stored submissions */
  submissions?: unknown[];
}

export interface AppProgress {
  [moduleId: string]: ModuleProgress;
}

// ═══════════════════════════════════════════════════════════════
// Contribution / documentation types
// ═══════════════════════════════════════════════════════════════

export interface PhraseEntry {
  id: string;
  vlach: string;
  greek?: string;
  context?: string;
  speakerName?: string;
  speakerAge?: string;
  speakerPlace?: string;
  audioFileName?: string;
  /** Optional reference to a RegistrationAudioFile.id captured for THIS phrase. */
  audioFileId?: string;
  dateRecorded?: string;
  notes?: string;
  status?: "draft" | "submitted" | "approved" | "flagged";
}

export interface SpeakerMetadata {
  name: string;
  age?: string;
  place?: string;
  region?: string;
  dialect?: string;
  notes?: string;
}

export interface RegistrationAudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  addedAt: string;
}

export interface SpeakerRegistration {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string>;
  phrases: PhraseEntry[];
  audioFiles: RegistrationAudioFile[];
  notes: string;
}
