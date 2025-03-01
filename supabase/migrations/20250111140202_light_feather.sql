/*
  # Add playlists and favorites features

  1. New Tables
    - `playlists`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, references users)
      - `created_at` (timestamp)
    - `playlist_songs`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references playlists)
      - `song_id` (uuid, references songs)
      - `added_at` (timestamp)
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `song_id` (uuid, references songs)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create playlist_songs table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

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