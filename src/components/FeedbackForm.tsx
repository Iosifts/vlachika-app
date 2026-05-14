"use client";

import { useState, type FormEvent } from "react";
import { submitFeedback, FEEDBACK_MAX_LENGTH } from "@/lib/services/feedback";

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
  /** Optional callback after a successful submission. */
  onSubmitted?: () => void;
}

export default function FeedbackForm({ onSubmitted }: Props) {
  const [text, setText] = useState("");
  // Honeypot — bots fill this, humans don't see it.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const remaining = FEEDBACK_MAX_LENGTH - text.length;
  const tooLong = text.length > FEEDBACK_MAX_LENGTH;
  const empty = text.trim().length === 0;
  const disabled = status === "submitting" || empty || tooLong;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;

    // Honeypot hit — pretend success, do nothing.
    if (website.trim().length > 0) {
      setStatus("success");
      setText("");
      onSubmitted?.();
      return;
    }

    setStatus("submitting");
    const ok = await submitFeedback(text);
    if (ok) {
      setStatus("success");
      setText("");
      onSubmitted?.();
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
          <div>
            <p className="text-warm-800 font-medium">
              Ευχαριστούμε! Το σχόλιό σου στάλθηκε και θα εμφανιστεί μετά
              από έλεγχο.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-3 text-sm text-sky-600 hover:text-sky-700 underline-offset-2 hover:underline transition-colors"
            >
              Στείλε άλλο σχόλιο
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-2xl p-6 sm:p-8 space-y-4">
      <div>
        <label
          htmlFor="feedback-text"
          className="block text-sm font-medium text-warm-700"
        >
          Τι θα ήθελες να μας πεις;
        </label>
        <p className="mt-1 text-xs text-warm-500">
          Μην γράφεις προσωπικά στοιχεία στο σχόλιό σου.
        </p>
        <textarea
          id="feedback-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={6}
          maxLength={FEEDBACK_MAX_LENGTH + 50 /* allow client check */}
          placeholder="Γράψε εδώ τη γνώμη ή την ιδέα σου…"
          className="mt-3 w-full resize-y rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm leading-6 text-warm-800 placeholder:text-warm-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className={tooLong ? "text-rose-600" : "text-warm-400"}>
            {tooLong
              ? `Πολύ μεγάλο κατά ${-remaining} χαρακτήρες`
              : `${remaining} χαρακτήρες ακόμη`}
          </span>
        </div>
      </div>

      {/* Honeypot — visually hidden, ignored by humans, irresistible for bots */}
      <div aria-hidden className="hidden" style={{ display: "none" }}>
        <label htmlFor="feedback-website">Website</label>
        <input
          id="feedback-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          Κάτι πήγε στραβά. Δοκίμασε ξανά σε λίγο.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow disabled:cursor-not-allowed disabled:bg-warm-300 disabled:shadow-none"
        >
          {status === "submitting" ? "Αποστολή…" : "Αποστολή σχολίου"}
        </button>
      </div>
    </form>
  );
}
