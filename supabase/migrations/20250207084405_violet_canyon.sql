/*
  # Create generated lyrics table

  1. New Tables
    - `generated_lyrics`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `settings` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `generated_lyrics` table
    - Add policies for users to manage their own lyrics
*/

DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'generated_lyrics'
  ) THEN
    CREATE TABLE public.generated_lyrics (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      content text NOT NULL,
      settings jsonb NOT NULL,
      user_id uuid REFERENCES auth.users NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE generated_lyrics ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'generated_lyrics' 
    AND policyname = 'Users can view own generated lyrics'
  ) THEN
    CREATE POLICY "Users can view own generated lyrics"
      ON generated_lyrics FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'generated_lyrics' 
    AND policyname = 'Users can insert own generated lyrics'
  ) THEN
    CREATE POLICY "Users can insert own generated lyrics"
      ON generated_lyrics FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'generated_lyrics' 
    AND policyname = 'Users can update own generated lyrics'
  ) THEN
    CREATE POLICY "Users can update own generated lyrics"
      ON generated_lyrics FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'generated_lyrics' 
    AND policyname = 'Users can delete own generated lyrics'
  ) THEN
    CREATE POLICY "Users can delete own generated lyrics"
      ON generated_lyrics FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;