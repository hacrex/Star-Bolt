import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  generateLyricsAPI,
  saveAIProviderAPI,
  setAIProviderEnabledAPI,
  setDefaultAIProviderAPI,
  removeAIProviderAPI,
  testAIProviderAPI,
  translateLyricsAPI,
  type ProviderInput,
} from '../lib/api';
import type { AIProviderGenerationMetadata, AIProviderId, AIProviderMetadata } from '../lib/aiProviders';

export interface AISettings {
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
  settings: AISettings & { byok?: AIProviderGenerationMetadata };
  created_at: string;
  user_id: string;
}

interface AIStore {
  settings: AISettings;
  generatedLyrics: GeneratedLyrics[];
  providers: AIProviderMetadata[];
  lastGeneration: AIProviderGenerationMetadata | null;
  loading: boolean;
  providersLoading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<AISettings>) => void;
  loadProviders: () => Promise<void>;
  connectProvider: (input: ProviderInput) => Promise<void>;
  testProvider: (input: ProviderInput) => Promise<void>;
  removeProvider: (provider: AIProviderId) => Promise<void>;
  setDefaultProvider: (provider: AIProviderId) => Promise<void>;
  setProviderEnabled: (provider: AIProviderId, enabled: boolean) => Promise<void>;
  generateLyrics: (prompt: string) => Promise<string>;
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
  providers: [],
  lastGeneration: null,
  loading: false,
  providersLoading: false,
  error: null,

  updateSettings: (newSettings) => {
    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
  },

  loadProviders: async () => {
    set({ providersLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ providers: [] });
        return;
      }
      const { data, error } = await supabase
        .from('user_ai_provider_metadata')
        .select('*')
        .order('is_default', { ascending: false })
        .order('provider');
      if (error) throw error;
      set({ providers: (data || []) as AIProviderMetadata[] });
    } catch (error) {
      set({ error: 'Unable to load AI provider settings' });
      throw error;
    } finally {
      set({ providersLoading: false });
    }
  },

  connectProvider: async (input) => {
    set({ loading: true, error: null });
    try {
      await saveAIProviderAPI(input);
      await get().loadProviders();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to connect this provider' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  testProvider: async (input) => {
    set({ loading: true, error: null });
    try {
      await testAIProviderAPI(input);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Provider connection test failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeProvider: async (provider) => {
    set({ loading: true, error: null });
    try {
      await removeAIProviderAPI(provider);
      await get().loadProviders();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to remove this provider' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setDefaultProvider: async (provider) => {
    set({ loading: true, error: null });
    try {
      await setDefaultAIProviderAPI(provider);
      await get().loadProviders();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to select the default provider' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setProviderEnabled: async (provider, enabled) => {
    set({ loading: true, error: null });
    try {
      await setAIProviderEnabledAPI(provider, enabled);
      await get().loadProviders();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update this provider' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generateLyrics: async (prompt: string) => {
    try {
      set({ loading: true, error: null });
      const { settings, providers } = get();
      const defaultProvider = providers.find((provider) => provider.enabled && provider.is_default)?.provider;
      const response = await generateLyricsAPI(prompt, settings, defaultProvider);
      set({ lastGeneration: response.generation });
      return response.content;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to generate lyrics' });
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
          settings: { ...get().settings, byok: get().lastGeneration },
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
      set({ generatedLyrics: (data || []) as GeneratedLyrics[] });
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
