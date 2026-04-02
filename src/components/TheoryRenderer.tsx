"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  theory: Record<string, unknown>;
  unitNumber: number;
}

// ─── Small reusable blocks ──────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-semibold text-warm-800 mb-4 mt-8 first:mt-0">
      {children}
    </h3>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base font-semibold text-warm-700 mb-2 mt-6">
      {children}
    </h4>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-warm-100 border-l-4 border-warm-300 rounded-r-lg p-4 my-4 text-sm text-warm-700">
      {children}
    </div>
  );
}

function VlachBlock({ vlach, greek }: { vlach: string; greek: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-1.5">
      <span className="vlach-text text-base">{vlach}</span>
      <span className="greek-text text-sm">{greek}</span>
    </div>
  );
}

// ─── Unit 1: Alphabet ───────────────────────────────────────

function AlphabetTheory({ theory }: { theory: any }) {
  return (
    <div className="space-y-6">
      {theory.orthography_title_gr && (
        <SectionTitle>{theory.orthography_title_gr}</SectionTitle>
      )}
      {theory.orthography_title_vlach && (
        <p className="vlach-text text-lg mb-4">
          {theory.orthography_title_vlach}
        </p>
      )}

      {/* Alphabet table */}
      {theory.alphabet && (
        <>
          <SubTitle>Αλφάβητο</SubTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-warm-100 text-warm-700">
                  <th className="px-4 py-2 text-left font-medium rounded-tl-lg">
                    Γράμμα
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Προφορά
                  </th>
                  <th className="px-4 py-2 text-left font-medium rounded-tr-lg">
                    Παραδείγματα
                  </th>
                </tr>
              </thead>
              <tbody>
                {theory.alphabet.map((entry: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-warm-100 hover:bg-warm-50"
                  >
                    <td className="px-4 py-2 vlach-text whitespace-pre-line">
                      {entry.letters}
                    </td>
                    <td className="px-4 py-2 whitespace-pre-line">
                      {entry.pronunciation || "—"}
                    </td>
                    <td className="px-4 py-2 vlach-text">
                      {entry.examples?.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Consonant combinations */}
      {theory.consonant_combinations && (
        <>
          <SubTitle>Συνδυασμοί συμφώνων</SubTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {theory.consonant_combinations.map((cc: any, i: number) => (
              <div
                key={i}
                className="bg-white border border-warm-200 rounded-lg p-4"
              >
                <span className="vlach-text text-lg font-semibold">
                  {cc.combination}
                </span>
                <span className="text-warm-500 mx-2">=</span>
                <span className="text-warm-700">{cc.pronunciation}</span>
                <div className="text-sm text-warm-500 mt-1 vlach-text">
                  {cc.example}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Vowels */}
      {theory.vowels && (
        <>
          <SubTitle>Φωνήεντα</SubTitle>
          {theory.vowels.simple_vowels && (
            <div className="grid gap-2 sm:grid-cols-3 mb-4">
              {theory.vowels.simple_vowels.map((v: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-3 text-center"
                >
                  <span className="vlach-text text-2xl">{v.symbol}</span>
                  <p className="text-xs text-warm-600 mt-1">{v.description}</p>
                </div>
              ))}
            </div>
          )}
          {theory.vowels.diphthongs && (
            <>
              <SubTitle>Δίφθογγοι</SubTitle>
              <div className="grid gap-2 sm:grid-cols-2">
                {theory.vowels.diphthongs.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-warm-200 rounded-lg p-3"
                  >
                    <span className="vlach-text text-lg font-semibold">
                      {d.symbol}
                    </span>
                    {d.pronounced_as && (
                      <span className="text-warm-500 text-sm ml-2">
                        → {d.pronounced_as}
                      </span>
                    )}
                    {d.note && (
                      <p className="text-xs text-warm-500 mt-1">{d.note}</p>
                    )}
                    {d.examples && (
                      <p className="text-sm vlach-text mt-1">
                        {d.examples.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {theory.vowels.notes && theory.vowels.notes.length > 0 && (
            <NoteBox>
              <ul className="list-disc pl-4 space-y-1">
                {theory.vowels.notes.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </NoteBox>
          )}
        </>
      )}

      {/* Comparison pairs */}
      {theory.comparison_pairs && (
        <>
          <SubTitle>Αντιπαραθέσεις</SubTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {theory.comparison_pairs.map((cp: any, i: number) => (
              <div
                key={i}
                className="bg-white border border-warm-200 rounded-lg p-3 flex items-center gap-4"
              >
                <span className="vlach-text">{cp.left}</span>
                <span className="text-warm-300">↔</span>
                <span className="vlach-text">{cp.right}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Guided practice */}
      {theory.guided_practice_word_groups && (
        <>
          <SubTitle>Εξάσκηση</SubTitle>
          {theory.guided_practice_word_groups.map(
            (group: any[], gi: number) => (
              <div key={gi} className="mb-4">
                {group.map((g: any, j: number) => (
                  <div key={j} className="mb-3">
                    {g.header && (
                      <p className="text-sm font-medium text-warm-600 mb-1">
                        {g.header}
                      </p>
                    )}
                    {g.words && (
                      <div className="flex flex-wrap gap-2">
                        {g.words.map((w: string, k: number) => (
                          <span
                            key={k}
                            className="vlach-text bg-warm-100 px-3 py-1 rounded-lg text-sm"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

// ─── Unit 2: Cunushteare ────────────────────────────────────

function CunushteareTheory({ theory }: { theory: any }) {
  return (
    <div className="space-y-6">
      {/* Overview phrases */}
      {theory.overview_phrases && (
        <>
          <SectionTitle>Βασικές εκφράσεις</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {theory.overview_phrases.map((p: any, i: number) => (
              <div
                key={i}
                className="bg-white border border-warm-200 rounded-lg p-4"
              >
                <VlachBlock vlach={p.vlach} greek={p.greek} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Personal pronouns */}
      {theory.personal_pronouns && (
        <>
          <SectionTitle>Προσωπικές αντωνυμίες</SectionTitle>
          {theory.personal_pronouns.note && (
            <NoteBox>{theory.personal_pronouns.note}</NoteBox>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-warm-100 text-warm-700">
                  <th className="px-4 py-2 text-left font-medium">
                    Ελληνικά
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Μορφή 1
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Μορφή 2
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Μορφή 3
                  </th>
                </tr>
              </thead>
              <tbody>
                {theory.personal_pronouns.items?.map((p: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-warm-100 hover:bg-warm-50"
                  >
                    <td className="px-4 py-2 font-medium">
                      {p.greek_person}
                    </td>
                    {p.variant_forms?.map((f: string, j: number) => (
                      <td key={j} className="px-4 py-2 vlach-text">
                        {f}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Verb "to be" */}
      {theory.verb_to_be && (
        <>
          <SectionTitle>{theory.verb_to_be.title || "Ρήμα «είμαι»"}</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-warm-100 text-warm-700">
                  <th className="px-4 py-2 text-left font-medium">
                    Πρόσωπο
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Τύπος 1
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Τύπος 2
                  </th>
                </tr>
              </thead>
              <tbody>
                {theory.verb_to_be.items?.map((v: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-warm-100 hover:bg-warm-50"
                  >
                    <td className="px-4 py-2 font-medium">
                      {v.greek_person}
                    </td>
                    <td className="px-4 py-2 vlach-text">{v.form_set_1}</td>
                    <td className="px-4 py-2 vlach-text">{v.form_set_2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dialogues */}
      {theory.dialogues && theory.dialogues.length > 0 && (
        <>
          <SectionTitle>Διάλογοι</SectionTitle>
          {theory.dialogues.map((d: any) => (
            <div
              key={d.id}
              className="bg-white border border-warm-200 rounded-lg p-5 mb-4"
            >
              <h4 className="font-semibold text-warm-700 mb-3">{d.title}</h4>
              <div className="space-y-2">
                {d.lines?.map((line: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-warm-400 font-medium text-sm min-w-[24px]">
                      {line.speaker}:
                    </span>
                    <span className="vlach-text">{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Lesson 2.2 greetings */}
      {theory.lesson_2_2 && (
        <>
          <SectionTitle>
            {theory.lesson_2_2.title || "Χαιρετισμοί και γνωριμία"}
          </SectionTitle>
          {renderPhraseList("Χαιρετισμοί", theory.lesson_2_2.greetings)}
          {renderPhraseList("Ρωτάω πώς είσαι", theory.lesson_2_2.ask_how_are_you)}
          {renderPhraseList("Απαντάω πώς είμαι", theory.lesson_2_2.answers_how_are_you)}
          {renderPhraseList("Ρωτάω το όνομα", theory.lesson_2_2.ask_name)}
          {renderPhraseList("Απαντάω το όνομα", theory.lesson_2_2.answers_name)}
          {renderPhraseList("Ρωτάω καταγωγή", theory.lesson_2_2.ask_origin)}
          {renderPhraseList("Απαντάω καταγωγή", theory.lesson_2_2.answers_origin)}
        </>
      )}

      {/* Verbs */}
      {theory.verbs && (
        <>
          <SectionTitle>Ρήματα</SectionTitle>
          {Object.entries(theory.verbs).map(([key, arr]: [string, any]) => (
            <div key={key} className="mb-4">
              <SubTitle>{key.replace(/_/g, " ")}</SubTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {arr?.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-warm-100">
                        <td className="px-4 py-2 font-medium">
                          {row.greek_person || row.person}
                        </td>
                        <td className="px-4 py-2 vlach-text">{row.form}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Notes on ci/iu */}
      {theory.notes_on_ci_iu && (
        <>
          <SectionTitle>Σημειώσεις: ci, iu</SectionTitle>
          {theory.notes_on_ci_iu.ci_meanings && (
            <NoteBox>
              <p className="font-medium mb-1">ci:</p>
              <ul className="list-disc pl-4 space-y-1">
                {theory.notes_on_ci_iu.ci_meanings.map(
                  (m: any, i: number) => (
                    <li key={i}>
                      {typeof m === "string" ? m : (
                        <>
                          <span className="vlach-text">{m.vlach}</span>
                          {m.greek && <span className="greek-text ml-2">— {m.greek}</span>}
                        </>
                      )}
                    </li>
                  )
                )}
              </ul>
            </NoteBox>
          )}
          {renderPhraseList("Παραδείγματα ci", theory.notes_on_ci_iu.examples)}
          {renderPhraseList("Παραδείγματα iu", theory.notes_on_ci_iu.iu_examples)}
        </>
      )}

      {/* Oral practice */}
      {theory.oral_practice && (
        <>
          <SectionTitle>Προφορική εξάσκηση</SectionTitle>
          <div className="space-y-2">
            {theory.oral_practice.map((item: any, i: number) => (
              <div
                key={i}
                className="bg-warm-100 rounded-lg p-3 text-sm text-warm-700"
              >
                {item.number && (
                  <span className="font-medium mr-2">{item.number}.</span>
                )}
                {item.prompt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function renderPhraseList(title: string, items: any[] | undefined) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <SubTitle>{title}</SubTitle>
      <div className="space-y-1">
        {items.map((item: any, i: number) => (
          <VlachBlock
            key={i}
            vlach={typeof item === "string" ? item : item.vlach || item.text || ""}
            greek={typeof item === "string" ? "" : item.greek || item.translation || ""}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Unit 3: Definite article ───────────────────────────────

function DefiniteArticleTheory({ theory }: { theory: any }) {
  const sections = theory.sections || [];
  return (
    <div className="space-y-6">
      {theory.intro_title && <SectionTitle>{theory.intro_title}</SectionTitle>}

      {sections.map((sec: any) => (
        <div key={sec.id || sec.title}>
          <SubTitle>
            {sec.id && `${sec.id}. `}
            {sec.title}
          </SubTitle>

          {/* Observations */}
          {sec.observations && (
            <NoteBox>
              <ul className="list-disc pl-4 space-y-1">
                {sec.observations.map((obs: string, i: number) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </NoteBox>
          )}

          {/* Paradigm table */}
          {sec.tables?.paradigm_examples && (
            <div className="overflow-x-auto mt-4">
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
                  {sec.tables.paradigm_examples.map((row: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      <td className="px-3 py-2 vlach-text">
                        {row.singular_indefinite}
                      </td>
                      <td className="px-3 py-2 vlach-text font-medium">
                        {row.singular_definite}
                      </td>
                      <td className="px-3 py-2 vlach-text">
                        {row.plural_indefinite}
                      </td>
                      <td className="px-3 py-2 vlach-text font-medium">
                        {row.plural_definite}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pattern rules */}
          {sec.tables?.singular_patterns && (
            <div className="mt-4">
              <p className="text-sm font-medium text-warm-600 mb-2">
                Κανόνες ενικού
              </p>
              <div className="grid gap-2">
                {sec.tables.singular_patterns.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-warm-200 rounded-lg p-3 text-sm"
                  >
                    <span className="font-medium text-warm-700">
                      {p.gender}:
                    </span>{" "}
                    {p.rule}
                    <span className="vlach-text ml-2">{p.example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sec.tables?.plural_patterns && (
            <div className="mt-4">
              <p className="text-sm font-medium text-warm-600 mb-2">
                Κανόνες πληθυντικού
              </p>
              <div className="grid gap-2">
                {sec.tables.plural_patterns.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-warm-200 rounded-lg p-3 text-sm"
                  >
                    <span className="font-medium text-warm-700">
                      {p.gender}:
                    </span>{" "}
                    {p.rule}
                    <span className="vlach-text ml-2">{p.example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conjugation table */}
          {sec.conjugation_table && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {sec.conjugation_table.map((row: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-warm-100 hover:bg-warm-50"
                    >
                      {Object.entries(row).map(([k, v]) => (
                        <td
                          key={k}
                          className={`px-3 py-2 ${
                            k.includes("greek") || k.includes("person")
                              ? "font-medium"
                              : "vlach-text"
                          }`}
                        >
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Song with YouTube embed */}
          {sec.type === "song_translation" && (
            <div className="bg-warm-100 rounded-lg p-5 mt-4">
              <p className="text-sm text-warm-600 mb-3">{sec.prompt}</p>
              {/* YouTube embed */}
              {sec.resource_url && sec.resource_url.includes("youtube.com") && (
                <div className="aspect-video w-full max-w-xl mx-auto mb-4 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${sec.resource_url.split("v=")[1]?.split("&")[0]}`}
                    title={sec.title || "Τραγούδι"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
              {sec.lyrics && (
                <div className="vlach-text whitespace-pre-line text-sm leading-relaxed">
                  {Array.isArray(sec.lyrics)
                    ? sec.lyrics.join("\n")
                    : sec.lyrics}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Unit 4: Indefinite article ─────────────────────────────

function IndefiniteArticleTheory({ theory }: { theory: any }) {
  const sections = theory.sections || [];
  return (
    <div className="space-y-6">
      {theory.source_basis && (
        <NoteBox>Βάση: {theory.source_basis}</NoteBox>
      )}

      {sections.map((sec: any) => (
        <div key={sec.id || sec.title}>
          <SubTitle>
            {sec.id && `${sec.id}. `}
            {sec.title}
          </SubTitle>

          {sec.summary_gr && (
            <p className="text-sm text-warm-600 mb-3">{sec.summary_gr}</p>
          )}

          {/* Article forms */}
          {sec.article_forms_seen && (
            <div className="grid gap-2 sm:grid-cols-2 mb-4">
              {sec.article_forms_seen.map((af: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-4"
                >
                  <span className="vlach-text text-lg font-semibold">
                    {af.form}
                  </span>
                  <p className="text-sm text-warm-600 mt-1">
                    {af.usage_note_gr}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Noun table */}
          {sec.rows && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-warm-100 text-warm-700">
                    {(sec.table_columns || ["Ουσιαστικό", "Οριστικό", "Αόριστο"]).map(
                      (col: string, i: number) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left font-medium"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sec.rows.map((row: any, i: number) => (
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
                      <td className="px-3 py-2 vlach-text">
                        {row.indefinite}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Preposition forms */}
          {sec.forms_seen && (
            <div className="grid gap-2 sm:grid-cols-2">
              {sec.forms_seen.map((f: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-3 text-sm"
                >
                  <span className="vlach-text font-medium">{f.form || f.pattern}</span>
                  <p className="text-warm-600 mt-1">
                    {f.usage_note_gr || f.usage_note || f.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Unit 6: Numbers and Time ───────────────────────────────

function NumbersTimeTheory({ theory }: { theory: any }) {
  const sections = theory.sections || [];
  return (
    <div className="space-y-6">
      {theory.intro_title && <SectionTitle>{theory.intro_title}</SectionTitle>}

      {sections.map((sec: any) => (
        <div key={sec.section_id || sec.title}>
          <SubTitle>
            {sec.section_id && `${sec.section_id}. `}
            {sec.title}
            {sec.title_gr && ` — ${sec.title_gr}`}
          </SubTitle>

          {sec.teaching_goal && (
            <p className="text-sm text-warm-500 mb-3 italic">
              {sec.teaching_goal}
            </p>
          )}

          {sec.notes && (
            <NoteBox>
              <ul className="list-disc pl-4 space-y-1">
                {sec.notes.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </NoteBox>
          )}

          {/* Numbers */}
          {sec.content?.numbers_0_29 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
              {sec.content.numbers_0_29.map((n: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-3 text-center"
                >
                  <span className="text-lg font-bold text-warm-800">
                    {n.number}
                  </span>
                  <p className="vlach-text text-sm mt-1">{n.vlach}</p>
                </div>
              ))}
            </div>
          )}

          {sec.content?.tens_hundreds_and_large && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {sec.content.tens_hundreds_and_large.map((n: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-3 text-center"
                >
                  <span className="text-lg font-bold text-warm-800">
                    {n.number}
                  </span>
                  <p className="vlach-text text-sm mt-1">{n.vlach}</p>
                </div>
              ))}
            </div>
          )}

          {/* Phrases */}
          {sec.content?.phrases && (
            <div className="space-y-2 mb-4">
              {sec.content.phrases.map((p: any, i: number) => (
                <VlachBlock key={i} vlach={p.vlach} greek={p.greek} />
              ))}
            </div>
          )}

          {/* Distinctions */}
          {sec.content?.distinctions && (
            <div className="space-y-2 mb-4">
              {sec.content.distinctions.map((d: any, i: number) => (
                <VlachBlock key={i} vlach={d.vlach} greek={d.greek} />
              ))}
            </div>
          )}

          {/* Demonstratives */}
          {sec.content?.demonstratives && (
            <div className="space-y-2 mb-4">
              {sec.content.demonstratives.map((d: any, i: number) => (
                <VlachBlock key={i} vlach={d.vlach} greek={d.greek} />
              ))}
            </div>
          )}

          {/* Question patterns */}
          {sec.content?.question_patterns && (
            <div className="space-y-2 mb-4">
              {sec.content.question_patterns.map((q: any, i: number) => (
                <VlachBlock key={i} vlach={q.vlach} greek={q.greek} />
              ))}
            </div>
          )}

          {/* Quantifier notes */}
          {sec.content?.quantifier_notes && (
            <div className="space-y-2 mb-4">
              {sec.content.quantifier_notes.map((q: any, i: number) => (
                <VlachBlock key={i} vlach={q.vlach} greek={q.greek} />
              ))}
            </div>
          )}

          {/* Season/month blocks */}
          {sec.content?.season_month_blocks && (
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              {sec.content.season_month_blocks.map((block: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-4"
                >
                  <h5 className="vlach-text font-semibold text-base mb-2">
                    {block.season}
                  </h5>
                  <ul className="space-y-1">
                    {block.months?.map((m: string, j: number) => (
                      <li key={j} className="vlach-text text-sm">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Days of week */}
          {sec.content?.days_of_week && (
            <div className="grid gap-2 sm:grid-cols-2 mb-4">
              {sec.content.days_of_week.map((d: any, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-warm-200 rounded-lg p-3"
                >
                  <VlachBlock vlach={d.vlach} greek={d.greek} />
                </div>
              ))}
            </div>
          )}

          {/* Footnotes */}
          {(sec.content?.footnotes || sec.footnotes) && (
            <div className="text-xs text-warm-400 mt-3 space-y-1">
              {(sec.content?.footnotes || sec.footnotes)?.map(
                (fn: any, i: number) => (
                  <p key={i}>
                    {fn.id && <sup>{fn.id}</sup>} {fn.text || fn}
                  </p>
                )
              )}
            </div>
          )}

          {/* Question prompts */}
          {sec.content?.question_prompts && (
            <div className="mt-3 space-y-1">
              {sec.content.question_prompts.map((q: string, i: number) => (
                <p key={i} className="text-sm text-warm-600 italic">
                  {q}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main dispatcher ────────────────────────────────────────

export default function TheoryRenderer({ theory, unitNumber }: Props) {
  switch (unitNumber) {
    case 1:
      return <AlphabetTheory theory={theory} />;
    case 2:
      return <CunushteareTheory theory={theory} />;
    case 3:
      return <DefiniteArticleTheory theory={theory} />;
    case 4:
      return <IndefiniteArticleTheory theory={theory} />;
    case 6:
      return <NumbersTimeTheory theory={theory} />;
    default:
      return (
        <div className="text-warm-500 text-center py-12">
          Η θεωρία αυτής της ενότητας δεν είναι ακόμα διαθέσιμη.
        </div>
      );
  }
}
