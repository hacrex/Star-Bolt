import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock3, Languages, Music2, PlayCircle, Search as SearchIcon, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { DISCOVERY_MOODS, LANGUAGE_OPTIONS, languageLabel } from '../lib/discovery';

type Song = Database['public']['Tables']['songs']['Row'];

const POPULAR_SEARCHES = ['Neon Nights', 'Midnight City', 'Taylor Swift', 'The Weeknd'];
const MOCK_ARTISTS = [
  { name: 'The Midnight Runners', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
  { name: 'Sarah Vance', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [language, setLanguage] = useState(searchParams.get('language') || 'all');
  const [activeMood, setActiveMood] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const searches = localStorage.getItem('recentSearches');
    if (searches) setRecentSearches(JSON.parse(searches));
  }, []);

  const addToRecentSearches = useCallback((searchQuery: string) => {
    setRecentSearches((current) => {
      const updated = [searchQuery, ...current.filter((item) => item !== searchQuery)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${trimmed}%,artist.ilike.%${trimmed}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
      addToRecentSearches(trimmed);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [addToRecentSearches]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setSearchParams(searchQuery.trim() ? { q: searchQuery.trim() } : {});

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => performSearch(searchQuery), 280);
  }, [performSearch, setSearchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get('q') || '';
    setQuery(currentQuery);
    if (currentQuery.length >= 2) performSearch(currentQuery);
  }, [performSearch, searchParams]);

  const visibleResults = results.filter((song) => {
    const matchesLanguage = language === 'all' || song.language === language;
    const matchesMood = !activeMood || `${song.title} ${song.artist} ${song.album || ''}`.toLowerCase().includes(activeMood);
    return matchesLanguage && matchesMood;
  });

  const updateLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    const nextParams = new URLSearchParams(searchParams);
    if (nextLanguage === 'all') nextParams.delete('language');
    else nextParams.set('language', nextLanguage);
    setSearchParams(nextParams);
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <section className="mx-auto flex max-w-3xl flex-col items-center pt-2 text-center sm:pt-6">
        <p className="eyebrow">Infinite search field</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">Find the moment.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">Search songs, artists, lyrics, or the cinematic feeling you want to return to.</p>
        <div className="mt-8 w-full rounded-full transition-transform focus-within:scale-[1.01] focus-within:shadow-[0_0_24px_rgba(212,168,67,0.14)]">
          <label htmlFor="search-page-input" className="sr-only">Search songs, artists, lyrics, or cinematic moments</label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" aria-hidden="true" />
            <input id="search-page-input" type="search" value={query} onChange={(event) => handleSearch(event.target.value)} placeholder="Search songs, artists, lyrics, or cinematic moments..." className="h-16 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-4 pl-14 pr-6 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" autoFocus />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {recentSearches.slice(0, 3).map((search) => <button type="button" key={search} onClick={() => handleSearch(search)} className="search-chip"><Clock3 className="h-3.5 w-3.5" />{search}</button>)}
          <span className="mx-1 h-1 w-1 rounded-full bg-[var(--text-muted)]/40" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--text-muted)]"><TrendingUp className="h-3.5 w-3.5 text-[var(--gold-light)]" /> Trending:</span>
          {POPULAR_SEARCHES.slice(0, 2).map((search) => <button type="button" key={search} onClick={() => handleSearch(search)} className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--gold-light)]">{search}</button>)}
        </div>
        <div className="mt-8 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 p-4 text-left sm:p-5"><div className="flex items-center gap-2"><Languages className="h-4 w-4 text-[var(--gold-light)]" /><span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Filter the field</span></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{LANGUAGE_OPTIONS.map((option) => <button type="button" key={option.code} onClick={() => updateLanguage(option.code)} className={`language-tab ${language === option.code ? 'is-active' : ''}`}>{option.label}</button>)}</div><div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{DISCOVERY_MOODS.map((mood) => <button type="button" key={mood.query} onClick={() => setActiveMood(activeMood === mood.query ? '' : mood.query)} className={`mood-chip ${mood.accent} ${activeMood === mood.query ? 'is-active' : ''}`}>{mood.label}</button>)}</div></div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">{query ? 'Top matches' : 'Begin anywhere'}</p><h2 className="section-heading mt-2">{query ? 'Results' : 'Songs to revisit'}</h2></div>{query && <span className="font-mono text-xs text-[var(--text-muted)]">{loading ? 'Searching…' : `${visibleResults.length} matches`}</span>}</div>
          {loading ? <div className="grid gap-3" role="status" aria-label="Searching"><div className="h-24 animate-pulse rounded-xl bg-[var(--bg-surface)]" /><div className="h-24 animate-pulse rounded-xl bg-[var(--bg-surface)]" /></div> : visibleResults.length > 0 ? <div className="grid gap-3">{visibleResults.map((song) => <SongResult key={song.id} song={song} />)}</div> : query.length > 1 ? <div className="surface-card empty-state-card"><span className="empty-state-icon"><SearchIcon className="h-5 w-5" /></span><h3>No lines in this filter.</h3><p>Try another language or mood, then follow the feeling somewhere new.</p><button type="button" className="btn-secondary" onClick={() => { setLanguage('all'); setActiveMood(''); }}>Reset filters</button></div> : <div className="grid gap-3">{recentSearches.length > 0 ? recentSearches.slice(0, 3).map((search) => <button type="button" key={search} onClick={() => handleSearch(search)} className="surface-card surface-card-hover flex items-center justify-between p-4 text-left"><span className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-[var(--gold-light)]" /><span className="text-sm text-[var(--text-primary)]">{search}</span></span><ArrowRight className="h-4 w-4 text-[var(--text-muted)]" /></button>) : <div className="surface-card empty-state-card"><span className="empty-state-icon"><SearchIcon className="h-5 w-5" /></span><h3>Search above to find your next line.</h3><p>Try a title, an artist, a mood, or a language.</p></div>}</div>}

          <div className="mt-10"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold text-[var(--text-primary)]">Lyric videos</h3><Link to="/videos" className="text-sm font-semibold text-[var(--gold-light)]">View all <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div><div className="grid gap-4 sm:grid-cols-2"><VideoResult title="Echoes in the Rain" meta="4.2M views" image="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&q=80" /><VideoResult title="Golden Hour (Acoustic)" meta="1.1M views" image="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80" /></div></div>
        </div>

        <aside className="md:col-span-4"><div className="mb-5"><p className="eyebrow">Discovery rail</p><h2 className="section-heading mt-2">Artists</h2></div><div className="grid grid-cols-2 gap-4">{MOCK_ARTISTS.map((artist) => <Link to={`/search?q=${encodeURIComponent(artist.name)}`} key={artist.name} className="group text-center"><img src={artist.image} alt={artist.name} className="mx-auto aspect-square w-24 rounded-full border-2 border-transparent object-cover transition duration-200 group-hover:scale-105 group-hover:border-[var(--gold-primary)]" /><span className="mt-3 block text-sm text-[var(--text-secondary)] transition-colors group-hover:text-[var(--gold-light)]">{artist.name}</span></Link>)}</div><div className="surface-card mt-8 p-5"><p className="eyebrow">Popular right now</p><div className="mt-4 flex flex-wrap gap-2">{POPULAR_SEARCHES.map((search) => <button type="button" key={search} onClick={() => handleSearch(search)} className="search-chip">{search}</button>)}</div></div></aside>
      </section>
    </div>
  );
};

const SongResult: React.FC<{ song: Song }> = ({ song }) => <Link to={`/songs/${song.id}`} className="surface-card surface-card-hover group flex items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-4">{song.thumbnail_url ? <img src={song.thumbnail_url} alt={song.title} className="h-16 w-16 shrink-0 rounded-md object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[var(--bg-elevated)] text-[var(--gold-muted)]"><Music2 className="h-7 w-7" /></div>}<div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--gold-light)]">{song.title}</h3><span className="hidden rounded-full border border-[rgba(212,168,67,0.28)] px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-[var(--gold-light)] sm:inline">{languageLabel(song.language)}</span></div><p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{song.artist}{song.album ? ` • ${song.album}` : ''}</p><p className="mt-1 truncate font-serif text-sm italic text-[var(--text-muted)]">“A line waiting to be remembered…”</p></div></div><PlayCircle className="h-5 w-5 shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--gold-light)]" /></Link>;

const VideoResult: React.FC<{ title: string; meta: string; image: string }> = ({ title, meta, image }) => <a href="https://youtube.com/@starlyrix" target="_blank" rel="noopener noreferrer" className="surface-card surface-card-hover group overflow-hidden"><div className="relative aspect-video overflow-hidden"><img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" /><div className="absolute inset-0 flex items-center justify-center bg-black/35"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-primary)] text-[#17120a]"><PlayCircle className="h-5 w-5 fill-current" /></span></div><span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 font-mono text-[0.62rem] text-white">4:12</span></div><div className="p-3"><h4 className="truncate text-sm font-medium text-[var(--text-primary)]">{title} (Official Lyric Video)</h4><p className="mt-1 font-mono text-[0.62rem] text-[var(--text-muted)]">{meta}</p></div></a>;

export default Search;
