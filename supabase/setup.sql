-- ============================================
-- Star Lyrix - Complete Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- 2. Songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  release_date date,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

-- 3. Lyrics table
CREATE TABLE IF NOT EXISTS public.lyrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  content text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

-- 4. Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  score integer CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(song_id, user_id)
);

-- 6. Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. Playlist songs junction table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- 8. Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- 9. Generated lyrics table
CREATE TABLE IF NOT EXISTS public.generated_lyrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  settings jsonb NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_lyrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Users policies
CREATE POLICY "Public users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Songs policies
CREATE POLICY "Songs are viewable by everyone" ON public.songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert songs" ON public.songs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their songs" ON public.songs
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their songs" ON public.songs
  FOR DELETE USING (auth.uid() = created_by);

-- Lyrics policies
CREATE POLICY "Lyrics are viewable by everyone" ON public.lyrics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert lyrics" ON public.lyrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Playlists policies
CREATE POLICY "Users can view own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist songs policies
CREATE POLICY "Users can view playlist songs" ON public.playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_songs.playlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add songs to own playlists" ON public.playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_songs.playlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from own playlists" ON public.playlist_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_songs.playlist_id
      AND user_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Generated lyrics policies
CREATE POLICY "Users can view own generated lyrics" ON public.generated_lyrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated lyrics" ON public.generated_lyrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated lyrics" ON public.generated_lyrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated lyrics" ON public.generated_lyrics
  FOR DELETE USING (auth.uid() = user_id);


-- 10. Authorized Reading Room playback and synchronized lyric cues
CREATE TABLE IF NOT EXISTS public.song_playback (
  song_id uuid PRIMARY KEY REFERENCES public.songs(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  audio_source text NOT NULL DEFAULT 'authorized-upload',
  audio_authorized boolean NOT NULL DEFAULT false,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  synced_lyrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.song_playback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized playback is viewable by everyone" ON public.song_playback
  FOR SELECT USING (audio_authorized = true);

CREATE POLICY "Creators can insert authorized playback" ON public.song_playback
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Creators can update playback" ON public.song_playback
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete playback" ON public.song_playback
  FOR DELETE USING (auth.uid() = created_by);


-- 11. Create profiles server-side after Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'username', ''), 'star-' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 12. Original multilingual QA catalog support
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS songs_language_idx ON public.songs(language);
CREATE UNIQUE INDEX IF NOT EXISTS songs_title_artist_unique_idx ON public.songs(title, artist);
CREATE UNIQUE INDEX IF NOT EXISTS lyrics_song_unique_idx ON public.lyrics(song_id);

CREATE TABLE IF NOT EXISTS public.test_catalog_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  language text NOT NULL,
  bucket_id text NOT NULL DEFAULT 'test-catalog-lyrics',
  storage_path text NOT NULL,
  content_type text NOT NULL DEFAULT 'text/plain',
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(song_id),
  UNIQUE(bucket_id, storage_path)
);

ALTER TABLE public.test_catalog_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Test catalog assets are publicly readable" ON public.test_catalog_assets;
CREATE POLICY "Test catalog assets are publicly readable" ON public.test_catalog_assets
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage test catalog assets" ON public.test_catalog_assets;
CREATE POLICY "Authenticated users can manage test catalog assets" ON public.test_catalog_assets
  FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

INSERT INTO storage.buckets (id, name, public)
VALUES ('test-catalog-lyrics', 'test-catalog-lyrics', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Test catalog lyric files are publicly readable" ON storage.objects;
CREATE POLICY "Test catalog lyric files are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'test-catalog-lyrics');


-- 13. Rights-aware lyrics metadata and translations
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
CREATE POLICY "Public can view authorized translations" ON public.translations FOR SELECT USING (
  allowed_display = true
  AND status IN ('approved', 'verified')
  AND rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
);
DROP POLICY IF EXISTS "Users can view own pending translations" ON public.translations;
CREATE POLICY "Users can view own pending translations" ON public.translations FOR SELECT
  USING (auth.uid() = submitted_by AND status = 'pending');
DROP POLICY IF EXISTS "Users can submit pending translations" ON public.translations;
CREATE POLICY "Users can submit pending translations" ON public.translations FOR INSERT WITH CHECK (
  auth.uid() = submitted_by AND status = 'pending' AND verified = false AND allowed_display = false
);
DROP POLICY IF EXISTS "Users can edit own pending translations" ON public.translations;
CREATE POLICY "Users can edit own pending translations" ON public.translations FOR UPDATE
  USING (auth.uid() = submitted_by AND status = 'pending')
  WITH CHECK (auth.uid() = submitted_by AND status = 'pending' AND verified = false AND allowed_display = false);
DROP POLICY IF EXISTS "Users can delete own pending translations" ON public.translations;
CREATE POLICY "Users can delete own pending translations" ON public.translations FOR DELETE
  USING (auth.uid() = submitted_by AND status = 'pending');

DROP POLICY IF EXISTS "Lyrics are viewable by everyone" ON public.lyrics;
DROP POLICY IF EXISTS "Public can view authorized lyrics" ON public.lyrics;
CREATE POLICY "Public can view authorized lyrics" ON public.lyrics FOR SELECT USING (
  allowed_display = true
  AND status IN ('approved', 'verified')
  AND rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
);
DROP POLICY IF EXISTS "Authenticated users can insert lyrics" ON public.lyrics;
DROP POLICY IF EXISTS "Users can view own pending lyrics" ON public.lyrics;
CREATE POLICY "Users can view own pending lyrics" ON public.lyrics FOR SELECT
  USING (auth.uid() = created_by AND status = 'pending');
CREATE POLICY "Authenticated users can submit pending lyrics" ON public.lyrics FOR INSERT WITH CHECK (
  auth.uid() = created_by AND status = 'pending' AND verified = false AND allowed_display = false
);
DROP POLICY IF EXISTS "Users can update own pending lyrics" ON public.lyrics;
CREATE POLICY "Users can update own pending lyrics" ON public.lyrics FOR UPDATE
  USING (auth.uid() = created_by AND status = 'pending')
  WITH CHECK (auth.uid() = created_by AND status = 'pending' AND verified = false AND allowed_display = false);
DROP POLICY IF EXISTS "Users can delete own pending lyrics" ON public.lyrics;
CREATE POLICY "Users can delete own pending lyrics" ON public.lyrics FOR DELETE
  USING (auth.uid() = created_by AND status = 'pending');


-- 14. Collaborative translation version snapshots
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
CREATE INDEX IF NOT EXISTS translation_versions_translation_idx ON public.translation_versions(translation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS translation_versions_submitter_idx ON public.translation_versions(submitted_by, status);

CREATE OR REPLACE FUNCTION public.assign_translation_version_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.translation_id::text));
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.translation_versions WHERE translation_id = NEW.translation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS translation_versions_assign_number ON public.translation_versions;
CREATE TRIGGER translation_versions_assign_number
  BEFORE INSERT ON public.translation_versions
  FOR EACH ROW EXECUTE FUNCTION public.assign_translation_version_number();

DROP POLICY IF EXISTS "Public can view authorized translation versions" ON public.translation_versions;
CREATE POLICY "Public can view authorized translation versions" ON public.translation_versions FOR SELECT USING (
  allowed_display = true
  AND status IN ('approved', 'verified')
  AND rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
);
DROP POLICY IF EXISTS "Users can view own pending translation versions" ON public.translation_versions;
CREATE POLICY "Users can view own pending translation versions" ON public.translation_versions FOR SELECT
  USING (auth.uid() = submitted_by AND status = 'pending');
DROP POLICY IF EXISTS "Users can submit translation versions" ON public.translation_versions;
CREATE POLICY "Users can submit translation versions" ON public.translation_versions FOR INSERT WITH CHECK (
  auth.uid() = submitted_by AND status = 'pending' AND verified = false AND allowed_display = false
  AND EXISTS (
    SELECT 1
    FROM public.translations t
    JOIN public.lyrics l ON l.id = t.lyrics_id
    WHERE t.id = translation_id
      AND l.allowed_translation = true
      AND (
        (t.allowed_display = true AND t.status IN ('approved', 'verified') AND t.rights_status IN ('owned', 'licensed', 'authorized', 'public_domain'))
        OR t.submitted_by = auth.uid()
      )
  )
);
DROP POLICY IF EXISTS "Users can edit own pending translation versions" ON public.translation_versions;
CREATE POLICY "Users can edit own pending translation versions" ON public.translation_versions FOR UPDATE
  USING (auth.uid() = submitted_by AND status = 'pending')
  WITH CHECK (auth.uid() = submitted_by AND status = 'pending' AND verified = false AND allowed_display = false);
DROP POLICY IF EXISTS "Users can delete own pending translation versions" ON public.translation_versions;
CREATE POLICY "Users can delete own pending translation versions" ON public.translation_versions FOR DELETE
  USING (auth.uid() = submitted_by AND status = 'pending');


-- 15. Private Realtime collaboration policies
CREATE OR REPLACE FUNCTION public.can_access_translation_workspace(channel_topic text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH topic AS (
    SELECT substring(channel_topic FROM '^translation-workspace:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$')::uuid AS lyric_id
  )
  SELECT EXISTS (
    SELECT 1
    FROM public.lyrics l
    CROSS JOIN topic
    WHERE l.id = topic.lyric_id
      AND (
        (l.allowed_translation = true AND l.allowed_display = true AND l.status IN ('approved', 'verified') AND l.rights_status IN ('owned', 'licensed', 'authorized', 'public_domain'))
        OR l.created_by = auth.uid()
      )
  );
$$;

DO $$
BEGIN
  IF to_regclass('realtime.messages') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive translation collaboration" ON realtime.messages';
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can receive translation collaboration"
        ON realtime.messages FOR SELECT TO authenticated
        USING (extension IN ('presence', 'broadcast') AND public.can_access_translation_workspace((SELECT realtime.topic())))
    $policy$;
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can publish translation collaboration" ON realtime.messages';
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can publish translation collaboration"
        ON realtime.messages FOR INSERT TO authenticated
        WITH CHECK (extension IN ('presence', 'broadcast') AND public.can_access_translation_workspace((SELECT realtime.topic())))
    $policy$;
  END IF;
END;
$$;


-- 16. Server-generated reputation events and badge inputs
CREATE TABLE IF NOT EXISTS public.reputation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reputation_events_type_valid CHECK (event_type IN ('song_submitted', 'lyrics_submitted', 'translation_submitted', 'translation_revision_submitted', 'translation_approved', 'translation_revision_approved')),
  CONSTRAINT reputation_events_source_valid CHECK (source_type IN ('song', 'lyrics', 'translation', 'translation_version')),
  UNIQUE (user_id, event_type, source_type, source_id)
);

ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS reputation_events_user_created_idx ON public.reputation_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reputation_events_user_type_idx ON public.reputation_events(user_id, event_type);
DROP POLICY IF EXISTS "Users can view own reputation events" ON public.reputation_events;
CREATE POLICY "Users can view own reputation events" ON public.reputation_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.record_reputation_event(target_user_id uuid, target_event_type text, target_source_type text, target_source_id uuid, target_points integer, target_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF target_user_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
  VALUES (target_user_id, target_event_type, target_source_type, target_source_id, target_points, COALESCE(target_metadata, '{}'::jsonb))
  ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_song_reputation_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.record_reputation_event(NEW.created_by, 'song_submitted', 'song', NEW.id, 25, jsonb_build_object('language_code', COALESCE(NEW.language_code, NEW.language, 'en')));
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.sync_lyrics_reputation_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.record_reputation_event(NEW.created_by, 'lyrics_submitted', 'lyrics', NEW.id, 15, jsonb_build_object('language_code', COALESCE(NEW.language_code, 'en')));
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.sync_translation_reputation_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.record_reputation_event(NEW.submitted_by, 'translation_submitted', 'translation', NEW.id, 20, jsonb_build_object('language_code', NEW.language_code)); END IF;
  IF NEW.status IN ('approved', 'verified') THEN PERFORM public.record_reputation_event(NEW.submitted_by, 'translation_approved', 'translation', NEW.id, 40, jsonb_build_object('language_code', NEW.language_code)); ELSE DELETE FROM public.reputation_events WHERE user_id = NEW.submitted_by AND event_type = 'translation_approved' AND source_type = 'translation' AND source_id = NEW.id; END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.sync_translation_version_reputation_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.record_reputation_event(NEW.submitted_by, 'translation_revision_submitted', 'translation_version', NEW.id, 12, '{}'::jsonb); END IF;
  IF NEW.status IN ('approved', 'verified') THEN PERFORM public.record_reputation_event(NEW.submitted_by, 'translation_revision_approved', 'translation_version', NEW.id, 35, '{}'::jsonb); ELSE DELETE FROM public.reputation_events WHERE user_id = NEW.submitted_by AND event_type = 'translation_revision_approved' AND source_type = 'translation_version' AND source_id = NEW.id; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS songs_reputation_event ON public.songs;
CREATE TRIGGER songs_reputation_event AFTER INSERT ON public.songs FOR EACH ROW EXECUTE FUNCTION public.sync_song_reputation_event();
DROP TRIGGER IF EXISTS lyrics_reputation_event ON public.lyrics;
CREATE TRIGGER lyrics_reputation_event AFTER INSERT ON public.lyrics FOR EACH ROW EXECUTE FUNCTION public.sync_lyrics_reputation_event();
DROP TRIGGER IF EXISTS translations_reputation_event ON public.translations;
CREATE TRIGGER translations_reputation_event AFTER INSERT OR UPDATE OF status ON public.translations FOR EACH ROW EXECUTE FUNCTION public.sync_translation_reputation_event();
DROP TRIGGER IF EXISTS translation_versions_reputation_event ON public.translation_versions;
CREATE TRIGGER translation_versions_reputation_event AFTER INSERT OR UPDATE OF status ON public.translation_versions FOR EACH ROW EXECUTE FUNCTION public.sync_translation_version_reputation_event();


-- Prevent browser clients from fabricating reputation points.
REVOKE EXECUTE ON FUNCTION public.record_reputation_event(uuid, text, text, uuid, integer, jsonb) FROM PUBLIC, anon, authenticated;

-- Backfill existing contribution activity without awarding duplicates on reruns.
INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
SELECT created_by, 'song_submitted', 'song', id, 25, jsonb_build_object('language_code', COALESCE(language_code, language, 'en'))
FROM public.songs WHERE created_by IS NOT NULL
ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;
INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
SELECT created_by, 'lyrics_submitted', 'lyrics', id, 15, jsonb_build_object('language_code', COALESCE(language_code, 'en'))
FROM public.lyrics WHERE created_by IS NOT NULL
ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;
INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
SELECT submitted_by, 'translation_submitted', 'translation', id, 20, jsonb_build_object('language_code', language_code)
FROM public.translations WHERE submitted_by IS NOT NULL
ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;
INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
SELECT submitted_by, 'translation_approved', 'translation', id, 40, jsonb_build_object('language_code', language_code)
FROM public.translations WHERE submitted_by IS NOT NULL AND status IN ('approved', 'verified')
ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;
INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
SELECT v.submitted_by, 'translation_revision_submitted', 'translation_version', v.id, 12, jsonb_build_object('language_code', t.language_code)
FROM public.translation_versions v JOIN public.translations t ON t.id = v.translation_id
WHERE v.submitted_by IS NOT NULL
ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;
INSERT INTO public.reputation_events (user_id, event_type, source_type, source_id, points, metadata)
SELECT v.submitted_by, 'translation_revision_approved', 'translation_version', v.id, 35, jsonb_build_object('language_code', t.language_code)
FROM public.translation_versions v JOIN public.translations t ON t.id = v.translation_id
WHERE v.submitted_by IS NOT NULL AND v.status IN ('approved', 'verified')
ON CONFLICT (user_id, event_type, source_type, source_id) DO NOTHING;








-- 17. BYOK provider metadata and server-only Vault references
-- Star Lyrix Phase 1 BYOK provider metadata.
-- Raw provider keys are stored only in Supabase Vault, never in public tables.
-- Apply after migrations 00000 through 00006 and verify Vault is enabled in the target project.

CREATE EXTENSION IF NOT EXISTS vault WITH SCHEMA vault;

CREATE TABLE IF NOT EXISTS public.user_ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model_name text NOT NULL,
  base_url text,
  secret_reference uuid,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  last_validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_ai_providers_provider_valid CHECK (provider IN ('openai', 'gemini', 'openrouter', 'custom_openai')),
  CONSTRAINT user_ai_providers_model_valid CHECK (length(trim(model_name)) BETWEEN 1 AND 120),
  CONSTRAINT user_ai_providers_custom_url_valid CHECK (
    provider <> 'custom_openai' OR (base_url IS NOT NULL AND base_url ~ '^https://')
  ),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.user_ai_providers ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS user_ai_providers_one_default_idx
  ON public.user_ai_providers(user_id)
  WHERE is_default = true;
CREATE INDEX IF NOT EXISTS user_ai_providers_user_enabled_idx
  ON public.user_ai_providers(user_id, enabled, is_default);

DROP POLICY IF EXISTS "Users can view own AI provider metadata" ON public.user_ai_providers;
CREATE POLICY "Users can view own AI provider metadata"
  ON public.user_ai_providers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- The browser may read only sanitized metadata. All writes and secret resolution happen in Edge Functions.
REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.user_ai_providers FROM anon, authenticated;
CREATE OR REPLACE VIEW public.user_ai_provider_metadata AS
SELECT id, user_id, provider, model_name, base_url, enabled, is_default, last_validated_at, created_at, updated_at
FROM public.user_ai_providers
WHERE auth.uid() = user_id;
REVOKE ALL ON public.user_ai_provider_metadata FROM PUBLIC, anon;
GRANT SELECT ON public.user_ai_provider_metadata TO authenticated;

CREATE OR REPLACE FUNCTION public.store_user_ai_provider(
  p_user_id uuid,
  p_provider text,
  p_model_name text,
  p_base_url text,
  p_api_key text
)
RETURNS public.user_ai_providers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  existing_provider public.user_ai_providers;
  saved_provider public.user_ai_providers;
  secret_id uuid;
  should_be_default boolean;
  normalized_url text;
BEGIN
  IF p_user_id IS NULL OR p_provider IS NULL OR p_model_name IS NULL OR p_api_key IS NULL THEN
    RAISE EXCEPTION 'Invalid BYOK provider payload' USING ERRCODE = '22023';
  END IF;
  IF p_provider NOT IN ('openai', 'gemini', 'openrouter', 'custom_openai') THEN
    RAISE EXCEPTION 'Unsupported BYOK provider' USING ERRCODE = '22023';
  END IF;
  IF length(trim(p_model_name)) < 1 OR length(trim(p_model_name)) > 120 THEN
    RAISE EXCEPTION 'Invalid BYOK model name' USING ERRCODE = '22023';
  END IF;
  IF length(trim(p_api_key)) < 8 OR length(p_api_key) > 512 THEN
    RAISE EXCEPTION 'Invalid BYOK API key' USING ERRCODE = '22023';
  END IF;

  normalized_url := NULLIF(regexp_replace(trim(COALESCE(p_base_url, '')), '/+$', ''), '');
  IF p_provider = 'custom_openai' AND (normalized_url IS NULL OR normalized_url !~ '^https://') THEN
    RAISE EXCEPTION 'Custom providers require an HTTPS base URL' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO existing_provider
  FROM public.user_ai_providers
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  IF existing_provider.secret_reference IS NOT NULL THEN
    secret_id := existing_provider.secret_reference;
    PERFORM vault.update_secret(
      secret_id,
      p_api_key,
      format('star-lyrix:%s:%s', p_user_id, p_provider),
      'Star Lyrix BYOK provider credential'
    );
  ELSE
    secret_id := vault.create_secret(
      p_api_key,
      format('star-lyrix:%s:%s', p_user_id, p_provider),
      'Star Lyrix BYOK provider credential'
    );
  END IF;

  should_be_default := existing_provider.is_default OR NOT EXISTS (
    SELECT 1 FROM public.user_ai_providers WHERE user_id = p_user_id AND enabled = true
  );

  IF should_be_default THEN
    UPDATE public.user_ai_providers
    SET is_default = false, updated_at = now()
    WHERE user_id = p_user_id AND provider <> p_provider;
  END IF;

  INSERT INTO public.user_ai_providers (
    user_id, provider, model_name, base_url, secret_reference, enabled, is_default, updated_at
  ) VALUES (
    p_user_id, p_provider, trim(p_model_name), normalized_url, secret_id, true, should_be_default, now()
  )
  ON CONFLICT (user_id, provider) DO UPDATE SET
    model_name = EXCLUDED.model_name,
    base_url = EXCLUDED.base_url,
    secret_reference = EXCLUDED.secret_reference,
    enabled = true,
    is_default = EXCLUDED.is_default,
    updated_at = now()
  RETURNING * INTO saved_provider;

  RETURN saved_provider;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_ai_provider_secret(
  p_user_id uuid,
  p_provider text
)
RETURNS TABLE (
  provider text,
  model_name text,
  base_url text,
  enabled boolean,
  is_default boolean,
  secret text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT p.provider, p.model_name, p.base_url, p.enabled, p.is_default, d.decrypted_secret
  FROM public.user_ai_providers p
  JOIN vault.decrypted_secrets d ON d.id = p.secret_reference
  WHERE p.user_id = p_user_id
    AND p.provider = p_provider
    AND p.enabled = true;
$$;

CREATE OR REPLACE FUNCTION public.set_user_ai_provider_default(
  p_user_id uuid,
  p_provider text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_ai_providers
    WHERE user_id = p_user_id AND provider = p_provider AND enabled = true
  ) THEN
    RETURN false;
  END IF;
  UPDATE public.user_ai_providers
  SET is_default = (provider = p_provider), updated_at = now()
  WHERE user_id = p_user_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_ai_provider_enabled(
  p_user_id uuid,
  p_provider text,
  p_enabled boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed boolean;
  was_default boolean;
BEGIN
  SELECT is_default INTO was_default
  FROM public.user_ai_providers
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  UPDATE public.user_ai_providers
  SET enabled = p_enabled,
      is_default = CASE WHEN p_enabled THEN is_default ELSE false END,
      updated_at = now()
  WHERE user_id = p_user_id AND provider = p_provider
  RETURNING true INTO changed;

  IF COALESCE(was_default, false) AND NOT p_enabled THEN
    UPDATE public.user_ai_providers
    SET is_default = true, updated_at = now()
    WHERE id = (
      SELECT id FROM public.user_ai_providers
      WHERE user_id = p_user_id AND enabled = true
      ORDER BY updated_at DESC
      LIMIT 1
    );
  END IF;

  RETURN COALESCE(changed, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_user_ai_provider(
  p_user_id uuid,
  p_provider text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  existing_provider public.user_ai_providers;
BEGIN
  SELECT * INTO existing_provider
  FROM public.user_ai_providers
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  IF existing_provider.id IS NULL THEN
    RETURN false;
  END IF;

  -- Do not assume an undocumented delete API. Overwrite the encrypted value with a
  -- non-secret tombstone before removing the metadata reference.
  IF existing_provider.secret_reference IS NOT NULL THEN
    PERFORM vault.update_secret(
      existing_provider.secret_reference,
      'revoked',
      format('star-lyrix:revoked:%s:%s', p_user_id, p_provider),
      'Revoked Star Lyrix BYOK provider credential'
    );
  END IF;
  DELETE FROM public.user_ai_providers WHERE id = existing_provider.id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.store_user_ai_provider(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_ai_provider_secret(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_ai_provider_default(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_ai_provider_enabled(uuid, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_user_ai_provider(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_user_ai_provider(uuid, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_ai_provider_secret(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_user_ai_provider_default(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_user_ai_provider_enabled(uuid, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_user_ai_provider(uuid, text) TO service_role;


-- 18. Cached YouTube channel/video metadata for the Vevo-for-Lyrics gallery
-- Star Lyrix Vevo-for-Lyrics foundation: cached YouTube channel metadata.
-- This table stores public metadata only; it does not grant rights to copy lyrics,
-- download media, or host unauthorized audio/video.

CREATE TABLE IF NOT EXISTS public.youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id text NOT NULL UNIQUE,
  channel_handle text NOT NULL DEFAULT '@starlyrix',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text,
  published_at timestamptz,
  content_type text NOT NULL DEFAULT 'short',
  youtube_url text NOT NULL,
  song_id uuid REFERENCES public.songs(id) ON DELETE SET NULL,
  artist_name text,
  is_public boolean NOT NULL DEFAULT true,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT youtube_videos_content_type_valid CHECK (content_type IN ('short', 'lyrics_video', 'meaning_video', 'original', 'other')),
  CONSTRAINT youtube_videos_url_valid CHECK (youtube_url ~ '^https://www\\.youtube\\.com/(shorts|watch)\\/'),
  CONSTRAINT youtube_videos_handle_valid CHECK (channel_handle LIKE '@%')
);

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS youtube_videos_public_type_idx
  ON public.youtube_videos(is_public, content_type, published_at DESC);
CREATE INDEX IF NOT EXISTS youtube_videos_song_idx
  ON public.youtube_videos(song_id) WHERE song_id IS NOT NULL;

DROP POLICY IF EXISTS "Public can view public YouTube metadata" ON public.youtube_videos;
CREATE POLICY "Public can view public YouTube metadata"
  ON public.youtube_videos FOR SELECT TO anon, authenticated
  USING (is_public = true);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.youtube_videos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.youtube_videos TO anon, authenticated;






-- 19. Artist profiles, video submissions, and server-mediated review preparation
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
