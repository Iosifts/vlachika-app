"use client";

import { useState, useCallback, useEffect } from "react";
import type { Flashcard } from "@/lib/types";
import { updateFlashcardCount } from "@/lib/progress";

interface Props {
  flashcards: Flashcard[];
  lessonNumber: number;
}

export default function FlashcardViewer({ flashcards, lessonNumber }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [practiced, setPracticed] = useState(0);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Get unique types for filter
  const types = Array.from(new Set(flashcards.map((f) => f.type).filter(Boolean)));

  const filtered = filterType
    ? flashcards.filter((f) => f.type === filterType)
    : flashcards;

  const card = filtered[current];

  const next = useCallback(() => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % filtered.length);
    setPracticed((p) => p + 1);
  }, [filtered.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setCurrent((prev) => (prev - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const shuffle = useCallback(() => {
    setFlipped(false);
    setCurrent(Math.floor(Math.random() * filtered.length));
  }, [filtered.length]);

  // Save progress
  useEffect(() => {
    if (practiced > 0) {
      updateFlashcardCount(lessonNumber, practiced);
    }
  }, [practiced, lessonNumber]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  if (flashcards.length === 0) {
    return (
      <div className="text-warm-500 text-center py-12">
        Δεν υπάρχουν διαθέσιμες κάρτες για αυτή την ενότητα.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Type filter */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setFilterType(null);
              setCurrent(0);
              setFlipped(false);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !filterType
                ? "bg-warm-800 text-white"
                : "bg-warm-100 text-warm-600 hover:bg-warm-200"
            }`}
          >
            Όλες
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterType(t!);
                setCurrent(0);
                setFlipped(false);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterType === t
                  ? "bg-warm-800 text-white"
                  : "bg-warm-100 text-warm-600 hover:bg-warm-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="text-sm text-warm-400 mb-4">
        {current + 1} / {filtered.length}
      </p>

      {/* Card */}
      {card && (
        <div
          className="flip-card w-full max-w-md h-64 cursor-pointer mb-6"
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className={`flip-card-inner relative w-full h-full ${
              flipped ? "flipped" : ""
            }`}
          >
            {/* Front */}
            <div className="flip-card-front absolute inset-0 bg-white border-2 border-warm-200 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm">
              <p className="text-xs text-warm-400 uppercase tracking-wider mb-3">
                {card.type || "κάρτα"}
              </p>
              <p className="vlach-text text-2xl text-center leading-relaxed">
                {card.front}
              </p>
              <p className="text-xs text-warm-300 mt-4">
                Πάτα για απάντηση
              </p>
            </div>

            {/* Back */}
            <div className="flip-card-back absolute inset-0 bg-warm-800 text-white rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm">
              <p className="text-xs text-warm-400 uppercase tracking-wider mb-3">
                απάντηση
              </p>
              <p className="text-2xl text-center leading-relaxed">
                {card.back}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          className="p-3 rounded-lg bg-warm-100 text-warm-600 hover:bg-warm-200 transition-colors"
          title="Προηγούμενη"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={shuffle}
          className="px-5 py-2.5 rounded-lg bg-warm-800 text-white text-sm font-medium hover:bg-warm-900 transition-colors"
        >
          Τυχαία
        </button>
        <button
          onClick={next}
          className="p-3 rounded-lg bg-warm-100 text-warm-600 hover:bg-warm-200 transition-colors"
          title="Επόμενη"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-warm-400 mt-4">
        Χρήση πληκτρολογίου: ← → για πλοήγηση, Space για αναστροφή
      </p>

      {practiced > 0 && (
        <p className="text-xs text-olive-600 mt-2">
          Εξασκήθηκες σε {practiced} κάρτες
        </p>
      )}
    </div>
  );
}
