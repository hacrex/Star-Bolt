import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists, or lyrics..."
          className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;