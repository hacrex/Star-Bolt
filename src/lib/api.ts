import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function generateLyricsAPI(
  prompt: string,
  settings: {
    rhymeScheme: string;
    syllablesPerLine: number;
    language: string;
    genre: string;
    mood: string;
  }
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Must be logged in');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-lyrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt, settings }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to generate lyrics');
  return data.content;
}

export async function translateLyricsAPI(
  content: string,
  targetLanguage: string
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Must be logged in');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/translate-lyrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ content, targetLanguage }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to translate lyrics');
  return data.translatedText;
}
