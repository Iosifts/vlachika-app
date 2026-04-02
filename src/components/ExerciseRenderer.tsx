"use client";

import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  exercises: any[];
  unitNumber: number;
}

// ─── Solution toggle button ─────────────────────────────────

function SolutionButton({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-4 px-4 py-2 text-sm rounded-lg border border-warm-300 text-warm-600 hover:bg-warm-100 transition-colors flex items-center gap-2"
    >
      <svg
        className={`w-4 h-4 transition-transform ${show ? "rotate-90" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
      {show ? "Απόκρυψη λύσεων" : "Εμφάνιση λύσεων"}
    </button>
  );
}

// ─── 1. fill_in_letters (Unit 1) ────────────────────────────

function FillInLettersExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);
  const groups = exercise.groups || [];
  const answers = exercise.answers || [];

  if (groups.length === 0) return null;

  return (
    <div className="space-y-6">
      {exercise.instructions && (
        <p className="text-sm text-warm-600 italic">{exercise.instructions}</p>
      )}
      <div className="flex items-center gap-2 text-sm text-warm-400 mb-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 14M8.464 8.464a5 5 0 000 7.072" />
        </svg>
        <span>Ηχητικό υλικό — θα προστεθεί σύντομα</span>
      </div>

      {groups.map((group: any, gi: number) => (
        <div
          key={gi}
          className="bg-white border border-warm-200 rounded-lg p-4"
        >
          <p className="font-medium text-warm-700 mb-3">
            {group.letter_choice || group.header}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.items?.map((item: any, ii: number) => {
              const answerGroup = answers[gi];
              const answerItem = answerGroup?.items?.[ii];
              return (
                <div key={ii} className="flex items-baseline gap-2">
                  <span className="text-warm-400 text-sm min-w-[24px]">
                    {item.number}.
                  </span>
                  <span className="vlach-text">{item.text}</span>
                  {showSolution && answerItem && (
                    <span className="text-olive-600 text-sm font-medium ml-2">
                      → {answerItem.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
    </div>
  );
}

// ─── 2. fill_in_verb_form (Unit 2) ──────────────────────────

function FillInVerbFormExercise({ exercise }: { exercise: any }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-3">
      {exercise.instruction && (
        <p className="text-sm text-warm-600 italic mb-4">
          {exercise.instruction}
        </p>
      )}
      {exercise.items?.map((item: any, i: number) => (
        <div
          key={i}
          className="bg-white border border-warm-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-warm-400 text-sm font-medium min-w-[28px]">
              {item.number || i + 1}.
            </span>
            <div className="flex-1">
              <p className="vlach-text mb-2">{item.prompt}</p>
              <input
                type="text"
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder="Γράψε την απάντηση..."
                className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
              />
              {showSolution && item.answer_with_filled_form && (
                <p className="text-olive-600 text-sm mt-2">
                  <span className="font-medium">Λύση:</span>{" "}
                  <span className="vlach-text">{item.answer_with_filled_form}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
    </div>
  );
}

// ─── 3. open_production (Unit 2) ────────────────────────────

function OpenProductionExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);
  const content = exercise.content || {};

  return (
    <div className="space-y-4">
      <p className="text-warm-700">
        {content.prompt || exercise.title}
      </p>
      {content.answer_count_requested && (
        <p className="text-sm text-warm-500">
          Σχημάτισε {content.answer_count_requested} προτάσεις.
        </p>
      )}
      <textarea
        rows={6}
        className="w-full px-4 py-3 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
        placeholder="Γράψε τις προτάσεις σου εδώ..."
      />
      {content.official_answers && content.official_answers.length > 0 && (
        <>
          <SolutionButton
            show={showSolution}
            onClick={() => setShowSolution(!showSolution)}
          />
          {showSolution && (
            <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
              <p className="text-sm font-medium text-olive-700 mb-2">
                Ενδεικτικές απαντήσεις:
              </p>
              {content.official_answers.map((a: string, i: number) => (
                <p key={i} className="vlach-text text-sm">
                  {i + 1}. {a}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── 4. translation_dialogue (Unit 2) ───────────────────────

function TranslationDialogueExercise({ exercise }: { exercise: any }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-3">
      {exercise.items?.map((item: any, i: number) => (
        <div
          key={i}
          className="bg-white border border-warm-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-warm-400 text-sm font-medium min-w-[28px]">
              {item.number || i + 1}.
            </span>
            <div className="flex-1">
              <p className="vlach-text mb-2">
                {item.prompt || item.source_line}
              </p>
              <input
                type="text"
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder="Γράψε την απάντηση..."
                className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
              />
              {showSolution && item.official_answer && (
                <p className="text-olive-600 text-sm mt-2">
                  <span className="font-medium">Λύση:</span>{" "}
                  <span className="vlach-text">{item.official_answer}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
    </div>
  );
}

// ─── 5. categorization (Unit 2) ─────────────────────────────

function CategorizationExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);
  const wordBank = exercise.word_bank || [];
  const categories = exercise.categories || [];

  return (
    <div className="space-y-4">
      {/* Word bank */}
      <div className="bg-warm-100 rounded-lg p-4">
        <p className="text-sm font-medium text-warm-600 mb-2">
          Τράβηξε τις λέξεις στη σωστή κατηγορία:
        </p>
        <div className="flex flex-wrap gap-2">
          {wordBank.map((w: string, i: number) => (
            <span
              key={i}
              className="vlach-text bg-white px-3 py-1.5 rounded-lg text-sm border border-warm-200"
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((cat: any, i: number) => (
          <div
            key={i}
            className="bg-white border-2 border-dashed border-warm-200 rounded-lg p-4 min-h-[120px]"
          >
            <h5 className="font-medium text-warm-700 mb-2 vlach-text">
              {cat.header}
            </h5>
            {showSolution && cat.official_answers_as_list && (
              <div className="flex flex-wrap gap-1.5">
                {cat.official_answers_as_list.map((a: string, j: number) => (
                  <span
                    key={j}
                    className="vlach-text bg-olive-50 text-olive-700 px-2 py-1 rounded text-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
    </div>
  );
}

// ─── 6. matching_translation (Unit 2) ───────────────────────

function MatchingTranslationExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);
  const leftItems = exercise.left_items || [];
  const rightItems = exercise.right_items || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-warm-600 mb-2">Βλάχικα</p>
          {leftItems.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white border border-warm-200 rounded-lg p-3 mb-2 vlach-text text-sm"
            >
              {typeof item === "string" ? item : item.text || item.vlach}
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium text-warm-600 mb-2">Ελληνικά</p>
          {rightItems.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white border border-warm-200 rounded-lg p-3 mb-2 text-sm"
            >
              {typeof item === "string" ? item : item.text || item.greek}
            </div>
          ))}
        </div>
      </div>
      {(exercise.solution_map_inferred || exercise.solution_map) && (
        <>
          <SolutionButton
            show={showSolution}
            onClick={() => setShowSolution(!showSolution)}
          />
          {showSolution && (
            <div className="bg-olive-50 border border-olive-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-olive-700 mb-2">Σωστή αντιστοίχιση:</p>
              {Object.entries(
                exercise.solution_map_inferred || exercise.solution_map || {}
              ).map(([k, v]) => (
                <p key={k} className="text-olive-600">
                  {k} → {String(v)}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── 7. matching_sentences (Unit 2) ─────────────────────────

function MatchingSentencesExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);
  const leftItems = exercise.left_items || [];
  const rightItems = exercise.right_items || {};

  // right_items could be object {a: "...", b: "..."} or array
  const rightEntries = Array.isArray(rightItems)
    ? rightItems.map((item: any, i: number) => [String.fromCharCode(97 + i), typeof item === "string" ? item : item.text])
    : Object.entries(rightItems);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          {leftItems.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white border border-warm-200 rounded-lg p-3 mb-2 text-sm"
            >
              <span className="font-medium text-warm-500 mr-2">{i + 1}.</span>
              <span className="vlach-text">
                {typeof item === "string" ? item : item.text || item.vlach}
              </span>
            </div>
          ))}
        </div>
        <div>
          {rightEntries.map(([key, val]: any) => (
            <div
              key={key}
              className="bg-white border border-warm-200 rounded-lg p-3 mb-2 text-sm"
            >
              <span className="font-medium text-warm-500 mr-2">{key}.</span>
              <span className="vlach-text">{val}</span>
            </div>
          ))}
        </div>
      </div>
      {exercise.solution_map_inferred && (
        <>
          <SolutionButton
            show={showSolution}
            onClick={() => setShowSolution(!showSolution)}
          />
          {showSolution && (
            <div className="bg-olive-50 border border-olive-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-olive-700 mb-2">
                Σωστή αντιστοίχιση:
              </p>
              {Object.entries(exercise.solution_map_inferred).map(
                ([k, v]) => (
                  <p key={k} className="text-olive-600">
                    {k} → {String(v)}
                  </p>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── 8. song_translation (Unit 3) ───────────────────────────

function SongTranslationExercise({ exercise }: { exercise: any }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState(false);

  const hasAnySolution = exercise.items?.some(
    (it: any) => it.official_translation
  );

  return (
    <div className="space-y-3">
      {exercise.items?.map((item: any, i: number) => (
        <div
          key={i}
          className="bg-white border border-warm-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-warm-400 text-sm font-medium min-w-[28px]">
              {item.number || i + 1}.
            </span>
            <div className="flex-1">
              <p className="vlach-text mb-2">{item.source_line}</p>
              <input
                type="text"
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder="Γράψε τη μετάφραση..."
                className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
              />
              {showSolution && item.official_translation && (
                <p className="text-olive-600 text-sm mt-2">
                  <span className="font-medium">Λύση:</span>{" "}
                  {item.official_translation}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      {hasAnySolution && (
        <SolutionButton
          show={showSolution}
          onClick={() => setShowSolution(!showSolution)}
        />
      )}
    </div>
  );
}

// ─── 9. Generic fill-in with official_answer ────────────────

function FillInExercise({ exercise }: { exercise: any }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState(false);

  const hasAnySolution = exercise.items?.some(
    (it: any) =>
      it.official_answer || it.answer || it.answers || it.solved_text
  );

  return (
    <div className="space-y-3">
      {exercise.instruction && (
        <p className="text-sm text-warm-600 italic mb-4">
          {exercise.instruction}
        </p>
      )}
      {exercise.items?.map((item: any, i: number) => {
        const solution =
          item.official_answer ||
          item.solved_text ||
          (item.answers ? item.answers.join(" / ") : null) ||
          item.answer;

        return (
          <div
            key={i}
            className="bg-white border border-warm-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-warm-400 text-sm font-medium min-w-[28px]">
                {item.number || i + 1}.
              </span>
              <div className="flex-1">
                <p className="vlach-text mb-2">
                  {item.prompt || item.source_line}
                </p>
                <input
                  type="text"
                  value={answers[i] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                  }
                  placeholder="Γράψε την απάντηση..."
                  className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
                />
                {showSolution && solution && (
                  <p className="text-olive-600 text-sm mt-2">
                    <span className="font-medium">Λύση:</span>{" "}
                    <span className="vlach-text">{solution}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {hasAnySolution && (
        <SolutionButton
          show={showSolution}
          onClick={() => setShowSolution(!showSolution)}
        />
      )}
    </div>
  );
}

// ─── 10. article_table_completion (Unit 3) ──────────────────

function ArticleTableExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-warm-100 text-warm-700">
              <th className="px-3 py-2 text-left font-medium">
                Αόριστο (εν.)
              </th>
              <th className="px-3 py-2 text-left font-medium">
                + Άρθρο (εν.)
              </th>
              <th className="px-3 py-2 text-left font-medium">
                Αόριστο (πλ.)
              </th>
              <th className="px-3 py-2 text-left font-medium">
                + Άρθρο (πλ.)
              </th>
            </tr>
          </thead>
          <tbody>
            {exercise.items?.map((row: any, i: number) => (
              <tr
                key={i}
                className="border-b border-warm-100 hover:bg-warm-50"
              >
                <td className="px-3 py-2 vlach-text">
                  {row.singular_indefinite}
                </td>
                <td className="px-3 py-2">
                  {showSolution ? (
                    <span className="vlach-text font-medium text-olive-700">
                      {row.singular_definite}
                    </span>
                  ) : (
                    <input
                      type="text"
                      placeholder="..."
                      className="w-full px-2 py-1 rounded border border-warm-200 text-sm"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {showSolution ? (
                    <span className="vlach-text font-medium text-olive-700">
                      {row.plural_indefinite}
                    </span>
                  ) : (
                    <input
                      type="text"
                      placeholder="..."
                      className="w-full px-2 py-1 rounded border border-warm-200 text-sm"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {showSolution ? (
                    <span className="vlach-text font-medium text-olive-700">
                      {row.plural_definite}
                    </span>
                  ) : (
                    <input
                      type="text"
                      placeholder="..."
                      className="w-full px-2 py-1 rounded border border-warm-200 text-sm"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
    </div>
  );
}

// ─── 11. grammar_table (Unit 4) ─────────────────────────────

function GrammarTableExercise({ exercise }: { exercise: any }) {
  const columns =
    exercise.table_columns || Object.keys(exercise.rows?.[0] || {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-warm-100 text-warm-700">
            {columns.map((col: string, i: number) => (
              <th key={i} className="px-3 py-2 text-left font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exercise.rows?.map((row: any, i: number) => (
            <tr
              key={i}
              className="border-b border-warm-100 hover:bg-warm-50"
            >
              <td className="px-3 py-2 vlach-text">
                {row.noun_singular}
              </td>
              <td className="px-3 py-2 vlach-text font-medium">
                {row.definite}
              </td>
              <td className="px-3 py-2 vlach-text">{row.indefinite}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 12. worked_examples_only (Unit 4) ──────────────────────

function WorkedExamplesExercise({ exercise }: { exercise: any }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-warm-500 italic mb-3">
        Λυμένα παραδείγματα αναφοράς:
      </p>
      {exercise.items?.map((item: any, i: number) => (
        <div
          key={i}
          className="bg-warm-50 border border-warm-200 rounded-lg p-4"
        >
          <span className="text-warm-400 text-sm mr-2">
            {item.number || i + 1}.
          </span>
          <span className="vlach-text">{item.solved_text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 13. verb_collection (Unit 4) ───────────────────────────

function VerbCollectionExercise({ exercise }: { exercise: any }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        className="w-full px-4 py-3 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
        placeholder="Γράψε τα ρήματα που εντόπισες..."
      />
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
      {showSolution && exercise.items && (
        <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
          <p className="text-sm font-medium text-olive-700 mb-2">Ρήματα:</p>
          <div className="flex flex-wrap gap-2">
            {exercise.items.map((item: any, i: number) => (
              <span
                key={i}
                className="vlach-text bg-white px-3 py-1 rounded-lg text-sm border border-olive-200"
              >
                {item.verb}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 14. number_to_words / words_to_number (Unit 6) ─────────

function NumberExercise({ exercise }: { exercise: any }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-3">
      {exercise.items?.map((item: any, i: number) => (
        <div
          key={i}
          className="bg-white border border-warm-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-warm-400 text-sm font-medium min-w-[28px]">
              {i + 1}.
            </span>
            <div className="flex-1">
              <p className={exercise.type === "number_to_words" ? "text-lg font-bold text-warm-800 mb-2" : "vlach-text mb-2"}>
                {item.prompt}
              </p>
              <input
                type="text"
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder={exercise.type === "number_to_words" ? "Γράψε τον αριθμό με λέξεις..." : "Γράψε τον αριθμό..."}
                className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-warm-300"
              />
              {showSolution && item.answer && (
                <p className="text-olive-600 text-sm mt-2">
                  <span className="font-medium">Λύση:</span>{" "}
                  <span className={exercise.type === "number_to_words" ? "vlach-text" : ""}>
                    {item.answer}
                  </span>
                  {item.confidence === "uncertain" && (
                    <span className="text-warm-400 ml-2">(αβέβαιο)</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <SolutionButton
        show={showSolution}
        onClick={() => setShowSolution(!showSolution)}
      />
    </div>
  );
}

// ─── 15. clock_image (Unit 6) ───────────────────────────────

function ClockExercise({ exercise }: { exercise: any }) {
  return (
    <div className="text-center py-8">
      <div className="flex items-center justify-center gap-2 text-warm-400 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-warm-600">
        Αυτή η άσκηση βασίζεται σε εικόνες ρολογιού.
      </p>
      <p className="text-sm text-warm-400 mt-2">
        Οι εικόνες θα προστεθούν σύντομα.
      </p>
    </div>
  );
}

// ─── Main exercise type dispatcher ──────────────────────────

function renderExercise(exercise: any) {
  const type = exercise.type;

  switch (type) {
    case "fill_in_letters":
      return <FillInLettersExercise exercise={exercise} />;
    case "fill_in_verb_form":
      return <FillInVerbFormExercise exercise={exercise} />;
    case "open_production":
      return <OpenProductionExercise exercise={exercise} />;
    case "translation_dialogue":
      return <TranslationDialogueExercise exercise={exercise} />;
    case "categorization":
      return <CategorizationExercise exercise={exercise} />;
    case "matching_translation":
      return <MatchingTranslationExercise exercise={exercise} />;
    case "matching_sentences":
      return <MatchingSentencesExercise exercise={exercise} />;
    case "song_translation":
      return <SongTranslationExercise exercise={exercise} />;
    case "article_table_completion":
      return <ArticleTableExercise exercise={exercise} />;
    case "grammar_table":
      return <GrammarTableExercise exercise={exercise} />;
    case "worked_examples_only":
      return <WorkedExamplesExercise exercise={exercise} />;
    case "verb_collection":
      return <VerbCollectionExercise exercise={exercise} />;
    case "number_to_words":
    case "words_to_number":
      return <NumberExercise exercise={exercise} />;
    case "clock_image":
      return <ClockExercise exercise={exercise} />;
    case "fill_in_article":
    case "fill_in_article_and_preposition":
    case "fill_in_connector":
    case "fill_in_the_blank":
    case "fill_from_word_bank":
    case "add_definite_article":
    case "sentence_transformation":
      return <FillInExercise exercise={exercise} />;
    default:
      return <FillInExercise exercise={exercise} />;
  }
}

// ─── Check if exercise has renderable content ───────────────

function exerciseHasContent(exercise: any): boolean {
  if (!exercise) return false;
  const type = exercise.type;

  // Items-based exercises
  if (exercise.items && exercise.items.length > 0) return true;

  // Group-based (Unit 1)
  if (exercise.groups && exercise.groups.length > 0) return true;

  // Content-based (open_production)
  if (exercise.content) return true;

  // Matching exercises
  if (exercise.left_items && exercise.right_items) return true;

  // Categorization
  if (exercise.word_bank && exercise.categories) return true;

  // Grammar table
  if (type === "grammar_table" && exercise.rows) return true;

  return false;
}

// ─── Main renderer ──────────────────────────────────────────

export default function ExerciseRenderer({ exercises, unitNumber }: Props) {
  const [activeExercise, setActiveExercise] = useState(0);

  // Filter to only exercises with content
  const validExercises = exercises.filter(exerciseHasContent);

  if (validExercises.length === 0) {
    return (
      <div className="text-warm-500 text-center py-12">
        <p>Δεν υπάρχουν διαθέσιμες ασκήσεις για την Ενότητα {unitNumber}.</p>
        <p className="text-sm mt-2 text-warm-400">
          Δοκίμασε τις Κάρτες ή το Quiz για εξάσκηση.
        </p>
      </div>
    );
  }

  // Clamp active exercise index
  const currentIdx = Math.min(activeExercise, validExercises.length - 1);
  const current = validExercises[currentIdx];

  return (
    <div>
      {/* Exercise sub-tabs */}
      {validExercises.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {validExercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => setActiveExercise(i)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                currentIdx === i
                  ? "bg-warm-800 text-white"
                  : "bg-warm-100 text-warm-600 hover:bg-warm-200"
              }`}
            >
              {ex.title || `Άσκηση ${ex.id}`}
            </button>
          ))}
        </div>
      )}

      {/* Exercise title */}
      {current.title && (
        <h4 className="text-lg font-semibold text-warm-800 mb-4">
          {current.title}
        </h4>
      )}

      {/* Render the exercise */}
      {renderExercise(current)}
    </div>
  );
}
