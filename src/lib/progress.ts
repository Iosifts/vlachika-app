import type { AppProgress, LessonProgress } from "./types";

const STORAGE_KEY = "vlachika-progress";

function defaultProgress(): LessonProgress {
  return {
    viewedSections: [],
    flashcardsPracticed: 0,
    quizScore: null,
    completed: false,
  };
}

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: AppProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getLessonProgress(lessonNumber: number): LessonProgress {
  const all = loadProgress();
  return all[lessonNumber] || defaultProgress();
}

export function markSectionViewed(
  lessonNumber: number,
  section: string
): void {
  const all = loadProgress();
  const lp = all[lessonNumber] || defaultProgress();
  if (!lp.viewedSections.includes(section)) {
    lp.viewedSections.push(section);
  }
  all[lessonNumber] = lp;
  saveProgress(all);
}

export function updateFlashcardCount(
  lessonNumber: number,
  count: number
): void {
  const all = loadProgress();
  const lp = all[lessonNumber] || defaultProgress();
  lp.flashcardsPracticed = count;
  all[lessonNumber] = lp;
  saveProgress(all);
}

export function updateQuizScore(
  lessonNumber: number,
  score: number
): void {
  const all = loadProgress();
  const lp = all[lessonNumber] || defaultProgress();
  lp.quizScore = score;
  lp.completed = true;
  all[lessonNumber] = lp;
  saveProgress(all);
}
