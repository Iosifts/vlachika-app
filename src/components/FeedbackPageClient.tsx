"use client";

import { useState, useCallback } from "react";
import FeedbackForm from "./FeedbackForm";
import ApprovedFeedbackList from "./ApprovedFeedbackList";

export default function FeedbackPageClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmitted = useCallback(() => {
    // New comments are pending — won't show immediately,
    // but bumping the key keeps the list up to date with any
    // recently approved ones the user hasn't seen yet.
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* ─── Header card ─── */}
      <section>
        <div className="surface-panel rounded-[28px] px-6 py-8 sm:px-9 sm:py-10">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            Σχόλια
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-warm-900">
            Σχόλια &amp; Ιδέες
          </h1>
          <p className="mt-4 text-warm-600 leading-7">
            Η ιστοσελίδα είναι ακόμα υπό διαμόρφωση. Γράψε ελεύθερα τι σου
            άρεσε, τι σε μπέρδεψε ή τι θα ήθελες να αλλάξει. Τα σχόλια
            εμφανίζονται δημόσια μετά από έλεγχο.
          </p>
        </div>
      </section>

      {/* ─── Form ─── */}
      <section>
        <FeedbackForm onSubmitted={handleSubmitted} />
      </section>

      {/* ─── Approved comments ─── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-warm-800">
            Τι είπαν οι επισκέπτες
          </h2>
          <p className="mt-1 text-sm text-warm-500">
            Δημόσια σχόλια από επισκέπτες, ταξινομημένα με τα πιο πρόσφατα
            πρώτα.
          </p>
        </div>
        <ApprovedFeedbackList refreshKey={refreshKey} />
      </section>
    </div>
  );
}
