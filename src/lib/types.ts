// ─── Lesson metadata ────────────────────────────────────────
export interface LessonMeta {
  number: number;
  title: string;
  titleVlach?: string;
  slug: string;
  description: string;
  materialStatus?: string;
  available: boolean;
  buttons: string[];
}

// ─── Homepage card (normalised from JSON) ───────────────────
export interface HomepageCard {
  title: string;
  description: string;
  buttons: string[];
}

// ─── Theory ─────────────────────────────────────────────────
export interface AlphabetEntry {
  letters: string;
  pronunciation?: string;
  examples: string[];
}

export interface ConsonantCombination {
  combination: string;
  pronunciation: string;
  example: string;
}

export interface SimpleVowel {
  symbol: string;
  description: string;
}

export interface Diphthong {
  symbol: string;
  pronounced_as?: string;
  note?: string;
  examples?: string[];
}

export interface VowelData {
  simple_vowels: SimpleVowel[];
  diphthongs: Diphthong[];
  notes: string[];
}

export interface ComparisonPair {
  left: string;
  right: string;
}

export interface GuidedPracticeGroup {
  header: string;
  words: string[];
}

// ─── Pronouns / Verbs (Unit 2) ─────────────────────────────
export interface PronounItem {
  greek_person: string;
  variant_forms: string[];
}

export interface VerbConjugation {
  greek_person: string;
  form_set_1: string;
  form_set_2: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface Dialogue {
  id: string;
  title: string;
  lines: DialogueLine[];
}

export interface OverviewPhrase {
  vlach: string;
  greek: string;
}

// ─── Definite article tables (Unit 3) ───────────────────────
export interface ParadigmRow {
  singular_indefinite: string;
  singular_definite: string;
  plural_indefinite: string;
  plural_definite: string;
}

export interface PatternRule {
  gender: string;
  rule: string;
  example: string;
}

export interface ConjugationRow {
  person?: string;
  greek_person?: string;
  form?: string;
  [key: string]: string | undefined;
}

// ─── Indefinite article table (Unit 4) ──────────────────────
export interface NounArticleRow {
  noun_singular: string;
  definite: string;
  indefinite: string;
  note?: string;
}

// ─── Numbers / Time (Unit 6) ────────────────────────────────
export interface NumberEntry {
  number: string;
  vlach: string;
}

export interface PhraseEntry {
  vlach: string;
  greek: string;
}

export interface SeasonMonthBlock {
  season: string;
  months: string[];
  source?: string;
}

// ─── Vocabulary ─────────────────────────────────────────────
export interface VocabularyItem {
  vlach: string;
  greek?: string | null;
  definite?: string;
  indefinite?: string;
  meaning_source?: string;
}

export interface VocabularySection {
  title: string;
  items: VocabularyItem[];
}

// ─── Exercises ──────────────────────────────────────────────
export interface ExerciseItem {
  number?: number | string;
  prompt?: string;
  source_line?: string;
  official_answer?: string;
  official_translation?: string;
  solved_text?: string;
}

export interface Exercise {
  id: string;
  title: string;
  type: string;
  instruction?: string;
  items: ExerciseItem[];
  table_columns?: string[];
  rows?: Record<string, string>[];
}

// ─── Flashcards ─────────────────────────────────────────────
export interface Flashcard {
  type?: string;
  front: string;
  back: string;
}

// ─── Full lesson (normalised, consumed by UI) ───────────────
export interface Lesson {
  meta: LessonMeta;
  theory: Record<string, unknown>;
  vocabulary: VocabularySection[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  exercises: any[];
  flashcards: Flashcard[];
}

// ─── Progress ───────────────────────────────────────────────
export interface LessonProgress {
  viewedSections: string[];
  flashcardsPracticed: number;
  quizScore: number | null;
  completed: boolean;
}

export interface AppProgress {
  [lessonNumber: number]: LessonProgress;
}
