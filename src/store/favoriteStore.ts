import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface FavoriteStore {
  favorites: string[];
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (songId: string) => Promise<void>;
  isFavorite: (songId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  loading: false,
  fetchFavorites: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('favorites')
        .select('song_id');
      
      if (error) throw error;
      set({ favorites: data?.map(f => f.song_id) || [] });
    } finally {
      set({ loading: false });
    }
  },
  toggleFavorite: async (songId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to manage favorites');

    const isFavorite = get().favorites.includes(songId);
    
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, song_id: songId });
      
      if (error) throw error;
      set(state => ({
        favorites: state.favorites.filter(id => id !== songId)
      }));
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, song_id: songId }]);
      
      if (error) throw error;
      set(state => ({
        favorites: [...state.favorites, songId]
      }));
    }
  },
  isFavorite: (songId: string) => {
    return get().favorites.includes(songId);
  },
}));