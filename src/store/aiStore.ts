import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

interface AISettings {
  rhymeScheme: 'ABAB' | 'AABB' | 'FREE';
  syllablesPerLine: number;
  language: string;
  genre: string;
  mood: string;
}

interface GeneratedLyrics {
  id: string;
  content: string;
  title: string;
  settings: AISettings;
  created_at: string;
  user_id: string;
}

interface AIStore {
  settings: AISettings;
  generatedLyrics: GeneratedLyrics[];
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<AISettings>) => void;
  generateLyrics: (prompt: string) => Promise<void>;
  saveLyrics: (title: string, content: string) => Promise<void>;
  fetchUserLyrics: () => Promise<void>;
  translateLyrics: (content: string, targetLanguage: string) => Promise<string>;
}

export const useAIStore = create<AIStore>((set, get) => ({
  settings: {
    rhymeScheme: 'ABAB',
    syllablesPerLine: 8,
    language: 'en',
    genre: 'pop',
    mood: 'happy',
  },
  generatedLyrics: [],
  loading: false,
  error: null,

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  generateLyrics: async (prompt: string) => {
    try {
      set({ loading: true, error: null });
      const settings = get().settings;
      
      // In a real implementation, this would call your AI service
      // For now, we'll simulate the API call
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: `Generate song lyrics with the following parameters:
              Rhyme scheme: ${settings.rhymeScheme}
              Syllables per line: ${settings.syllablesPerLine}
              Genre: ${settings.genre}
              Mood: ${settings.mood}
              Language: ${settings.language}`
          }, {
            role: "user",
            content: prompt
          }]
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      set({ error: 'Failed to generate lyrics' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  saveLyrics: async (title: string, content: string) => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to save lyrics');

      const { error } = await supabase
        .from('generated_lyrics')
        .insert([{
          title,
          content,
          settings: get().settings,
          user_id: user.id,
        }]);

      if (error) throw error;
      await get().fetchUserLyrics();
    } catch (error) {
      set({ error: 'Failed to save lyrics' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserLyrics: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to fetch lyrics');

      const { data, error } = await supabase
        .from('generated_lyrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ generatedLyrics: data || [] });
    } catch (error) {
      set({ error: 'Failed to fetch lyrics' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  translateLyrics: async (content: string, targetLanguage: string) => {
    try {
      set({ loading: true, error: null });
      // In a real implementation, this would call the Google Translate API
      // For now, we'll simulate the translation
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: content,
          target: targetLanguage,
        }),
      });

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      set({ error: 'Failed to translate lyrics' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));