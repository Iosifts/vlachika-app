"use client";

import { useState, useEffect } from "react";
import type { Lesson } from "@/lib/types";
import { markSectionViewed } from "@/lib/progress";
import TheoryRenderer from "./TheoryRenderer";
import VocabularyGrid from "./VocabularyGrid";
import ExerciseRenderer from "./ExerciseRenderer";
import FlashcardViewer from "./FlashcardViewer";
import QuizRenderer from "./QuizRenderer";
import Link from "next/link";

const TABS = ["Θεωρία", "Λεξιλόγιο", "Ασκήσεις", "Κάρτες", "Quiz"] as const;
type TabName = (typeof TABS)[number];

const TAB_COLORS: Record<number, string> = {
  1: "bg-rose-500",
  2: "bg-olive-500",
  3: "bg-sky-500",
  4: "bg-terra-500",
  6: "bg-warm-600",
};

export default function LessonPageClient({ lesson }: { lesson: Lesson }) {
  const [activeTab, setActiveTab] = useState<TabName>("Θεωρία");

  // Read ?tab= from URL on mount
  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab && TABS.includes(urlTab as TabName)) {
      setActiveTab(urlTab as TabName);
    }
  }, []);

  // Track viewed sections
  useEffect(() => {
    markSectionViewed(lesson.meta.number, activeTab);
  }, [activeTab, lesson.meta.number]);

  const accentBg = TAB_COLORS[lesson.meta.number] || "bg-warm-600";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* ─── Back link ─── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Πίσω στα μαθήματα
      </Link>

      {/* ─── Lesson header ─── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${accentBg}`}
          >
            Ενότητα {lesson.meta.number}
          </span>
          {lesson.meta.materialStatus === "μερικό" && (
            <span className="text-xs text-warm-400 italic">
              Μερικό υλικό
            </span>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-warm-800">
          {lesson.meta.title}
        </h2>
        {lesson.meta.titleVlach && (
          <p className="vlach-text text-lg mt-1">{lesson.meta.titleVlach}</p>
        )}
        <p className="text-warm-600 mt-2">{lesson.meta.description}</p>
      </header>

      {/* ─── Tabs ─── */}
      <nav className="flex flex-wrap gap-1 mb-8 border-b border-warm-200 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? `${accentBg} text-white`
                : "text-warm-500 hover:text-warm-700 hover:bg-warm-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* ─── Tab content ─── */}
      <div className="min-h-[400px]">
        {activeTab === "Θεωρία" && (
          <TheoryRenderer
            theory={lesson.theory}
            unitNumber={lesson.meta.number}
          />
        )}
        {activeTab === "Λεξιλόγιο" && (
          <VocabularyGrid sections={lesson.vocabulary} />
        )}
        {activeTab === "Ασκήσεις" && (
          <ExerciseRenderer
            exercises={lesson.exercises}
            unitNumber={lesson.meta.number}
          />
        )}
        {activeTab === "Κάρτες" && (
          <FlashcardViewer
            flashcards={lesson.flashcards}
            lessonNumber={lesson.meta.number}
          />
        )}
        {activeTab === "Quiz" && (
          <QuizRenderer
            flashcards={lesson.flashcards}
            vocabulary={lesson.vocabulary}
            lessonNumber={lesson.meta.number}
          />
        )}
      </div>
    </div>
  );
}
