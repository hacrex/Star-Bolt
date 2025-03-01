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
    return <div className="text-center py-8">Loading playlists...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            to={`/playlists/${playlist.id}`}
            className="bg-gray-800 rounded-lg p-6 hover:ring-2 hover:ring-purple-500 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <ListMusic className="w-8 h-8 text-purple-400" />
              <h2 className="text-xl font-semibold">{playlist.name}</h2>
            </div>
            <p className="text-sm text-gray-400">
              Created {new Date(playlist.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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