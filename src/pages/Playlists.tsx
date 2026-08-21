import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import { Plus, ListMusic } from 'lucide-react';

const Playlists = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { playlists, loading, createPlaylist, fetchPlaylists } = usePlaylistStore();
  const [newPlaylistName, setNewPlaylistName] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPlaylists();
  }, [user, navigate, fetchPlaylists]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  if (loading) {
    return <div className="reading-room-loading">Loading your playlists...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Your library</p><h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">Your playlists</h1></div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create playlist
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            to={`/playlists/${playlist.id}`}
            className="surface-card surface-card-hover p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,168,67,0.1)] text-[var(--gold-light)]"><ListMusic className="h-5 w-5" /></span>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{playlist.name}</h2>
            </div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Created {new Date(playlist.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-md p-6">
            <p className="eyebrow">New collection</p><h3 className="mt-2 text-xl font-bold text-[var(--text-primary)]">Create new playlist</h3>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="mb-4 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary !border-0 !bg-transparent !px-3 !py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;