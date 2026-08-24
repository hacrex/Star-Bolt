import type { AIProviderId } from './aiProviders';
import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface ShortItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  url: string;
}

export interface MusicMatch {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  thumbnailUrl: string | null;
  spotifyUrl: string | null;
  source: 'spotify' | 'musixmatch';
  lyricsAvailable: boolean;
  languageCode?: string | null;
}

interface PublicMediaResponse<T> {
  configured: boolean;
  items?: T[];
  matches?: T[];
  error?: string;
}

const publicFunction = async <T>(body: Record<string, unknown>): Promise<T> => {
  if (!SUPABASE_URL || !ANON_KEY) throw new Error('The public catalog service is not configured.');
  const response = await fetch(`${SUPABASE_URL}/functions/v1/search-media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'The public catalog is unavailable right now.');
  return data;
};

export const getPublicShorts = async (): Promise<PublicMediaResponse<ShortItem>> => {
  if (SUPABASE_URL && ANON_KEY) {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('youtube_video_id, title, description, thumbnail_url, published_at, youtube_url')
      .eq('is_public', true)
      .eq('content_type', 'short')
      .order('published_at', { ascending: false })
      .limit(12);
    if (!error && data && data.length > 0) {
      return {
        configured: true,
        items: data.map((item) => ({
          id: item.youtube_video_id,
          title: item.title,
          description: item.description,
          thumbnailUrl: item.thumbnail_url || `https://i.ytimg.com/vi/${item.youtube_video_id}/hqdefault.jpg`,
          publishedAt: item.published_at,
          url: item.youtube_url,
        })),
      };
    }
  }
  return publicFunction<PublicMediaResponse<ShortItem>>({ action: 'shorts' });
};

export const searchMusicCatalog = async (query: string): Promise<PublicMediaResponse<MusicMatch>> => publicFunction<PublicMediaResponse<MusicMatch>>({ action: 'lyrics', query: query.trim() });

export interface AuthorizedLyricsResponse {
  configured: boolean;
  trackId: string;
  title: string;
  artist: string;
  lyrics: string | null;
  rightsStatus: 'authorized' | 'pending' | 'unavailable';
  notice: string;
}

export const getAuthorizedLyrics = async (source: 'musixmatch', trackId: string): Promise<AuthorizedLyricsResponse> => publicFunction<AuthorizedLyricsResponse>({ action: 'lyrics_detail', source, trackId });

export const supportedByokProviders: AIProviderId[] = ['openai', 'gemini', 'openrouter', 'custom_openai'];
