"use client";

import { useState, useMemo } from "react";
import type { Flashcard, VocabularySection } from "@/lib/types";
import { updateQuizScore } from "@/lib/progress";

interface Props {
  flashcards: Flashcard[];
  vocabulary: VocabularySection[];
  lessonNumber: number;
}

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(
  flashcards: Flashcard[],
  vocabulary: VocabularySection[]
): QuizQuestion[] {
  // Collect all pairs with both front/back or vlach/greek
  const pairs: { front: string; back: string }[] = [];

  for (const fc of flashcards) {
    if (fc.front && fc.back) {
      pairs.push({ front: fc.front, back: fc.back });
    }
  }

  for (const sec of vocabulary) {
    for (const item of sec.items) {
      if (item.vlach && item.greek) {
        const exists = pairs.some(
          (p) => p.front === item.vlach && p.back === item.greek
        );
        if (!exists) {
          pairs.push({ front: item.vlach, back: item.greek });
        }
      }
    }
  }

  if (pairs.length < 4) return [];

  // Generate up to 15 questions
  const selected = shuffleArray(pairs).slice(0, 15);
  const allBacks = pairs.map((p) => p.back);

  return selected.map((pair) => {
    // Generate 3 wrong options
    const wrongOptions = shuffleArray(
      allBacks.filter((b) => b !== pair.back)
    ).slice(0, 3);

    const options = shuffleArray([pair.back, ...wrongOptions]);

    return {
      question: pair.front,
      correctAnswer: pair.back,
      options,
    };
  });
}

export default function QuizRenderer({
  flashcards,
  vocabulary,
  lessonNumber,
}: Props) {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(
    () => generateQuestions(flashcards, vocabulary),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [started]
  );

  if (questions.length === 0 && !started) {
    return (
      <div className="text-warm-500 text-center py-12">
        <p>Δεν υπάρχει αρκετό υλικό για quiz σε αυτή την ενότητα.</p>
        <p className="text-sm mt-2 text-warm-400">
          Δοκίμασε τις Κάρτες για εξάσκηση.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-warm-800 mb-3">
          Quiz — Ενότητα {lessonNumber}
        </h3>
        <p className="text-warm-600 mb-6">
          Ερωτήσεις πολλαπλής επιλογής βασισμένες στο λεξιλόγιο και τις κάρτες
          της ενότητας.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 bg-warm-800 text-white rounded-lg text-base font-medium hover:bg-warm-900 transition-colors"
        >
          Ξεκίνα το Quiz
        </button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-warm-800 mb-2">
          Αποτέλεσμα
        </h3>
        <div className="text-5xl font-bold mb-4">
          <span className={pct >= 70 ? "text-olive-600" : "text-terra-600"}>
            {pct}%
          </span>
        </div>
        <p className="text-warm-600 mb-2">
          {score} / {questions.length} σωστές
        </p>
        <p className="text-sm text-warm-400 mb-6">
          {pct >= 90
            ? "Εξαιρετικά!"
            : pct >= 70
            ? "Πολύ καλά!"
            : pct >= 50
            ? "Χρειάζεται λίγη ακόμα εξάσκηση."
            : "Ξαναδιάβασε το μάθημα και ξαναδοκίμασε."}
        </p>
        <button
          onClick={() => {
            setStarted(false);
            setCurrentQ(0);
            setSelected(null);
            setShowResult(false);
            setScore(0);
            setFinished(false);
          }}
          className="px-8 py-3 bg-warm-800 text-white rounded-lg text-base font-medium hover:bg-warm-900 transition-colors"
        >
          Ξαναδοκίμασε
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
    if (option === q.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      const finalScore =
        selected === q.correctAnswer ? score : score; // score already updated
      updateQuizScore(lessonNumber, finalScore);
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-2 bg-warm-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-warm-600 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQ + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-warm-500">
          {currentQ + 1}/{questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white border border-warm-200 rounded-xl p-6 mb-6">
        <p className="text-xs text-warm-400 uppercase tracking-wider mb-2">
          Τι σημαίνει:
        </p>
        <p className="vlach-text text-2xl">{q.question}</p>
      </div>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        {q.options.map((opt, i) => {
          let bg = "bg-white border-warm-200 hover:border-warm-400";
          if (showResult) {
            if (opt === q.correctAnswer) {
              bg = "bg-olive-50 border-olive-400 text-olive-800";
            } else if (opt === selected && opt !== q.correctAnswer) {
              bg = "bg-red-50 border-red-300 text-red-700";
            } else {
              bg = "bg-warm-50 border-warm-200 text-warm-400";
            }
          } else if (selected === opt) {
            bg = "bg-warm-100 border-warm-400";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={showResult}
              className={`border-2 rounded-xl p-4 text-left text-sm transition-all ${bg}`}
            >
              <span className="text-warm-400 font-medium mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {showResult && (
        <div className="text-center">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-warm-800 text-white rounded-lg text-sm font-medium hover:bg-warm-900 transition-colors"
          >
            {currentQ + 1 >= questions.length ? "Δες το σκορ" : "Επόμενη"}
          </button>
        </div>
      )}
    </div>
  );
}
