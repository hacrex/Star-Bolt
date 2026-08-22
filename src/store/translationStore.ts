import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Translation = Database['public']['Tables']['translations']['Row'];
type TranslationInsert = Database['public']['Tables']['translations']['Insert'];
type TranslationVersion = Database['public']['Tables']['translation_versions']['Row'];
type TranslationVersionInsert = Database['public']['Tables']['translation_versions']['Insert'];

interface TranslationState {
  translations: Translation[];
  versions: TranslationVersion[];
  loading: boolean;
  clearVersions: () => void;
  error: string | null;
  fetchForLyrics: (lyricsId: string) => Promise<void>;
  fetchVersions: (translationId: string) => Promise<void>;
  submitTranslation: (input: {
    lyricsId: string;
    languageCode: string;
    translatedText: string;
    rightsStatus?: string;
    rightsHolder?: string | null;
    licenseReference?: string | null;
    changeNote?: string | null;
  }) => Promise<TranslationVersion>;
}

const cleanError = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong with translations';

export const useTranslationStore = create<TranslationState>((set, get) => ({
  translations: [],
  versions: [],
  loading: false,
  error: null,
  clearVersions: () => set({ versions: [] }),

  fetchForLyrics: async (lyricsId) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('lyrics_id', lyricsId)
        .order('language_code', { ascending: true });
      if (error) throw error;
      set({ translations: data || [] });
    } catch (error) {
      set({ error: cleanError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchVersions: async (translationId) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('translation_versions')
        .select('*')
        .eq('translation_id', translationId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      set({ versions: data || [] });
    } catch (error) {
      set({ error: cleanError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitTranslation: async ({ lyricsId, languageCode, translatedText, rightsStatus = 'pending_review', rightsHolder = null, licenseReference = null, changeNote = null }) => {
    try {
      set({ loading: true, error: null });
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in to suggest a translation');

      let translation = get().translations.find((item) => item.language_code === languageCode);
      if (!translation) {
        const translationInput: TranslationInsert = {
          lyrics_id: lyricsId,
          language_code: languageCode,
          translated_text: translatedText,
          submitted_by: authData.user.id,
          status: 'pending',
          verified: false,
          rights_status: rightsStatus,
          rights_holder: rightsHolder,
          license_reference: licenseReference,
          allowed_display: false,
        };
        const { data, error } = await supabase.from('translations').insert([translationInput]).select('*').single();
        if (error) throw error;
        translation = data;
      } else if (translation.submitted_by === authData.user.id && translation.status === 'pending') {
        const { data, error } = await supabase
          .from('translations')
          .update({ translated_text: translatedText, rights_status: rightsStatus, rights_holder: rightsHolder, license_reference: licenseReference, updated_at: new Date().toISOString() })
          .eq('id', translation.id)
          .select('*')
          .single();
        if (error) throw error;
        translation = data;
      }

      if (!translation) throw new Error('Could not resolve the translation record');
      const translationRecord = translation;
      const versionInput: TranslationVersionInsert = {
        translation_id: translationRecord.id,
        version_number: 0,
        translated_text: translatedText,
        submitted_by: authData.user.id,
        status: 'pending',
        verified: false,
        rights_status: rightsStatus,
        rights_holder: rightsHolder,
        license_reference: licenseReference,
        allowed_display: false,
        change_note: changeNote,
      };
      const { data: version, error: versionError } = await supabase.from('translation_versions').insert([versionInput]).select('*').single();
      if (versionError) throw versionError;
      await Promise.all([get().fetchForLyrics(lyricsId), get().fetchVersions(translationRecord.id)]);
      return version;
    } catch (error) {
      set({ error: cleanError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
