-- Multilingual test-catalog support.
-- The catalog content is original and intended only for local/staging QA.

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
CREATE POLICY "Test catalog assets are publicly readable"
  ON public.test_catalog_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage test catalog assets" ON public.test_catalog_assets;
CREATE POLICY "Authenticated users can manage test catalog assets"
  ON public.test_catalog_assets FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

INSERT INTO storage.buckets (id, name, public)
VALUES ('test-catalog-lyrics', 'test-catalog-lyrics', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Test catalog lyric files are publicly readable" ON storage.objects;
CREATE POLICY "Test catalog lyric files are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'test-catalog-lyrics');

COMMENT ON TABLE public.test_catalog_assets IS 'Storage manifest for the original multilingual QA catalog; do not use as production content.';
COMMENT ON COLUMN public.songs.language IS 'ISO-style language code used by the QA catalog: hi, en, or ta.';
