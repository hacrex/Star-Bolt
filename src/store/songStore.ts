import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];

interface SongState {
  songs: Song[];
  loading: boolean;
  fetchSongs: () => Promise<void>;
  addSong: (song: Omit<Song, 'id' | 'created_at'>) => Promise<void>;
  updateSong: (songId: string, updates: Partial<Song>) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
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
  updateSong: async (songId, updates) => {
    const { error } = await supabase
      .from('songs')
      .update(updates)
      .eq('id', songId);

    if (error) throw error;
    set(state => ({
      songs: state.songs.map(s => s.id === songId ? { ...s, ...updates } : s)
    }));
  },
  deleteSong: async (songId) => {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) throw error;
    set(state => ({
      songs: state.songs.filter(s => s.id !== songId)
    }));
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