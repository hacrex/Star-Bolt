import React from 'react';
import { ArrowRight, BookOpen, Languages, Music2, Play, Plus, Search, Share2, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSongStore } from '../store/songStore';
import { DISCOVERY_MOODS, LANGUAGE_LABELS, LANGUAGE_OPTIONS, languageLabel, readRecentSongs, rememberSong } from '../lib/discovery';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];

const BENTO_ART = [
  { title: 'Velvet Underground', artist: 'Neon Nights', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=85', span: 'col-span-2 md:col-span-4' },
  { title: 'Echoes of Time', artist: 'The Silhouettes', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1000&q=85', span: 'col-span-2 md:col-span-4' },
  { title: 'City Rain', artist: 'Marcus Dean', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000&q=85', span: 'col-span-4 md:col-span-4' },
];

const LYRIC_PULSES = [
  { line: 'Somewhere between the noise and the night, I found my way back.', source: 'A line for the soft-hearted' },
  { line: 'The city keeps a secret for everyone who stays awake.', source: 'A line for the night owls' },
  { line: 'Let the old story end where the new light begins.', source: 'A line for your next chapter' },
];

const Home = () => {
  const { songs, loading, fetchSongs } = useSongStore();
  const { user } = useAuthStore();
  const [language, setLanguage] = React.useState('all');
  const [activeMood, setActiveMood] = React.useState('all');
  const [recentSongs, setRecentSongs] = React.useState(readRecentSongs);

  React.useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const filteredSongs = React.useMemo(() => songs.filter((song) => {
    const matchesLanguage = language === 'all' || song.language === language;
    const searchText = `${song.title} ${song.artist} ${song.album || ''}`.toLowerCase();
    const matchesMood = activeMood === 'all' || searchText.includes(activeMood);
    return matchesLanguage && matchesMood;
  }), [activeMood, language, songs]);

  const featuredSong = filteredSongs[0] || songs[0];
  const featuredImage = featuredSong?.thumbnail_url || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1800&q=85';
  const pulse = LYRIC_PULSES[(songs.length + recentSongs.length) % LYRIC_PULSES.length];
  const tasteLabel = language === 'all' ? 'multilingual' : languageLabel(language);

  const rememberAndOpen = (song: Song) => {
    rememberSong({ id: song.id, title: song.title, artist: song.artist, thumbnailUrl: song.thumbnail_url, language: song.language });
    setRecentSongs(readRecentSongs());
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-10 md:space-y-12">
      <section className="home-intro-grid">
        <div>
          <p className="eyebrow">Your lyric lounge</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl">Cinema for your Ears<span className="home-title-dot">.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">Find the line that found you. Discover songs by feeling, read them slowly, and keep the moments that stay.</p>
        </div>
        <div className="taste-profile-card">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Your taste, lately</p><h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{recentSongs.length > 0 ? 'You have been reading deeply.' : 'Your next obsession is waiting.'}</h2></div><span className="taste-profile-orbit"><Sparkles className="h-4 w-4" /></span></div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{recentSongs.length > 0 ? `A ${tasteLabel} shelf with ${recentSongs.length} recent ${recentSongs.length === 1 ? 'read' : 'reads'}.` : 'Start a shelf of songs, lines, and late-night discoveries.'}</p>
          <Link to={recentSongs[0] ? `/songs/${recentSongs[0].id}` : '/search'} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-light)]">{recentSongs[0] ? 'Continue reading' : 'Find your first line'} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section>
        <div className="grid auto-rows-[200px] grid-cols-4 gap-5 md:auto-rows-[260px] md:grid-cols-12">
          <Link to="/videos" className="stitch-bento-card group relative col-span-4 row-span-2 overflow-hidden md:col-span-8">
            <img src={featuredImage} alt="Cinematic music experience" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/55 to-transparent" />
            <span className="absolute left-6 top-6 rounded-full border border-[rgba(242,195,91,0.3)] bg-[rgba(20,19,15,0.65)] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--gold-light)] backdrop-blur-md">Featured cinematic experience</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(242,195,91,0.45)] bg-[rgba(242,195,91,0.18)] text-[var(--gold-light)] backdrop-blur-md"><Play className="ml-1 h-7 w-7 fill-current" /></span></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8"><h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] md:text-4xl">The Architecture of Silence</h2><p className="mt-2 max-w-xl font-serif text-lg italic leading-8 text-[var(--text-secondary)]">“In the spaces between the notes, that&apos;s where the story unfolds...”</p></div>
          </Link>

          <Link to={featuredSong ? `/songs/${featuredSong.id}` : '/search'} onClick={() => featuredSong && rememberAndOpen(featuredSong)} className="stitch-bento-card group relative col-span-4 row-span-2 flex flex-col overflow-hidden">
            <div className="relative h-1/2 overflow-hidden"><img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&q=85" alt="Vintage microphone in warm light" className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] to-transparent" /></div>
            <div className="flex flex-1 flex-col justify-between p-5"><div><p className="eyebrow">Lyric pulse</p><p className="mt-4 line-clamp-3 font-serif text-2xl italic leading-tight text-[var(--text-primary)]">“{pulse.line}”</p></div><div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-[var(--text-primary)]">{featuredSong?.title || 'Midnight Hour'}</h3><p className="text-sm text-[var(--text-secondary)]">{featuredSong?.artist || pulse.source}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(242,195,91,0.35)] text-[var(--gold-light)] transition-colors group-hover:bg-[var(--gold-primary)] group-hover:text-[#17120a]"><ArrowRight className="h-4 w-4" /></span></div></div>
          </Link>

          {BENTO_ART.map((card) => <Link key={card.title} to="/search" className={`stitch-bento-card group relative overflow-hidden ${card.span}`}><img src={card.image} alt={card.title} className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/80 to-transparent" /><div className="relative z-10 flex h-full flex-col justify-end p-5"><h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{card.title}</h3><p className="truncate text-sm text-[var(--text-secondary)]">{card.artist}</p></div></Link>)}
        </div>
      </section>

      <section className="discovery-control-panel">
        <div><p className="eyebrow">Tune the atmosphere</p><h2 className="section-heading mt-2">What are you feeling?</h2></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{DISCOVERY_MOODS.map((mood) => <button type="button" key={mood.query} onClick={() => setActiveMood(activeMood === mood.query ? 'all' : mood.query)} className={`mood-chip ${mood.accent} ${activeMood === mood.query ? 'is-active' : ''}`}>{mood.label}</button>)}</div>
        <div className="mt-5 flex items-center gap-3 overflow-x-auto border-t border-[var(--border-subtle)] pt-4 scrollbar-hide"><Languages className="h-4 w-4 shrink-0 text-[var(--gold-light)]" aria-hidden="true" /><span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Read in</span>{LANGUAGE_OPTIONS.map((option) => <button type="button" key={option.code} onClick={() => setLanguage(option.code)} className={`language-tab ${language === option.code ? 'is-active' : ''}`}>{option.label}</button>)}</div>
      </section>

      {recentSongs.length > 0 && <section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Pick up where you left off</p><h2 className="section-heading mt-2">Your recent shelf</h2></div><Link to="/playlists" className="text-sm font-semibold text-[var(--gold-light)]">Open library <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{recentSongs.slice(0, 3).map((song) => <Link key={song.id} to={`/songs/${song.id}`} className="recent-shelf-card" onClick={() => rememberAndOpen({ ...song, language: song.language || 'en' } as Song)}><span className="recent-shelf-index">0{recentSongs.indexOf(song) + 1}</span>{song.thumbnailUrl ? <img src={song.thumbnailUrl} alt="" /> : <span className="recent-shelf-cover"><Music2 className="h-5 w-5" /></span>}<span className="min-w-0"><strong>{song.title}</strong><small>{song.artist}</small></span><ArrowRight className="ml-auto h-4 w-4 text-[var(--text-muted)]" /></Link>)}</div></section>}

      <section className="stitch-home-discovery">
        <div className="stitch-home-discovery-copy"><p className="eyebrow">The archive is alive</p><h2>Make room for the lines that find you.</h2><p>Search the community catalog, read in the Reading Room, or shape something original in the lyric studio.</p><div className="flex flex-wrap gap-3"><Link to="/search" className="btn-primary"><BookOpen className="h-4 w-4" /> Explore lyrics</Link><Link to="/ai-lyrics" className="btn-secondary"><Wand2 className="h-4 w-4" /> Create lyrics</Link>{user && <Link to="/add-song" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--gold-light)] hover:bg-[var(--bg-elevated)]"><Plus className="h-4 w-4" /> Contribute</Link>}</div></div><div className="stitch-home-discovery-side"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-[var(--gold-light)]" /><span>Infinite search</span></div><div className="flex items-center gap-2"><Share2 className="h-4 w-4 text-[var(--gold-light)]" /><span>Community notes</span></div><div className="flex items-center gap-2"><Music2 className="h-4 w-4 text-[var(--gold-light)]" /><span>{loading ? 'Loading archive' : `${songs.length || '10+'} voices in the archive`}</span></div></div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Freshly added {language !== 'all' ? `· ${LANGUAGE_LABELS[language]}` : ''}</p><h2 className="section-heading mt-2">Latest songs</h2></div><div className="flex gap-2"><Link to="/search" className="btn-secondary text-sm">Browse all</Link>{user && <Link to="/add-song" className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add song</Link>}</div></div>
        {loading ? <div className="reading-room-loading min-h-40">Loading the archive...</div> : filteredSongs.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredSongs.slice(0, 6).map((song) => <SongCard key={song.id} song={song} onOpen={() => rememberAndOpen(song)} />)}</div> : <div className="surface-card empty-state-card"><span className="empty-state-icon"><Music2 className="h-5 w-5" /></span><h3>No songs in this atmosphere yet.</h3><p>Try another mood or language, then follow the line somewhere new.</p><button type="button" className="btn-secondary" onClick={() => { setActiveMood('all'); setLanguage('all'); }}>Reset discovery</button></div>}
      </section>
    </div>
  );
};

const SongCard: React.FC<{ song: Song; onOpen: () => void }> = ({ song, onOpen }) => <Link to={`/songs/${song.id}`} onClick={onOpen} className="surface-card surface-card-hover group overflow-hidden"><div className="relative h-48 overflow-hidden">{song.thumbnail_url ? <img src={song.thumbnail_url} alt={song.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-[var(--bg-elevated)] text-[var(--gold-muted)]"><Music2 className="h-10 w-10" /></div>}<span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-[var(--gold-light)]">{languageLabel(song.language)} · Reading Room</span><span className="song-card-open"><ArrowRight className="h-4 w-4" /></span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{song.title}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{song.artist}</p></div><span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">New</span></div><p className="mt-4 font-serif text-sm italic text-[var(--text-muted)]">A line waiting to be remembered.</p></div></Link>;

export default Home;
