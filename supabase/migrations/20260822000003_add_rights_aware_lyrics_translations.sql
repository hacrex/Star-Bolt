/*
  # Add rights-aware lyrics metadata and translations

  This migration is additive. Existing `language` and `content` columns remain
  as compatibility fields while the new metadata supports the light architecture.

  Public lyric/translation reads require explicit display authorization, an
  approved publication status, and an allowed rights status. Existing records
  default to hidden until their rights metadata is reviewed.
*/

-- Song-level catalog and rights metadata.
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS language_code text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS lyrics_status text NOT NULL DEFAULT 'not_available',
  ADD COLUMN IF NOT EXISTS rights_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS rights_holder text,
  ADD COLUMN IF NOT EXISTS license_reference text,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.songs
SET language_code = language
WHERE language IS NOT NULL AND (language_code IS NULL OR language_code = 'en');

CREATE INDEX IF NOT EXISTS songs_language_code_idx ON public.songs(language_code);
CREATE INDEX IF NOT EXISTS songs_rights_status_idx ON public.songs(rights_status);
CREATE INDEX IF NOT EXISTS songs_lyrics_status_idx ON public.songs(lyrics_status);

-- Lyric-level source, rights, and moderation metadata.
ALTER TABLE public.lyrics
  ADD COLUMN IF NOT EXISTS language_code text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS rights_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS rights_holder text,
  ADD COLUMN IF NOT EXISTS license_reference text,
  ADD COLUMN IF NOT EXISTS allowed_display boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allowed_translation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allowed_synchronization boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS lyrics_language_code_idx ON public.lyrics(language_code);
CREATE INDEX IF NOT EXISTS lyrics_public_status_idx ON public.lyrics(status, rights_status, allowed_display);

-- Translations remain separate because each target language has its own
-- contributor, rights review, publication status, and verification state.
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lyrics_id uuid NOT NULL REFERENCES public.lyrics(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  translated_text text NOT NULL,
  submitted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  rights_status text NOT NULL DEFAULT 'unknown',
  rights_holder text,
  license_reference text,
  allowed_display boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT translations_language_code_not_empty CHECK (length(trim(language_code)) > 0),
  CONSTRAINT translations_status_valid CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes', 'verified')),
  CONSTRAINT translations_rights_status_valid CHECK (rights_status IN ('unknown', 'owned', 'licensed', 'authorized', 'public_domain', 'pending_review', 'restricted')),
  UNIQUE (lyrics_id, language_code)
);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view authorized translations" ON public.translations;
CREATE POLICY "Public can view authorized translations"
  ON public.translations FOR SELECT
  USING (
    allowed_display = true
    AND status IN ('approved', 'verified')
    AND rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
  );

DROP POLICY IF EXISTS "Users can view own pending translations" ON public.translations;
CREATE POLICY "Users can view own pending translations"
  ON public.translations FOR SELECT
  USING (auth.uid() = submitted_by AND status = 'pending');

DROP POLICY IF EXISTS "Users can submit pending translations" ON public.translations;
CREATE POLICY "Users can submit pending translations"
  ON public.translations FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'pending'
    AND verified = false
    AND allowed_display = false
  );

DROP POLICY IF EXISTS "Users can edit own pending translations" ON public.translations;
CREATE POLICY "Users can edit own pending translations"
  ON public.translations FOR UPDATE
  USING (auth.uid() = submitted_by AND status = 'pending')
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'pending'
    AND verified = false
    AND allowed_display = false
  );

DROP POLICY IF EXISTS "Users can delete own pending translations" ON public.translations;
CREATE POLICY "Users can delete own pending translations"
  ON public.translations FOR DELETE
  USING (auth.uid() = submitted_by AND status = 'pending');

-- Replace the legacy broad lyric-read policy with an explicit rights gate.
DROP POLICY IF EXISTS "Lyrics are viewable by everyone" ON public.lyrics;
DROP POLICY IF EXISTS "Public can view authorized lyrics" ON public.lyrics;
CREATE POLICY "Public can view authorized lyrics"
  ON public.lyrics FOR SELECT
  USING (
    allowed_display = true
    AND status IN ('approved', 'verified')
    AND rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
  );

DROP POLICY IF EXISTS "Authenticated users can insert lyrics" ON public.lyrics;
DROP POLICY IF EXISTS "Users can view own pending lyrics" ON public.lyrics;
CREATE POLICY "Users can view own pending lyrics"
  ON public.lyrics FOR SELECT
  USING (auth.uid() = created_by AND status = 'pending');

CREATE POLICY "Authenticated users can submit pending lyrics"
  ON public.lyrics FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND status = 'pending'
    AND verified = false
    AND allowed_display = false
  );

DROP POLICY IF EXISTS "Users can update own pending lyrics" ON public.lyrics;
CREATE POLICY "Users can update own pending lyrics"
  ON public.lyrics FOR UPDATE
  USING (auth.uid() = created_by AND status = 'pending')
  WITH CHECK (
    auth.uid() = created_by
    AND status = 'pending'
    AND verified = false
    AND allowed_display = false
  );

DROP POLICY IF EXISTS "Users can delete own pending lyrics" ON public.lyrics;
CREATE POLICY "Users can delete own pending lyrics"
  ON public.lyrics FOR DELETE
  USING (auth.uid() = created_by AND status = 'pending');

-- Future moderator/admin policies must be added through server-side role checks.
-- No client policy may allow a user to self-approve or self-verify content.
