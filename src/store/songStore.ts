import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];

interface SongState {
  songs: Song[];
  loading: boolean;
  fetchSongs: () => Promise<void>;
  addSong: (song: Omit<Song, 'id' | 'created_at'>) => Promise<void>;
  rateSong: (songId: string, score: number) => Promise<void>;
  addComment: (songId: string, content: string) => Promise<void>;
}

export const useSongStore = create<SongState>((set, get) => ({
  songs: [],
  loading: false,
  fetchSongs: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ songs: data || [] });
    } finally {
      set({ loading: false });
    }
  },
  addSong: async (song) => {
    const { error } = await supabase
      .from('songs')
      .insert([song]);
    
    if (error) throw error;
    await get().fetchSongs();
  },
  rateSong: async (songId, score) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to rate songs');

    const { error } = await supabase
      .from('ratings')
      .upsert([{
        song_id: songId,
        user_id: user.id,
        score,
      }]);
    
    if (error) throw error;
  },
  addComment: async (songId, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to comment');

    const { error } = await supabase
      .from('comments')
      .insert([{
        song_id: songId,
        user_id: user.id,
        content,
      }]);
    
    if (error) throw error;
  },
}));