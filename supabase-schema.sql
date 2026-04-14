-- ═══════════════════════════════════════════════════════════════
-- Vlachika App — Supabase Schema
-- ═══════════════════════════════════════════════════════════════
--
-- Run this in Supabase Dashboard → SQL Editor (or via CLI).
-- Order matters: tables first, then RLS, then storage.
--

-- ─── 1. Speaker Registrations ──────────────────────────────────

CREATE TABLE speaker_registrations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id  text        NOT NULL,
  metadata   jsonb       NOT NULL DEFAULT '{}',
  notes      text        NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_module ON speaker_registrations (module_id);

-- ─── 2. Phrases (child of registration) ────────────────────────

CREATE TABLE registration_phrases (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid        NOT NULL REFERENCES speaker_registrations(id) ON DELETE CASCADE,
  vlach           text        NOT NULL,
  greek           text        NOT NULL DEFAULT '',
  context         text        NOT NULL DEFAULT '',
  notes           text        NOT NULL DEFAULT '',
  status          text        NOT NULL DEFAULT 'draft',
  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_phrases_registration ON registration_phrases (registration_id);

-- ─── 3. Audio Files (child of registration) ────────────────────

CREATE TABLE registration_audio (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid        NOT NULL REFERENCES speaker_registrations(id) ON DELETE CASCADE,
  file_name       text        NOT NULL,
  file_size       int         NOT NULL,
  mime_type       text        NOT NULL,
  storage_path    text        NOT NULL,
  added_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audio_registration ON registration_audio (registration_id);

-- ─── 4. Custom Modules (admin-created) ─────────────────────────

CREATE TABLE custom_modules (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_data jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 5. Auto-update updated_at trigger ─────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrations_updated
  BEFORE UPDATE ON speaker_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_custom_modules_updated
  BEFORE UPDATE ON custom_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 6. Row Level Security ─────────────────────────────────────
-- No auth for now — allow all operations via anon key.
-- When you add auth later, replace these with user-scoped policies.

ALTER TABLE speaker_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_phrases  ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_audio    ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_modules        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for speaker_registrations"
  ON speaker_registrations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for registration_phrases"
  ON registration_phrases FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for registration_audio"
  ON registration_audio FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for custom_modules"
  ON custom_modules FOR ALL USING (true) WITH CHECK (true);

-- ─── 7. Storage Bucket for Audio ───────────────────────────────
-- Run this separately in Supabase Dashboard → Storage → New Bucket
-- or uncomment below (requires service_role access):

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('audio', 'audio', true)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Allow public read for audio"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'audio');

-- CREATE POLICY "Allow anon upload for audio"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'audio');

-- CREATE POLICY "Allow anon delete for audio"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'audio');
