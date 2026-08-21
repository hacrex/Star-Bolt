import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-2xl" role="search">
      <label htmlFor="global-search" className="sr-only">Search songs, artists, or lyrics</label>
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gold-muted)]" aria-hidden="true" />
      <input
        id="global-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search songs, artists, or lyrics..."
        className="h-14 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 pl-14 pr-28 text-[var(--text-primary)] shadow-[var(--shadow-card)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,168,67,0.18)]"
      />
      <button type="submit" className="btn-primary absolute right-2 top-2 h-10 !rounded-xl !px-4 text-sm">
        Search
      </button>
    </form>
  );
};

export default SearchBar;