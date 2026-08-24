import React from 'react';
import { ArrowLeft, ExternalLink, Headphones, Loader2, Music2, Search, ShieldCheck } from 'lucide-react';
import { getAuthorizedLyrics, searchMusicCatalog, type AuthorizedLyricsResponse, type MusicMatch } from '../lib/publicMedia';

const LyricsReader = () => {
  const [query, setQuery] = React.useState('');
  const [matches, setMatches] = React.useState<MusicMatch[]>([]);
  const [selected, setSelected] = React.useState<MusicMatch | null>(null);
  const [lyrics, setLyrics] = React.useState<AuthorizedLyricsResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [lyricsLoading, setLyricsLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setLoading(true);
    setError('');
    setSelected(null);
    setLyrics(null);
    try {
      const result = await searchMusicCatalog(trimmed);
      setMatches(result.matches || []);
      setSearched(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The catalog could not be reached.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const openLyrics = async (match: MusicMatch) => {
    setSelected(match);
    setLyrics(null);
    if (match.source !== 'musixmatch') return;
    setLyricsLoading(true);
    try {
      setLyrics(await getAuthorizedLyrics('musixmatch', match.id));
    } catch {
      setLyrics({ configured: false, trackId: match.id, title: match.title, artist: match.artist, lyrics: null, rightsStatus: 'unavailable', notice: 'Lyrics are unavailable through the authorized provider connection.' });
    } finally {
      setLyricsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-[rgba(212,168,67,0.22)] bg-[linear-gradient(135deg,var(--bg-surface),var(--bg-elevated))] p-6 sm:p-10"><div className="relative max-w-3xl"><p className="eyebrow">Star Lyrix Reading Room</p><h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl">Find the song. Read the line.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">Search catalog metadata with Spotify, then open lyrics only when an authorized Musixmatch source makes them available. No scraped lyrics. No hidden copy.</p><form onSubmit={handleSearch} className="mt-7 flex flex-col gap-2 sm:flex-row"><label htmlFor="lyrics-reader-search" className="sr-only">Search songs and artists</label><div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gold-light)]" aria-hidden="true" /><input id="lyrics-reader-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a song or artist" className="ai-studio-control w-full !py-3 !pl-11" maxLength={120} /></div><button type="submit" className="btn-primary justify-center" disabled={loading || query.trim().length < 2}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search catalog</button></form></div></header>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4"><div className="flex items-end justify-between gap-3"><div><p className="eyebrow">Catalog matches</p><h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Choose a room.</h2></div><span className="text-xs text-[var(--text-muted)]">{matches.length} results</span></div>{searched && matches.length === 0 && <div className="surface-card p-6"><Music2 className="h-6 w-6 text-[var(--gold-light)]" /><h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No authorized match yet.</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Try another spelling, or return to the Star Lyrix archive. Lyrics only appear when the approved provider connection returns them.</p></div>}{!searched && <div className="surface-card p-6"><Search className="h-6 w-6 text-[var(--gold-light)]" /><h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">Search the music catalog.</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Spotify helps identify the track. Musixmatch is the separate licensed lyrics source.</p></div>}{error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</p>}{matches.map((match) => <article key={`${match.source}-${match.id}`} className={`surface-card flex items-center gap-4 p-4 transition ${selected?.id === match.id && selected.source === match.source ? 'border-[rgba(242,195,91,0.45)]' : ''}`}>{match.thumbnailUrl ? <img src={match.thumbnailUrl} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-xl object-cover" /> : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--gold-light)]"><Music2 className="h-6 w-6" /></span>}<div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-[var(--text-primary)]">{match.title}</h3><p className="truncate text-sm text-[var(--text-secondary)]">{match.artist}{match.album ? ` · ${match.album}` : ''}</p><span className="mt-2 inline-flex rounded-full border border-[var(--border-subtle)] px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">{match.source === 'musixmatch' ? 'Licensed lyrics source' : 'Spotify catalog'}</span></div>{match.source === 'musixmatch' ? <button type="button" className="btn-secondary shrink-0 text-xs" onClick={() => void openLyrics(match)}>Read <ArrowLeft className="h-3.5 w-3.5 rotate-180" /></button> : match.spotifyUrl ? <a className="icon-button shrink-0" href={match.spotifyUrl} target="_blank" rel="noreferrer" aria-label={`Open ${match.title} on Spotify`}><Headphones className="h-4 w-4" /></a> : null}</article>)}</div>

        <article className="glass-panel min-h-[420px] p-6 sm:p-8" aria-live="polite"><div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5"><div><p className="eyebrow">Reading Room</p><h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{selected ? selected.title : 'A quiet place for words.'}</h2>{selected && <p className="mt-1 text-sm text-[var(--text-secondary)]">{selected.artist}</p>}</div><ShieldCheck className="h-5 w-5 text-[var(--gold-light)]" aria-label="Rights-aware reader" /></div>{lyricsLoading && <div className="flex items-center gap-2 py-12 text-sm text-[var(--text-secondary)]"><Loader2 className="h-4 w-4 animate-spin text-[var(--gold-light)]" /> Checking the authorized lyrics source…</div>}{!lyricsLoading && selected?.source === 'spotify' && <div className="py-12"><h3 className="text-lg font-semibold text-[var(--text-primary)]">Spotify found the track.</h3><p className="mt-2 max-w-md text-sm leading-7 text-[var(--text-secondary)]">Spotify provides catalog identity here. Lyrics are not taken from Spotify; open the track there, or search again for an authorized Musixmatch lyrics result.</p>{selected.spotifyUrl && <a href={selected.spotifyUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-5 text-xs"><Headphones className="h-4 w-4" /> Open on Spotify <ExternalLink className="h-3.5 w-3.5" /></a>}</div>}{!lyricsLoading && selected?.source === 'musixmatch' && lyrics && <div className="py-7">{lyrics.lyrics ? <pre className="whitespace-pre-wrap font-serif text-lg leading-9 text-[var(--text-primary)]">{lyrics.lyrics}</pre> : <div><h3 className="text-lg font-semibold text-[var(--text-primary)]">Lyrics are not available here.</h3><p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{lyrics.notice}</p></div>}<p className="mt-8 border-t border-[var(--border-subtle)] pt-4 text-xs leading-5 text-[var(--text-muted)]">{lyrics.notice}</p></div>}{!selected && <div className="py-12"><p className="max-w-md font-serif text-3xl italic leading-tight text-[var(--text-primary)]">“The right words deserve the right room.”</p><p className="mt-5 max-w-md text-sm leading-7 text-[var(--text-secondary)]">Search the catalog on the left to start a rights-aware reading session.</p></div>}</article>
      </section>
    </div>
  );
};

export default LyricsReader;
