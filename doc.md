# Canonical Module JSON For The App

This project now has two content paths:

1. `src/data/legacy/*.json`
   Old lesson files. These still go through `legacy-adapter.ts` and keep their lesson-specific structure.
2. `src/data/modules/*.json`
   New native modules. This is the canonical format you should target from now on.

For all future authoring and for your LLM pipeline, use only the native module format described below.

The app auto-loads every `*.json` file inside `src/data/modules/`.
If a section is not present, it is not shown.
If a section exists but has no usable items, the renderer shows an empty-state message.

## 1. Top-Level Module Shape

Required fields:

```json
{
  "id": "string",
  "type": "lesson | exercise_set | documentation_project | fieldwork_task | archive | vocabulary_bank | grammar_focus | coming_soon",
  "status": "published | draft | partial | coming_soon | archived",
  "title": "string",
  "description": "string",
  "audience": "learner | contributor | researcher | all",
  "order": 1,
  "accentColor": "rose | olive | sky | terra | warm",
  "sections": []
}
```

Optional top-level fields:

```json
{
  "subtitle": "string",
  "tags": ["string"],
  "lastUpdated": "YYYY-MM-DD",
  "meta": {
    "source": "optional metadata",
    "replacesLegacyUnitNumber": 4
  }
}
```

If a native module replaces one lesson from `src/data/legacy/`, add:

```json
"meta": {
  "replacesLegacyUnitNumber": 4
}
```

The loader will then skip the old legacy lesson automatically.

If the native module `id` is exactly `lesson-4`, `lesson-3`, and so on, the loader also treats it as a legacy replacement.

## 2. Section Envelope

Every section inside `sections` must follow this envelope:

```json
{
  "id": "string",
  "type": "theory | vocabulary | exercises | flashcards | quiz | examples | instructions | phrase_collection | audio_upload | metadata_form | notes | registration_archive | links | resources | review_status",
  "title": "string",
  "description": "optional string",
  "order": 0,
  "data": {}
}
```

The app requires `id`, `type`, `title`, `order`, and `data` for every section.

## 3. Supported Section Data Shapes

### `theory`

Use this for structured explanatory content. This is the main replacement for the old unit-specific theory JSON.

```json
{
  "content": {
    "intro": "optional intro paragraph",
    "paragraphs": ["optional plain paragraphs"],
    "bulletPoints": ["optional key points"],
    "examples": [
      {
        "title": "optional label",
        "vlach": "example in Vlach",
        "greek": "Greek translation"
      }
    ],
    "blocks": [
      {
        "type": "heading",
        "title": "Section title"
      },
      {
        "type": "paragraph",
        "text": "Explanatory text"
      },
      {
        "type": "callout",
        "title": "Tip",
        "text": "Important note",
        "tone": "info"
      },
      {
        "type": "bullet_list",
        "title": "Remember",
        "items": ["item 1", "item 2"]
      },
      {
        "type": "numbered_list",
        "title": "Procedure",
        "items": ["step 1", "step 2"]
      },
      {
        "type": "example_pair",
        "title": "Example",
        "vlach": "Vlach sentence",
        "greek": "Greek translation"
      },
      {
        "type": "table",
        "title": "Forms",
        "columns": ["Column A", "Column B"],
        "rows": [
          {
            "Column A": "value",
            "Column B": "value"
          }
        ]
      },
      {
        "type": "dialogue",
        "title": "Dialogue",
        "lines": [
          {
            "speaker": "A",
            "text": "Vlach line",
            "greek": "Greek translation"
          }
        ]
      },
      {
        "type": "youtube",
        "title": "Video",
        "url": "https://www.youtube.com/watch?v=...",
        "caption": "optional caption"
      },
      {
        "type": "quote",
        "text": "Quoted text"
      }
    ]
  }
}
```

Allowed `tone` values for callouts:

```json
"info" | "warning" | "success" | "neutral"
```

### `vocabulary`

```json
{
  "sections": [
    {
      "title": "Βασικό λεξιλόγιο",
      "items": [
        {
          "vlach": "casâ",
          "greek": "σπίτι",
          "definite": "casa",
          "indefinite": "unâ casâ"
        }
      ]
    }
  ]
}
```

`definite` and `indefinite` are optional.

### `exercises`

```json
{
  "unitNumber": 0,
  "exercises": []
}
```

`unitNumber` is optional for native content and may stay `0`.

Supported `exercise.type` values and the shapes the app currently renders:

#### `fill_in_the_blank`

```json
{
  "id": "ex-1",
  "type": "fill_in_the_blank",
  "title": "Συμπλήρωσε",
  "instruction": "Συμπλήρωσε το κενό.",
  "items": [
    {
      "number": 1,
      "prompt": "Eu ____ acasâ.",
      "answer": "hiu"
    }
  ]
}
```

The same renderer also works for:

```json
"fill_from_word_bank" | "fill_in_article" | "fill_in_article_and_preposition" | "fill_in_connector" | "add_definite_article" | "sentence_transformation"
```

It accepts `official_answer`, `solved_text`, `answers`, or `answer` as the solution source.

#### `fill_in_letters`

```json
{
  "id": "ex-2",
  "type": "fill_in_letters",
  "instructions": "Διάλεξε το σωστό γράμμα.",
  "groups": [
    {
      "letter_choice": "a / ă",
      "items": [
        {
          "number": 1,
          "text": "c_sâ"
        }
      ]
    }
  ],
  "answers": [
    {
      "items": [
        {
          "text": "casâ"
        }
      ]
    }
  ]
}
```

#### `fill_in_verb_form`

```json
{
  "id": "ex-3",
  "type": "fill_in_verb_form",
  "instruction": "Συμπλήρωσε τον σωστό τύπο.",
  "items": [
    {
      "number": 1,
      "prompt": "Eu ____ profesor.",
      "answer_with_filled_form": "hiu"
    }
  ]
}
```

#### `open_production`

```json
{
  "id": "ex-4",
  "type": "open_production",
  "title": "Παραγωγή λόγου",
  "content": {
    "prompt": "Γράψε προτάσεις με το νέο λεξιλόγιο.",
    "answer_count_requested": 3,
    "official_answers": ["answer 1", "answer 2"]
  }
}
```

#### `translation_dialogue`

```json
{
  "id": "ex-5",
  "type": "translation_dialogue",
  "items": [
    {
      "number": 1,
      "prompt": "Καλημέρα",
      "official_answer": "Bunã dzua"
    }
  ]
}
```

#### `categorization`

```json
{
  "id": "ex-6",
  "type": "categorization",
  "word_bank": ["omu", "fumealâ"],
  "categories": [
    {
      "name": "Αρσενικά",
      "items": ["omu"]
    }
  ]
}
```

#### `matching_translation`

```json
{
  "id": "ex-7",
  "type": "matching_translation",
  "left_items": ["omu", "casâ"],
  "right_items": ["σπίτι", "άνθρωπος"],
  "solution_map": {
    "1": "2",
    "2": "1"
  }
}
```

#### `matching_sentences`

```json
{
  "id": "ex-8",
  "type": "matching_sentences",
  "left_items": ["Eu hiu...", "Tu eşti..."],
  "right_items": ["δάσκαλος", "μαθητής"],
  "solution_map_inferred": {
    "1": "a",
    "2": "b"
  }
}
```

#### `song_translation`

```json
{
  "id": "ex-9",
  "type": "song_translation",
  "items": [
    {
      "number": 1,
      "source_line": "Vlach lyric",
      "official_translation": "Greek translation"
    }
  ]
}
```

#### `article_table_completion`

```json
{
  "id": "ex-10",
  "type": "article_table_completion",
  "items": [
    {
      "noun": "omu",
      "definite": "omlu",
      "indefinite": "unu omu"
    }
  ]
}
```

#### `grammar_table`

```json
{
  "id": "ex-11",
  "type": "grammar_table",
  "table_columns": ["μορφή", "χρήση"],
  "rows": [
    {
      "μορφή": "di",
      "χρήση": "γενική έννοια"
    }
  ]
}
```

#### `worked_examples_only`

```json
{
  "id": "ex-12",
  "type": "worked_examples_only",
  "items": [
    {
      "number": 1,
      "solved_text": "Unu worked example"
    }
  ]
}
```

#### `verb_collection`

```json
{
  "id": "ex-13",
  "type": "verb_collection",
  "items": [
    {
      "verb": "cântu"
    }
  ]
}
```

#### `number_to_words` and `words_to_number`

```json
{
  "id": "ex-14",
  "type": "number_to_words",
  "items": [
    {
      "prompt": "12",
      "answer": "doispredzãci",
      "confidence": "uncertain"
    }
  ]
}
```

#### `clock_image`

```json
{
  "id": "ex-15",
  "type": "clock_image",
  "instruction": "Δες την ώρα και γράψε την απάντηση.",
  "items": [
    {
      "label": "Η ώρα",
      "answer": "Easti ora tri"
    }
  ]
}
```

### `flashcards`

```json
{
  "flashcards": [
    {
      "type": "vocabulary",
      "front": "omu",
      "back": "άνθρωπος"
    }
  ]
}
```

### `quiz`

The current quiz renderer generates quiz questions from flashcards and vocabulary.

```json
{
  "flashcards": [
    {
      "front": "omu",
      "back": "άνθρωπος"
    }
  ],
  "vocabulary": [
    {
      "title": "Βασικό λεξιλόγιο",
      "items": [
        {
          "vlach": "casâ",
          "greek": "σπίτι"
        }
      ]
    }
  ]
}
```

### `examples`

```json
{
  "examples": [
    {
      "title": "Σύντομο παράδειγμα",
      "vlach": "Bunã dzua",
      "greek": "Καλημέρα",
      "note": "optional note"
    }
  ]
}
```

### `instructions`

```json
{
  "heading": "Πώς να δουλέψεις την ενότητα",
  "steps": ["βήμα 1", "βήμα 2"],
  "note": "optional note"
}
```

### `links`

```json
{
  "heading": "Χρήσιμοι σύνδεσμοι",
  "items": [
    {
      "label": "Βίντεο προφοράς",
      "url": "https://www.youtube.com/watch?v=...",
      "description": "optional description",
      "kind": "youtube"
    }
  ]
}
```

Allowed `kind` values:

```json
"youtube" | "article" | "audio" | "download" | "external"
```

### `resources`

```json
{
  "heading": "Υλικό",
  "items": [
    {
      "title": "PDF φυλλάδιο",
      "description": "optional description",
      "url": "https://...",
      "type": "pdf",
      "metadata": "2 pages"
    }
  ]
}
```

Allowed `type` values:

```json
"pdf" | "worksheet" | "audio" | "video" | "reference" | "download"
```

### `review_status`

Useful for editorial or contributor-facing modules.

```json
{
  "heading": "Κατάσταση ελέγχου",
  "checklist": [
    {
      "label": "Θεωρία συμπληρωμένη",
      "done": true,
      "notes": "optional note"
    }
  ]
}
```

### `phrase_collection`

```json
{
  "suggestedPrompts": ["Πώς το λέμε αυτό;"],
  "fields": [
    {
      "name": "vlach",
      "label": "Φράση στα βλάχικα",
      "required": true
    },
    {
      "name": "greek",
      "label": "Μετάφραση στα ελληνικά"
    }
  ]
}
```

### `audio_upload`

```json
{
  "acceptedFormats": ["audio/mp3", "audio/wav"],
  "maxSizeMB": 50,
  "instructions": "Ανέβασε αρχεία εδώ."
}
```

### `metadata_form`

```json
{
  "fields": [
    {
      "name": "speakerName",
      "label": "Όνομα ομιλητή",
      "type": "text",
      "required": true
    }
  ]
}
```

### `notes`

```json
{
  "placeholder": "Γράψε σημειώσεις εδώ..."
}
```

### `registration_archive`

```json
{}
```

This section reads saved registrations and does not require content data.

## 4. Recommended Authoring Rules

Use these rules when generating native module JSON:

1. Omit sections that have no meaningful content.
2. Do not create empty arrays full of blank objects.
3. Prefer one `theory` section with rich `blocks` over many ad hoc custom keys.
4. Put YouTube videos either:
   - inside a `theory.content.blocks` item of type `youtube`, or
   - in a separate `links` section with `kind: "youtube"`.
5. Put downloadable/supporting files in `resources`.
6. Keep `vocabulary`, `flashcards`, and `quiz` separate.
7. Only use exercise types listed above.

## 5. Minimal Complete Example

```json
{
  "id": "lesson-7-food-and-family",
  "type": "lesson",
  "status": "published",
  "title": "Ενότητα 7",
  "subtitle": "Mâncari shi famelje",
  "description": "Λεξιλόγιο, θεωρία και ασκήσεις για οικογένεια και φαγητό.",
  "audience": "learner",
  "tags": ["οικογένεια", "φαγητό"],
  "order": 7,
  "accentColor": "olive",
  "lastUpdated": "2026-04-02",
  "sections": [
    {
      "id": "theory-7",
      "type": "theory",
      "title": "Θεωρία",
      "order": 0,
      "data": {
        "content": {
          "intro": "Σε αυτή την ενότητα βλέπουμε βασικούς τρόπους έκφρασης για την οικογένεια.",
          "blocks": [
            {
              "type": "heading",
              "title": "Βασικές χρήσεις"
            },
            {
              "type": "paragraph",
              "text": "Η νέα ενότητα εστιάζει σε οικείες καθημερινές λέξεις."
            },
            {
              "type": "example_pair",
              "title": "Παράδειγμα",
              "vlach": "Am un frate.",
              "greek": "Έχω έναν αδερφό."
            },
            {
              "type": "youtube",
              "title": "Βίντεο προφοράς",
              "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              "caption": "Σύντομη ακουστική υποστήριξη"
            }
          ]
        }
      }
    },
    {
      "id": "vocabulary-7",
      "type": "vocabulary",
      "title": "Λεξιλόγιο",
      "order": 1,
      "data": {
        "sections": [
          {
            "title": "Οικογένεια",
            "items": [
              {
                "vlach": "frate",
                "greek": "αδερφός"
              },
              {
                "vlach": "sorã",
                "greek": "αδερφή"
              }
            ]
          }
        ]
      }
    },
    {
      "id": "exercises-7",
      "type": "exercises",
      "title": "Ασκήσεις",
      "order": 2,
      "data": {
        "unitNumber": 0,
        "exercises": [
          {
            "id": "ex-7-1",
            "type": "fill_in_the_blank",
            "title": "Συμπλήρωσε",
            "instruction": "Συμπλήρωσε τη λέξη.",
            "items": [
              {
                "number": 1,
                "prompt": "El are o ____.",
                "answer": "sorã"
              }
            ]
          }
        ]
      }
    },
    {
      "id": "flashcards-7",
      "type": "flashcards",
      "title": "Κάρτες",
      "order": 3,
      "data": {
        "flashcards": [
          {
            "type": "vocabulary",
            "front": "frate",
            "back": "αδερφός"
          }
        ]
      }
    }
  ]
}
```

## 6. Prompt Template For Your External LLM

Use a prompt close to this:

```text
You convert raw lesson material into the canonical JSON format required by the Vlachika app.

Your output must be valid JSON only.
Do not wrap the JSON in markdown.
Do not add commentary.
Do not invent content that is not supported by the source.
If a content area is absent, omit the corresponding section entirely.
Never output empty sections with blank placeholder items.

Target schema:
- top-level module object with fields:
  id, type, status, title, subtitle?, description, audience, tags?, order, accentColor, lastUpdated?, sections, meta?
- each section must have:
  id, type, title, description?, order, data

Allowed section types:
- theory
- vocabulary
- exercises
- flashcards
- quiz
- examples
- instructions
- links
- resources
- review_status

For theory:
- use data.content
- prefer content.blocks for structured material
- allowed block types are:
  heading, paragraph, callout, bullet_list, numbered_list, example_pair, table, dialogue, youtube, quote

For vocabulary:
- use data.sections[].items[]
- each item may include vlach, greek, definite, indefinite

For exercises:
- only use these exercise types:
  fill_in_the_blank
  fill_from_word_bank
  fill_in_article
  fill_in_article_and_preposition
  fill_in_connector
  add_definite_article
  sentence_transformation
  fill_in_letters
  fill_in_verb_form
  open_production
  translation_dialogue
  categorization
  matching_translation
  matching_sentences
  song_translation
  article_table_completion
  grammar_table
  worked_examples_only
  verb_collection
  number_to_words
  words_to_number
  clock_image

Map the raw material to the richest meaningful structure possible:
- explanations -> theory blocks
- declension or grammar forms -> theory table blocks or grammar_table exercises
- dialogues -> theory dialogue blocks or translation_dialogue exercises depending on purpose
- vocabulary lists -> vocabulary section
- memorization items -> flashcards
- comprehension or production tasks -> exercises
- external videos/links -> links or theory youtube block
- worksheets/pdf/support files -> resources

Quality rules:
- preserve all meaningful content from the source
- keep ordering pedagogically sensible
- keep Greek and Vlach distinct
- keep translations aligned
- prefer explicit labels and titles
- use stable snake-case-like ids where useful
- return one single JSON object

Now convert the following raw material into canonical app JSON:

{{RAW_MATERIAL}}
```

## 7. Migration Strategy

Best long-term approach:

1. Keep old lessons working through `legacy-adapter.ts`.
2. Rebuild one lesson at a time as a native module in `src/data/modules/*.json`.
3. If the native module replaces an old lesson, set `meta.replacesLegacyUnitNumber`.
4. Feed your raw documents to an LLM using the prompt above.
5. Review the generated JSON.
6. Save the JSON as a native module file.
7. Let the app auto-load it and verify the rendered result.
8. Only after all lessons are migrated, delete the unused files from `src/data/legacy/`.

This is the stable path that removes the old theory-field drift and makes the app predictable.
