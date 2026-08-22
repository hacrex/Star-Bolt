/*
  # Add collaborative translation version history

  `translations` remains the canonical one-row-per-lyric/language record.
  `translation_versions` stores immutable contributor suggestions and review
  snapshots so a collaborator never overwrites an approved translation.
*/

CREATE TABLE IF NOT EXISTS public.translation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id uuid NOT NULL REFERENCES public.translations(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  translated_text text NOT NULL,
  submitted_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  rights_status text NOT NULL DEFAULT 'pending_review',
  rights_holder text,
  license_reference text,
  allowed_display boolean NOT NULL DEFAULT false,
  change_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT translation_versions_number_positive CHECK (version_number > 0),
  CONSTRAINT translation_versions_status_valid CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes', 'verified')),
  CONSTRAINT translation_versions_rights_status_valid CHECK (rights_status IN ('unknown', 'owned', 'licensed', 'authorized', 'public_domain', 'pending_review', 'restricted')),
  UNIQUE (translation_id, version_number)
);

ALTER TABLE public.translation_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS translation_versions_translation_idx
  ON public.translation_versions(translation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS translation_versions_submitter_idx
  ON public.translation_versions(submitted_by, status);

CREATE OR REPLACE FUNCTION public.assign_translation_version_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.translation_id::text));
  SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM public.translation_versions
    WHERE translation_id = NEW.translation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS translation_versions_assign_number ON public.translation_versions;
CREATE TRIGGER translation_versions_assign_number
  BEFORE INSERT ON public.translation_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_translation_version_number();

DROP POLICY IF EXISTS "Public can view authorized translation versions" ON public.translation_versions;
CREATE POLICY "Public can view authorized translation versions"
  ON public.translation_versions FOR SELECT
  USING (
    allowed_display = true
    AND status IN ('approved', 'verified')
    AND rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
  );

DROP POLICY IF EXISTS "Users can view own pending translation versions" ON public.translation_versions;
CREATE POLICY "Users can view own pending translation versions"
  ON public.translation_versions FOR SELECT
  USING (auth.uid() = submitted_by AND status = 'pending');

DROP POLICY IF EXISTS "Users can submit translation versions" ON public.translation_versions;
CREATE POLICY "Users can submit translation versions"
  ON public.translation_versions FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'pending'
    AND verified = false
    AND allowed_display = false
    AND EXISTS (
      SELECT 1
      FROM public.translations t
      JOIN public.lyrics l ON l.id = t.lyrics_id
      WHERE t.id = translation_id
        AND l.allowed_translation = true
        AND (
          (
            t.allowed_display = true
            AND t.status IN ('approved', 'verified')
            AND t.rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
          )
          OR t.submitted_by = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can edit own pending translation versions" ON public.translation_versions;
CREATE POLICY "Users can edit own pending translation versions"
  ON public.translation_versions FOR UPDATE
  USING (auth.uid() = submitted_by AND status = 'pending')
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'pending'
    AND verified = false
    AND allowed_display = false
  );

DROP POLICY IF EXISTS "Users can delete own pending translation versions" ON public.translation_versions;
CREATE POLICY "Users can delete own pending translation versions"
  ON public.translation_versions FOR DELETE
  USING (auth.uid() = submitted_by AND status = 'pending');
