-- Rights-aware audio playback and synchronized lyric cues for the Reading Room.
-- A row must be explicitly marked audio_authorized before the client will load it.
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

CREATE POLICY "Authorized playback is viewable by everyone"
  ON public.song_playback FOR SELECT
  USING (audio_authorized = true);

CREATE POLICY "Creators can insert authorized playback"
  ON public.song_playback FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Creators can update playback"
  ON public.song_playback FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete playback"
  ON public.song_playback FOR DELETE
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS song_playback_authorized_idx
  ON public.song_playback (audio_authorized);

COMMENT ON TABLE public.song_playback IS 'Explicitly authorized audio sources and timed lyric cues for Reading Room playback.';
COMMENT ON COLUMN public.song_playback.synced_lyrics IS 'JSON array of {startMs:number,endMs?:number,text:string} cue objects.';
