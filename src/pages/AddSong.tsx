import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongStore } from '../store/songStore';
import { useAuthStore } from '../store/authStore';

const URL_REGEX = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.thumbnail_url && !URL_REGEX.test(formData.thumbnail_url)) {
      setError('Thumbnail URL must be a valid image URL (jpg, png, gif, webp, svg)');
      return;
    }

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
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label htmlFor="artist" className="block text-sm font-medium mb-1">Artist *</label>
          <input
            id="artist"
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label htmlFor="album" className="block text-sm font-medium mb-1">Album</label>
          <input
            id="album"
            type="text"
            name="album"
            value={formData.album}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="release_date" className="block text-sm font-medium mb-1">Release Date</label>
          <input
            id="release_date"
            type="date"
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <input
            id="thumbnail_url"
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