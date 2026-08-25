-- Star Lyrix artist video submission and review foundation
-- Artists can submit records, but only a server-side reviewer can approve or publish them.

CREATE TABLE IF NOT EXISTS public.artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 120),
  biography TEXT CHECK (biography IS NULL OR char_length(biography) <= 2000),
  profile_image_url TEXT CHECK (profile_image_url IS NULL OR profile_image_url LIKE 'https://%'),
  website_url TEXT CHECK (website_url IS NULL OR website_url LIKE 'https://%'),
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, display_name)
);

CREATE TABLE IF NOT EXISTS public.artist_video_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL CHECK (char_length(trim(artist_name)) BETWEEN 1 AND 120),
  song_title TEXT NOT NULL CHECK (char_length(trim(song_title)) BETWEEN 1 AND 200),
  album_title TEXT CHECK (album_title IS NULL OR char_length(trim(album_title)) <= 200),
  video_title TEXT NOT NULL CHECK (char_length(trim(video_title)) BETWEEN 1 AND 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 5000),
  language_code TEXT NOT NULL DEFAULT 'en' CHECK (language_code ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  genre TEXT CHECK (genre IS NULL OR char_length(trim(genre)) <= 80),
  release_date DATE,
  video_source_type TEXT NOT NULL DEFAULT 'youtube_unlisted' CHECK (video_source_type IN ('youtube_unlisted', 'youtube_private', 'hosted_upload')),
  video_source_url TEXT NOT NULL CHECK (video_source_url LIKE 'https://%'),
  thumbnail_url TEXT CHECK (thumbnail_url IS NULL OR thumbnail_url LIKE 'https://%'),
  rights_holder TEXT NOT NULL CHECK (char_length(trim(rights_holder)) BETWEEN 1 AND 200),
  rights_evidence_url TEXT CHECK (rights_evidence_url IS NULL OR rights_evidence_url LIKE 'https://%'),
  lyrics_rights_status TEXT NOT NULL DEFAULT 'not_submitted' CHECK (lyrics_rights_status IN ('not_submitted', 'owned', 'licensed', 'authorized', 'public_domain')),
  lyrics_license_reference TEXT CHECK (lyrics_license_reference IS NULL OR lyrics_license_reference LIKE 'https://%'),
  rights_attested BOOLEAN NOT NULL DEFAULT false,
  permission_to_edit BOOLEAN NOT NULL DEFAULT false,
  permission_to_publish BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'rights_review', 'content_review', 'changes_requested', 'approved', 'publish_queued', 'published', 'rejected', 'withdrawn')),
  reviewer_note TEXT CHECK (reviewer_note IS NULL OR char_length(reviewer_note) <= 4000),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  youtube_video_id TEXT,
  youtube_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT artist_video_submission_rights_check CHECK (
    (status IN ('draft', 'changes_requested') AND rights_attested IN (true, false))
    OR (status NOT IN ('draft', 'changes_requested') AND rights_attested = true AND permission_to_publish = true)
  )
);

CREATE TABLE IF NOT EXISTS public.artist_submission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.artist_video_submissions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'submitted', 'rights_reviewed', 'content_reviewed', 'changes_requested', 'approved', 'publish_queued', 'published', 'rejected', 'withdrawn', 'note_added')),
  from_status TEXT,
  to_status TEXT,
  note TEXT CHECK (note IS NULL OR char_length(note) <= 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS artist_profiles_owner_idx ON public.artist_profiles(owner_id);
CREATE INDEX IF NOT EXISTS artist_profiles_public_idx ON public.artist_profiles(is_public, verified);
CREATE INDEX IF NOT EXISTS artist_video_submissions_owner_idx ON public.artist_video_submissions(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS artist_video_submissions_status_idx ON public.artist_video_submissions(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS artist_submission_events_submission_idx ON public.artist_submission_events(submission_id, created_at DESC);

ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_submission_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artists can read own profile" ON public.artist_profiles;
CREATE POLICY "Artists can read own profile"
  ON public.artist_profiles FOR SELECT
  USING (auth.uid() = owner_id OR (is_public = true AND verified = true));

DROP POLICY IF EXISTS "Artists can create own profile" ON public.artist_profiles;
CREATE POLICY "Artists can create own profile"
  ON public.artist_profiles FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND verified = false AND is_public = false);

DROP POLICY IF EXISTS "Artists can update own unverified profile" ON public.artist_profiles;
CREATE POLICY "Artists can update own unverified profile"
  ON public.artist_profiles FOR UPDATE
  USING (auth.uid() = owner_id AND verified = false)
  WITH CHECK (auth.uid() = owner_id AND verified = false AND is_public = false);

DROP POLICY IF EXISTS "Artists can read own submissions" ON public.artist_video_submissions;
CREATE POLICY "Artists can read own submissions"
  ON public.artist_video_submissions FOR SELECT
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Artists can create draft submissions" ON public.artist_video_submissions;
CREATE POLICY "Artists can create draft submissions"
  ON public.artist_video_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND status = 'draft'
    AND rights_attested = false
    AND permission_to_publish = false
    AND EXISTS (
      SELECT 1 FROM public.artist_profiles profile
      WHERE profile.id = artist_profile_id AND profile.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Artists can update editable submissions" ON public.artist_video_submissions;
CREATE POLICY "Artists can update editable submissions"
  ON public.artist_video_submissions FOR UPDATE
  USING (auth.uid() = created_by AND status IN ('draft', 'changes_requested'))
  WITH CHECK (
    auth.uid() = created_by
    AND status IN ('draft', 'changes_requested')
    AND rights_attested = false
    AND permission_to_publish = false
  );

DROP POLICY IF EXISTS "Artists can read own submission events" ON public.artist_submission_events;
CREATE POLICY "Artists can read own submission events"
  ON public.artist_submission_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artist_video_submissions submission
      WHERE submission.id = submission_id AND submission.created_by = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.touch_artist_submission_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS artist_profiles_updated_at ON public.artist_profiles;
CREATE TRIGGER artist_profiles_updated_at
  BEFORE UPDATE ON public.artist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_artist_submission_updated_at();

DROP TRIGGER IF EXISTS artist_video_submissions_updated_at ON public.artist_video_submissions;
CREATE TRIGGER artist_video_submissions_updated_at
  BEFORE UPDATE ON public.artist_video_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_artist_submission_updated_at();

CREATE OR REPLACE FUNCTION public.log_artist_submission_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.artist_submission_events(submission_id, actor_id, event_type, to_status)
  VALUES (NEW.id, NEW.created_by, 'created', NEW.status);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS artist_video_submission_created_event ON public.artist_video_submissions;
CREATE TRIGGER artist_video_submission_created_event
  AFTER INSERT ON public.artist_video_submissions
  FOR EACH ROW EXECUTE FUNCTION public.log_artist_submission_created();

-- Submission finalization is server-mediated so the browser cannot forge a review state.
CREATE OR REPLACE FUNCTION public.submit_artist_video_submission(
  p_submission_id UUID,
  p_rights_attested BOOLEAN,
  p_permission_to_edit BOOLEAN,
  p_permission_to_publish BOOLEAN
)
RETURNS public.artist_video_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submitted public.artist_video_submissions;
  previous_status TEXT;
BEGIN
  IF p_rights_attested IS DISTINCT FROM true OR p_permission_to_edit IS DISTINCT FROM true OR p_permission_to_publish IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Rights attestation, editing permission, and publishing permission are required';
  END IF;

  SELECT status INTO previous_status
  FROM public.artist_video_submissions
  WHERE id = p_submission_id
    AND created_by = auth.uid()
    AND status IN ('draft', 'changes_requested')
    AND rights_attested = false
    AND permission_to_publish = false
  FOR UPDATE;

  UPDATE public.artist_video_submissions
  SET status = 'submitted',
      rights_attested = true,
      permission_to_edit = true,
      permission_to_publish = true,
      updated_at = now()
  WHERE id = p_submission_id
    AND created_by = auth.uid()
    AND status IN ('draft', 'changes_requested')
    AND rights_attested = false
    AND permission_to_publish = false
  RETURNING * INTO submitted;

  IF submitted.id IS NULL THEN
    RAISE EXCEPTION 'Submission cannot be finalized';
  END IF;

  INSERT INTO public.artist_submission_events(submission_id, actor_id, event_type, from_status, to_status)
  VALUES (submitted.id, auth.uid(), 'submitted', previous_status, 'submitted');

  RETURN submitted;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_artist_video_submission(UUID, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_artist_video_submission(UUID, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

-- Reviewer and publishing operations are intentionally server-only. Add role checks and
-- YouTube OAuth publishing in a later migration once a real reviewer identity model exists.
REVOKE ALL ON TABLE public.artist_submission_events FROM anon, authenticated;
GRANT SELECT ON TABLE public.artist_submission_events TO authenticated;

COMMENT ON TABLE public.artist_video_submissions IS 'Rights-aware artist video submissions; approved/published transitions are server-mediated.';
COMMENT ON COLUMN public.artist_video_submissions.video_source_url IS 'HTTPS source controlled by the submitter; publishing workers must validate rights before use.';
