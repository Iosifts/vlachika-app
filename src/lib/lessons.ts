import enotita1 from "@/data/enotita_1_material.json";
import enotita2 from "@/data/enotita_2_material.json";
import enotita3 from "@/data/enotita_3_material.json";
import enotita4 from "@/data/enotita_4_material.json";
import enotita6 from "@/data/enotita_6_material.json";
import type {
  Lesson,
  LessonMeta,
  VocabularySection,
  VocabularyItem,
  Exercise,
  Flashcard,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Helpers ────────────────────────────────────────────────

function getTitle(unit: any): string {
  return unit.title || unit.title_gr || `Ενότητα ${unit.number}`;
}

function getTitleVlach(unit: any): string | undefined {
  return unit.title_vlach || undefined;
}

function getDescription(card: any): string {
  return card.description || card.summary || "";
}

// ─── Vocabulary normaliser ──────────────────────────────────

function normalizeVocabulary(raw: any): VocabularySection[] {
  if (!raw) return [];

  // Unit 1 style: { main: [...], exercise_consonants: [...] }
  if (raw.main && Array.isArray(raw.main)) {
    const sections: VocabularySection[] = [];
    sections.push({
      title: "Βασικό λεξιλόγιο",
      items: raw.main as VocabularyItem[],
    });
    if (raw.exercise_consonants) {
      sections.push({
        title: "Λεξιλόγιο ασκήσεων",
        items: raw.exercise_consonants as VocabularyItem[],
      });
    }
    return sections;
  }

  // Unit 2 style: multiple named sections
  if (raw.section_2_main || raw.section_2_1 || raw.section_2_2) {
    const sections: VocabularySection[] = [];
    if (raw.section_2_main)
      sections.push({
        title: "Βασικές εκφράσεις",
        items: raw.section_2_main,
      });
    if (raw.section_2_1)
      sections.push({ title: "Ενότητα 2.1", items: raw.section_2_1 });
    if (raw.section_2_2)
      sections.push({ title: "Ενότητα 2.2", items: raw.section_2_2 });
    if (raw.exercise_a_vocabulary)
      sections.push({
        title: "Λεξιλόγιο ασκήσεων",
        items: raw.exercise_a_vocabulary,
      });
    if (raw.useful_vocabulary)
      sections.push({
        title: "Χρήσιμο λεξιλόγιο",
        items: raw.useful_vocabulary,
      });
    return sections;
  }

  // Unit 4/6 style: { title, sections: [...] }
  if (raw.sections && Array.isArray(raw.sections)) {
    return raw.sections.map((s: any) => ({
      title: s.title || "Λεξιλόγιο",
      items: Array.isArray(s.items)
        ? s.items.map((it: any) => {
            if (typeof it === "string") return { vlach: it, greek: null };
            return it as VocabularyItem;
          })
        : [],
    }));
  }

  // Unit 3 style: { sections: { theme_family: [...] } }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const sections: VocabularySection[] = [];
    for (const [key, value] of Object.entries(raw)) {
      if (Array.isArray(value)) {
        sections.push({
          title: key.replace(/_/g, " "),
          items: (value as any[]).map((it) =>
            typeof it === "string" ? { vlach: it, greek: null } : it
          ),
        });
      }
    }
    if (sections.length > 0) return sections;
  }

  return [];
}

// ─── Exercise normaliser ────────────────────────────────────
// Pass through raw exercise objects so the renderer can handle all types

function normalizeExercises(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((ex: any) => ({
      ...ex,
      id: ex.id || String(Math.random()),
      title: ex.title || "",
      type: ex.type || "generic",
    }));
  }
  return [];
}

// ─── Flashcard normaliser ───────────────────────────────────

function normalizeFlashcards(raw: any): Flashcard[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((f: any) => ({
      type: f.type,
      front: f.front,
      back: f.back,
    }));
  }
  return [];
}

// ─── Generate flashcards from vocabulary if none provided ───

function generateFlashcardsFromVocabulary(
  vocab: VocabularySection[]
): Flashcard[] {
  const cards: Flashcard[] = [];
  for (const section of vocab) {
    for (const item of section.items) {
      if (item.vlach && item.greek) {
        cards.push({
          type: "vocabulary",
          front: item.vlach,
          back: item.greek,
        });
      }
    }
  }
  return cards;
}

// ─── Build a single lesson ──────────────────────────────────

function buildLesson(data: any): Lesson {
  const unit = data.unit;
  const card = data.homepage_card;

  const vocabulary = normalizeVocabulary(data.vocabulary);
  const exercises = normalizeExercises(data.exercises);
  let flashcards = normalizeFlashcards(data.flashcards);

  if (flashcards.length === 0) {
    flashcards = generateFlashcardsFromVocabulary(vocabulary);
  }

  const meta: LessonMeta = {
    number: unit.number,
    title: getTitle(unit),
    titleVlach: getTitleVlach(unit),
    slug: unit.slug,
    description: getDescription(card),
    materialStatus: unit.material_status,
    available: true,
    buttons: card.buttons || [],
  };

  return {
    meta,
    theory: data.theory || {},
    vocabulary,
    exercises,
    flashcards,
  };
}

// ─── All lessons ────────────────────────────────────────────

const rawSources = [enotita1, enotita2, enotita3, enotita4, enotita6];
const allLessons: Lesson[] = rawSources.map(buildLesson);

// Sort by unit number
allLessons.sort((a, b) => a.meta.number - b.meta.number);

export function getAllLessons(): Lesson[] {
  return allLessons;
}

export function getLessonByNumber(num: number): Lesson | undefined {
  return allLessons.find((l) => l.meta.number === num);
}

export function getAvailableLessonNumbers(): number[] {
  return allLessons.map((l) => l.meta.number);
}

// Placeholder for lesson 5
export const MISSING_LESSONS = [5];
