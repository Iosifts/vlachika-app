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

-- ═══════════════════════════════════════════════════════════════
-- 8. Public Feedback / Σχόλια
-- ═══════════════════════════════════════════════════════════════
-- Run this block in SQL Editor to add the feedback feature.
-- Stores only: text, status, created_at. No name/email/IP/UA.

CREATE TABLE IF NOT EXISTS feedback (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  text       text        NOT NULL CHECK (length(text) BETWEEN 1 AND 1200),
  status     text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'approved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status_created
  ON feedback (status, created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anon may INSERT only with status = 'pending'
DROP POLICY IF EXISTS "anon insert pending feedback" ON feedback;
CREATE POLICY "anon insert pending feedback"
  ON feedback FOR INSERT TO anon
  WITH CHECK (status = 'pending');

-- Anon may SELECT only approved rows
DROP POLICY IF EXISTS "anon read approved feedback" ON feedback;
CREATE POLICY "anon read approved feedback"
  ON feedback FOR SELECT TO anon
  USING (status = 'approved');

-- No UPDATE/DELETE policies for anon — denied by default.
-- Server (service_role) bypasses RLS for moderation actions.

-- ═══════════════════════════════════════════════════════════════
-- 9. Lesson overrides (cloud-published lesson edits)
-- ═══════════════════════════════════════════════════════════════
-- Each row overrides a static module JSON with an admin-edited copy.
-- Public users can READ overrides (they need them to render the lesson);
-- only the server (service_role) can WRITE them.

CREATE TABLE IF NOT EXISTS lesson_overrides (
  module_id   text        PRIMARY KEY,
  module_data jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lesson_overrides ENABLE ROW LEVEL SECURITY;

-- Public read so the live site can fetch the override on each request.
DROP POLICY IF EXISTS "anon read lesson overrides" ON lesson_overrides;
CREATE POLICY "anon read lesson overrides"
  ON lesson_overrides FOR SELECT TO anon
  USING (true);

-- No anon insert/update/delete — only service_role (via /api/admin/lessons).

-- Keep updated_at fresh on any change.
DROP TRIGGER IF EXISTS trg_lesson_overrides_updated ON lesson_overrides;
CREATE TRIGGER trg_lesson_overrides_updated
  BEFORE UPDATE ON lesson_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 10. Speaker PII lockdown (GDPR)
-- ═══════════════════════════════════════════════════════════════
-- Earlier policies left these tables wide open to the anon key.
-- Speaker name + age + place + voice recording is personal data:
-- it must NOT be readable or writable by the public.
-- After this block, only the service_role key (server-side, via the
-- admin API) can access these tables.

DROP POLICY IF EXISTS "Allow all for speaker_registrations" ON speaker_registrations;
DROP POLICY IF EXISTS "Allow all for registration_phrases"  ON registration_phrases;
DROP POLICY IF EXISTS "Allow all for registration_audio"    ON registration_audio;

-- (RLS is already enabled on all three. With no anon policies, anon is
--  blocked from SELECT/INSERT/UPDATE/DELETE. service_role bypasses RLS.)

-- Audio storage bucket lockdown.
-- If you previously enabled public read/insert/delete policies on the
-- 'audio' bucket from section 7, also drop those:
DROP POLICY IF EXISTS "Allow public read for audio"   ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload for audio"   ON storage.objects;
DROP POLICY IF EXISTS "Allow anon delete for audio"   ON storage.objects;

-- IMPORTANT (manual step): in Supabase Dashboard → Storage → audio bucket
-- → Configuration, switch "Public bucket" OFF. The bucket must be private
-- so recordings can't be fetched by anyone who guesses the URL.
-- The admin app will need to use signed URLs (next iteration) to play back.
