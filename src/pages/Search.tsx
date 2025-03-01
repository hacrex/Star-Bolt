import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search as SearchIcon, Music2, Star, Clock } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Taylor Swift', 'Ed Sheeran', 'Drake', 'Adele', 'The Weeknd'
  ]);

  useEffect(() => {
    const searches = localStorage.getItem('recentSearches');
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  const addToRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 2) {
      setResults([]);
      setSearchParams({});
      return;
    }

    setSearchParams({ q: searchQuery });
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
      addToRecentSearches(searchQuery);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('q')) {
      handleSearch(searchParams.get('q') || '');
    }
  }, [searchParams]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Search Songs</h1>
      
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for songs, artists, or lyrics..."
          className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-8">Searching...</div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((song) => (
            <Link
              key={song.id}
              to={`/songs/${song.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                {song.thumbnail_url ? (
                  <img
                    src={song.thumbnail_url}
                    alt={song.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{song.artist}</p>
                  {song.album && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Album: {song.album}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query.length > 1 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          No results found for "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Searches
            </h2>
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {search}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent searches</p>
            )}
          </div>

          {/* Popular Searches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Popular Searches
            </h2>
            <div className="space-y-2">
              {popularSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;