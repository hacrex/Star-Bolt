import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/Toast';
import { ListMusic, Music2, Trash2, ArrowLeft } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];

interface PlaylistSong {
  id: string;
  song: Song;
}

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [playlistName, setPlaylistName] = React.useState('');
  const [songs, setSongs] = React.useState<PlaylistSong[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchPlaylist = async () => {
      try {
        const { data: playlist, error: playlistError } = await supabase
          .from('playlists')
          .select('name')
          .eq('id', id)
          .single();

        if (playlistError) throw playlistError;
        setPlaylistName(playlist.name);

        const { data: playlistSongs, error: songsError } = await supabase
          .from('playlist_songs')
          .select('id, song:songs(*)')
          .eq('playlist_id', id)
          .order('added_at', { ascending: false });

        if (songsError) throw songsError;
        setSongs((playlistSongs || []) as unknown as PlaylistSong[]);
      } catch {
        showToast('Failed to load playlist', 'error');
        navigate('/playlists');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaylist();
  }, [id, user, navigate, showToast]);

  const handleRemoveSong = async (playlistSongId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('id', playlistSongId);

      if (error) throw error;
      setSongs(songs.filter(s => s.id !== playlistSongId));
      showToast('Song removed from playlist', 'success');
    } catch {
      showToast('Failed to remove song', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading playlist...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/playlists" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Playlists
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <ListMusic className="w-10 h-10 text-purple-400" />
        <h1 className="text-3xl font-bold">{playlistName}</h1>
      </div>

      {songs.length > 0 ? (
        <div className="space-y-3">
          {songs.map((ps) => (
            <div
              key={ps.id}
              className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
            >
              {ps.song.thumbnail_url ? (
                <img
                  src={ps.song.thumbnail_url}
                  alt={ps.song.title}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <Link to={`/songs/${ps.song.id}`} className="flex-1">
                <h3 className="font-semibold">{ps.song.title}</h3>
                <p className="text-sm text-gray-400">{ps.song.artist}</p>
              </Link>
              <button
                onClick={() => handleRemoveSong(ps.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Remove from playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <ListMusic className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>This playlist is empty</p>
          <Link to="/search" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
            Find songs to add
          </Link>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
