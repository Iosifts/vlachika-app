import type { AppProgress, ModuleProgress } from "./types";

const STORAGE_KEY = "vlachika-progress-v2";

function defaultProgress(): ModuleProgress {
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

export function getModuleProgress(moduleId: string): ModuleProgress {
  const all = loadProgress();
  return all[moduleId] || defaultProgress();
}

export function markSectionViewed(moduleId: string, sectionId: string): void {
  const all = loadProgress();
  const mp = all[moduleId] || defaultProgress();
  if (!mp.viewedSections.includes(sectionId)) {
    mp.viewedSections.push(sectionId);
  }
  all[moduleId] = mp;
  saveProgress(all);
}

export function updateFlashcardCount(moduleId: string, count: number): void {
  const all = loadProgress();
  const mp = all[moduleId] || defaultProgress();
  mp.flashcardsPracticed = count;
  all[moduleId] = mp;
  saveProgress(all);
}

export function updateQuizScore(moduleId: string, score: number): void {
  const all = loadProgress();
  const mp = all[moduleId] || defaultProgress();
  mp.quizScore = score;
  mp.completed = true;
  all[moduleId] = mp;
  saveProgress(all);
}
