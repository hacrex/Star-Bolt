import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSongStore } from '../store/songStore';
import { Plus, Music2, Wand2, Sparkles, Globe2, Share2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FeaturedCarousel from '../components/FeaturedCarousel';
import CategorySection from '../components/CategorySection';
import FeaturedArtist from '../components/FeaturedArtist';
import TopNewSongs from '../components/TopNewSongs';
import TrendingSection from '../components/TrendingSection';

const Home = () => {
  const { songs, loading, fetchSongs } = useSongStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <div>
      {/* Hero Section with AI Feature Highlight */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Create, Share, and Discover Lyrics
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Join our community of music lovers to explore, contribute, and connect through lyrics
        </p>
        <div className="mb-12">
          <SearchBar />
        </div>

        {/* AI Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full">
              <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create unique lyrics with our advanced AI technology
            </p>
            <Link
              to="/ai-lyrics"
              className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline"
            >
              Try Now <Sparkles className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full">
              <Globe2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multilingual Support</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Translate lyrics into multiple languages instantly
            </p>
            <Link
              to="/ai-lyrics"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              Translate Now <Globe2 className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto bg-green-100 dark:bg-green-900 rounded-full">
              <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share your lyrics across social media platforms
            </p>
            <Link
              to="/generated-lyrics"
              className="inline-flex items-center text-green-600 dark:text-green-400 hover:underline"
            >
              View Library <Share2 className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <FeaturedCarousel />
      
      {!user && <FeaturedArtist />}
      
      <CategorySection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <TrendingSection />
        <TopNewSongs />
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Latest Songs</h2>
          <div className="flex gap-4">
            {user && (
              <Link
                to="/add-song"
                className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Song
              </Link>
            )}
            <Link
              to="/ai-lyrics"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Wand2 className="w-4 h-4" />
              Generate with AI
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-center col-span-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : songs.length > 0 ? (
            songs.map((song) => (
              <Link
                key={song.id}
                to={`/songs/${song.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
              >
                {song.thumbnail_url ? (
                  <img
                    src={song.thumbnail_url}
                    alt={song.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Music2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-1">{song.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{song.artist}</p>
                  {song.album && (
                    <p className="text-sm text-gray-500 mt-1">{song.album}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center col-span-full text-gray-600 dark:text-gray-400">
              No songs available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;