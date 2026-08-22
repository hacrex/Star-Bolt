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
