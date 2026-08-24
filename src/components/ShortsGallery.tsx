import React from 'react';
import { ArrowUpRight, Play, RefreshCw, Youtube } from 'lucide-react';
import { getPublicShorts, type ShortItem } from '../lib/publicMedia';

const CHANNEL_URL = 'https://www.youtube.com/@starlyrix';

const ShortsGallery: React.FC<{ limit?: number; compact?: boolean }> = ({ limit = 6, compact = false }) => {
  const [items, setItems] = React.useState<ShortItem[]>([]);
  const [configured, setConfigured] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getPublicShorts();
      setItems((response.items || []).slice(0, limit));
      setConfigured(response.configured);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <section aria-labelledby="shorts-gallery-title">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">From the Star Lyrix channel</p><h2 id="shorts-gallery-title" className="section-heading mt-2">Short stories. Bright hooks.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">A small, curated window into the visual world behind Star Lyrix.</p></div><a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="btn-secondary self-start text-xs sm:self-auto"><Youtube className="h-4 w-4 text-[#ff4b4b]" aria-hidden="true" /> Visit channel <ArrowUpRight className="h-3.5 w-3.5" /></a></div>
      {loading && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Loading Shorts gallery">{Array.from({ length: compact ? 3 : limit }).map((_, index) => <div key={index} className="aspect-[9/14] animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />)}</div>}
      {!loading && items.length > 0 && <div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>{items.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="group relative aspect-[9/14] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"><img src={item.thumbnailUrl} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" /><span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" /><span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#ff0033] text-white shadow-lg"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" /></span><span className="absolute inset-x-3 bottom-3 line-clamp-3 text-sm font-semibold leading-5 text-white">{item.title}</span></a>)}</div>}
      {!loading && items.length === 0 && <div className="surface-card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold text-[var(--text-primary)]">{configured ? 'The gallery is warming up.' : 'Connect the channel gallery.'}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">{configured ? 'No public Shorts were returned yet. Visit the channel to keep exploring.' : 'The public gallery is waiting for its server-side YouTube Data API configuration. The channel remains available now.'}</p></div><div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary text-xs" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" /> Retry</button><a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="btn-primary text-xs"><Youtube className="h-3.5 w-3.5" /> Open YouTube</a></div></div>}
      {error && <p className="mt-3 text-xs text-[var(--text-muted)]" role="status">The gallery service is unavailable; the channel link is still live.</p>}
    </section>
  );
};

export default ShortsGallery;
