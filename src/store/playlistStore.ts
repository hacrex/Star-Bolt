import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Playlist {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface PlaylistStore {
  playlists: Playlist[];
  loading: boolean;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  loading: false,
  fetchPlaylists: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ playlists: data || [] });
    } finally {
      set({ loading: false });
    }
  },
  createPlaylist: async (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error('Playlist name is required');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to create playlists');

    const { data, error } = await supabase
      .from('playlists')
      .insert([{ name: normalizedName, user_id: user.id }])
      .select('*')
      .single();

    if (error) throw error;
    await get().fetchPlaylists();
    return data;
  },
  deletePlaylist: async (playlistId: string) => {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) throw error;
    set(state => ({
      playlists: state.playlists.filter(p => p.id !== playlistId)
    }));
  },
  addSongToPlaylist: async (playlistId: string, songId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to manage playlists');
    const { error } = await supabase
      .from('playlist_songs')
      .insert([{ playlist_id: playlistId, song_id: songId }]);
    
    if (error) throw error;
  },
  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .match({ playlist_id: playlistId, song_id: songId });
    
    if (error) throw error;
  },
}));