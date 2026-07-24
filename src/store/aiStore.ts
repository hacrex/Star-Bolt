import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { generateLyricsAPI, translateLyricsAPI } from '../lib/api';

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
      const content = await generateLyricsAPI(prompt, settings);
      return content;
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
      const translatedText = await translateLyricsAPI(content, targetLanguage);
      return translatedText;
    } catch (error) {
      set({ error: 'Failed to translate lyrics' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));