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
    return <div className="reading-room-loading">Opening playlist...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/playlists" className="reading-room-back mb-6">

        <ArrowLeft className="w-4 h-4" />
        Back to playlists
      </Link>

      <div className="mb-8 flex items-end gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(212,168,67,0.1)] text-[var(--gold-light)]"><ListMusic className="h-7 w-7" /></span><div><p className="eyebrow">Your collection</p><h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">{playlistName}</h1></div></div>

      {songs.length > 0 ? (
        <div className="grid gap-3">
          {songs.map((ps) => (
            <div
              key={ps.id}
              className="surface-card surface-card-hover flex items-center gap-4 p-4"
            >
              {ps.song.thumbnail_url ? (
                <img
                  src={ps.song.thumbnail_url}
                  alt={ps.song.title}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--bg-elevated)] text-[var(--gold-muted)]">
                  <Music2 className="h-6 w-6" />
                </div>
              )}
              <Link to={`/songs/${ps.song.id}`} className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)]">{ps.song.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{ps.song.artist}</p>
              </Link>
              <button
                onClick={() => handleRemoveSong(ps.id)}
                className="icon-button hover:!text-red-300"
                title="Remove from playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface-card py-12 text-center text-[var(--text-secondary)]">
          <ListMusic className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>This playlist is empty</p>
          <Link to="/search" className="mt-2 inline-block text-[var(--gold-light)] hover:text-[var(--text-primary)]">
            Find songs to add
          </Link>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
