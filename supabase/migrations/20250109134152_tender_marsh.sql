/*
  # Initial Schema for Star Lyrix

  1. New Tables
    - users (extends auth.users)
      - id (uuid, primary key)
      - username (text)
      - avatar_url (text)
      - created_at (timestamp)
    
    - songs
      - id (uuid, primary key)
      - title (text)
      - artist (text)
      - album (text)
      - release_date (date)
      - thumbnail_url (text)
      - created_at (timestamp)
      - created_by (uuid, references users)
    
    - lyrics
      - id (uuid, primary key)
      - song_id (uuid, references songs)
      - content (text)
      - verified (boolean)
      - created_at (timestamp)
      - created_by (uuid, references users)
    
    - comments
      - id (uuid, primary key)
      - song_id (uuid, references songs)
      - user_id (uuid, references users)
      - content (text)
      - created_at (timestamp)
    
    - ratings
      - id (uuid, primary key)
      - song_id (uuid, references songs)
      - user_id (uuid, references users)
      - score (integer)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where appropriate
*/

-- Create tables
CREATE TABLE public.users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  release_date date,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

CREATE TABLE public.lyrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  content text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  score integer CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(song_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Songs are viewable by everyone" ON public.songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert songs" ON public.songs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their songs" ON public.songs
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Lyrics are viewable by everyone" ON public.lyrics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert lyrics" ON public.lyrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Ratings are viewable by everyone" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);