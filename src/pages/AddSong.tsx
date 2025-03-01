import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongStore } from '../store/songStore';
import { useAuthStore } from '../store/authStore';

const AddSong = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addSong } = useSongStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [formData, setFormData] = React.useState({
    title: '',
    artist: '',
    album: '',
    release_date: '',
    thumbnail_url: '',
  });

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('Must be logged in');
      
      await addSong({
        ...formData,
        created_by: user.id,
      });
      
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Song</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Artist *</label>
          <input
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Album</label>
          <input
            type="text"
            name="album"
            value={formData.album}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Release Date</label>
          <input
            type="date"
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <input
            type="url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Adding Song...' : 'Add Song'}
        </button>
      </form>
    </div>
  );
};

export default AddSong;