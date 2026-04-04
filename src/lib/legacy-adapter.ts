/**
 * Legacy adapter — converts existing lesson JSON files into Module format.
 *
 * This is a pure data transformation. The original JSON data is never modified.
 * Each lesson becomes a Module with sections that carry the original data payloads.
 */

import type {
  Module,
  ModuleSection,
  AccentColor,
  VocabularySection,
  VocabularyItem,
  Flashcard,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Color assignment per unit ──────────────────────────────

const UNIT_COLORS: Record<number, AccentColor> = {
  1: "rose",
  2: "olive",
  3: "sky",
  4: "terra",
  6: "warm",
};

// ─── Vocabulary normaliser (unchanged logic from old lessons.ts) ─

function normalizeVocabulary(raw: any): VocabularySection[] {
  if (!raw) return [];

  if (raw.main && Array.isArray(raw.main)) {
    const sections: VocabularySection[] = [];
    sections.push({ title: "Βασικό λεξιλόγιο", items: raw.main });
    if (raw.exercise_consonants) {
      sections.push({ title: "Λεξιλόγιο ασκήσεων", items: raw.exercise_consonants });
    }
    return sections;
  }

  if (raw.section_2_main || raw.section_2_1 || raw.section_2_2) {
    const sections: VocabularySection[] = [];
    if (raw.section_2_main) sections.push({ title: "Βασικές εκφράσεις", items: raw.section_2_main });
    if (raw.section_2_1) sections.push({ title: "Ενότητα 2.1", items: raw.section_2_1 });
    if (raw.section_2_2) sections.push({ title: "Ενότητα 2.2", items: raw.section_2_2 });
    if (raw.exercise_a_vocabulary) sections.push({ title: "Λεξιλόγιο ασκήσεων", items: raw.exercise_a_vocabulary });
    if (raw.useful_vocabulary) sections.push({ title: "Χρήσιμο λεξιλόγιο", items: raw.useful_vocabulary });
    return sections;
  }

  if (raw.sections && Array.isArray(raw.sections)) {
    return raw.sections.map((s: any) => ({
      title: s.title || "Λεξιλόγιο",
      items: Array.isArray(s.items)
        ? s.items.map((it: any) => (typeof it === "string" ? { vlach: it, greek: null } : it))
        : [],
    }));
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const sections: VocabularySection[] = [];
    for (const [key, value] of Object.entries(raw)) {
      if (Array.isArray(value)) {
        sections.push({
          title: key.replace(/_/g, " "),
          items: (value as any[]).map((it) => (typeof it === "string" ? { vlach: it, greek: null } : it)),
        });
      }
    }
    if (sections.length > 0) return sections;
  }

  return [];
}

// ─── Exercise normaliser ────────────────────────────────────

function normalizeExercises(raw: any): any[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((ex: any) => ({
    ...ex,
    id: ex.id || String(Math.random()),
    title: ex.title || "",
    type: ex.type || "generic",
  }));
}

// ─── Flashcard normaliser ───────────────────────────────────

function normalizeFlashcards(raw: any): Flashcard[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((f: any) => ({ type: f.type, front: f.front, back: f.back }));
}

function generateFlashcardsFromVocabulary(vocab: VocabularySection[]): Flashcard[] {
  const cards: Flashcard[] = [];
  for (const section of vocab) {
    for (const item of section.items) {
      if (item.vlach && item.greek) {
        cards.push({ type: "vocabulary", front: item.vlach, back: item.greek });
      }
    }
  }
  return cards;
}

// ─── Main adapter function ──────────────────────────────────

export function legacyLessonToModule(data: any): Module {
  const unit = data.unit;
  const card = data.homepage_card;
  const unitNumber: number = unit.number;

  const title = card.title || `Ενότητα ${unitNumber}`;
  const subtitle = unit.title_vlach || undefined;
  const description = card.description || card.summary || "";

  // Build sections
  const sections: ModuleSection[] = [];
  let order = 0;

  // Theory section
  if (data.theory) {
    sections.push({
      id: `theory-${unitNumber}`,
      type: "theory",
      title: "Θεωρία",
      order: order++,
      data: { theory: data.theory, unitNumber },
    });
  }

  // Vocabulary section
  const vocabulary = normalizeVocabulary(data.vocabulary);
  if (vocabulary.length > 0) {
    sections.push({
      id: `vocabulary-${unitNumber}`,
      type: "vocabulary",
      title: "Λεξιλόγιο",
      order: order++,
      data: { sections: vocabulary },
    });
  }

  // Exercises section
  const exercises = normalizeExercises(data.exercises);
  if (exercises.length > 0) {
    sections.push({
      id: `exercises-${unitNumber}`,
      type: "exercises",
      title: "Ασκήσεις",
      order: order++,
      data: { exercises, unitNumber },
    });
  }

  // Flashcards section
  let flashcards = normalizeFlashcards(data.flashcards);
  if (flashcards.length === 0) {
    flashcards = generateFlashcardsFromVocabulary(vocabulary);
  }
  if (flashcards.length > 0) {
    sections.push({
      id: `flashcards-${unitNumber}`,
      type: "flashcards",
      title: "Κάρτες",
      order: order++,
      data: { flashcards },
    });
  }

  // Quiz section (generated from flashcards + vocabulary)
  if (flashcards.length >= 4 || vocabulary.some((s) => s.items.length >= 4)) {
    sections.push({
      id: `quiz-${unitNumber}`,
      type: "quiz",
      title: "Quiz",
      order: order++,
      data: { flashcards, vocabulary },
    });
  }

  const status =
    unit.material_status === "μερικό"
      ? "partial" as const
      : "published" as const;

  return {
    id: `lesson-${unitNumber}`,
    type: "lesson",
    status,
    title,
    subtitle,
    description,
    audience: "learner",
    tags: [],
    order: unitNumber,
    accentColor: UNIT_COLORS[unitNumber] || "warm",
    sections,
    lastUpdated: data.lastUpdated || "2026-03-20",
    meta: {
      unitNumber,
      sourceFiles: data.source_files,
      scriptPolicy: unit.script_policy,
      availableMaterial: unit.available_material,
      missingOrNotFound: unit.missing_or_not_found,
    },
  };
}
