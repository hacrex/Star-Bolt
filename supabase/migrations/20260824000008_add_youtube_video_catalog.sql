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
