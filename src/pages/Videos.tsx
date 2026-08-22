import React, { useEffect, useState } from 'react';
import { ExternalLink, Eye, Play, Share2, Star } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  duration: string;
  artist: string;
  verified?: boolean;
  moods: string[];
}

const MOCK_VIDEOS: YouTubeVideo[] = [
  { id: 'dQw4w9WgXcQ', title: 'Midnight Silhouette', artist: 'The Luna Collective', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=85', views: '845K', publishedAt: '2 days ago', duration: '04:23', verified: true, moods: ['Dreamy', 'Reflective'] },
  { id: 'xvFZjo5PgG0', title: 'Golden Hour Strings', artist: 'Aria Symphony', thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=85', views: '1.1M', publishedAt: '1 week ago', duration: '05:12', verified: true, moods: ['Calm', 'Ethereal'] },
  { id: 'yPYZpwSpKmA', title: 'Neon Nostalgia', artist: 'Synthweaver', thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=85', views: '420K', publishedAt: '3 weeks ago', duration: '03:45', moods: ['Reflective', 'Dreamy'] },
];

const MOODS = ['All Moods', 'Dreamy', 'Ethereal', 'Calm', 'Reflective'];

const Videos = () => {
  const [activeMood, setActiveMood] = useState('All Moods');
  const [videos, setVideos] = useState(MOCK_VIDEOS);

  useEffect(() => {
    setVideos(activeMood === 'All Moods' ? MOCK_VIDEOS : MOCK_VIDEOS.filter((video) => video.moods.includes(activeMood)));
  }, [activeMood]);

  const handleShare = async (video: YouTubeVideo) => {
    const url = `https://youtube.com/watch?v=${video.id}`;
    try {
      if (navigator.share) await navigator.share({ title: video.title, text: `${video.title} by ${video.artist}`, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {
      // Sharing can be cancelled without surfacing an error.
    }
  };

  const featured = videos[0];

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Cinema for your ears</p><h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">Videos worth replaying</h1></div>
        <a href="https://youtube.com/@starlyrix" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm"><ExternalLink className="h-4 w-4" /> Visit channel</a>
      </div>

      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => <button type="button" key={mood} onClick={() => setActiveMood(mood)} className={`mood-chip ${activeMood === mood ? 'is-active' : ''}`}>{mood}</button>)}
      </div>

      {featured ? <section className="video-featured-hero" style={{ backgroundImage: `url(${featured.thumbnail})` }}>
        <div className="video-featured-overlay" />
        <a href={`https://youtube.com/watch?v=${featured.id}`} target="_blank" rel="noopener noreferrer" className="video-featured-play" aria-label={`Play ${featured.title}`}><Play className="ml-1 h-8 w-8 fill-current" /></a>
        <div className="video-featured-copy"><div className="flex flex-wrap items-center gap-2"><span className="gold-chip">Video of the week</span>{featured.verified && <Star className="h-4 w-4 fill-current text-[var(--gold-light)]" aria-label="Verified video" />}</div><h2>{featured.title}</h2><p>“Lost in the quiet, found in the dark…”</p><div className="video-featured-meta"><span><Eye className="h-4 w-4" /> {featured.views} views</span><span><Star className="h-4 w-4 fill-current" /> 4.9/5</span></div></div>
      </section> : <div className="surface-card empty-state-card min-h-64"><span className="empty-state-icon"><Play className="h-5 w-5" /></span><h2>No videos in this mood yet.</h2><p>Try another atmosphere and keep the cinema moving.</p><button type="button" className="btn-secondary" onClick={() => setActiveMood('All Moods')}>Show all moods</button></div>}

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => <VideoCard key={video.id} video={video} onShare={handleShare} />)}
      </section>

      <section className="pt-4"><div className="mb-5"><p className="eyebrow">Quick listens</p><h2 className="section-heading mt-2">Short & sweet</h2></div><div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">{videos.map((video) => <a key={`short-${video.id}`} href={`https://youtube.com/shorts/${video.id}`} target="_blank" rel="noopener noreferrer" className="group w-[200px] shrink-0"><div className="relative mb-2 aspect-[9/16] overflow-hidden rounded-xl border border-[var(--border-subtle)]"><img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" /><div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-primary)] text-[#17120a]"><Play className="h-4 w-4 fill-current" /></span></div></div><h3 className="line-clamp-2 text-sm font-medium text-[var(--text-primary)]">{video.title}</h3></a>)}</div></section>
    </div>
  );
};

const VideoCard: React.FC<{ video: YouTubeVideo; onShare: (video: YouTubeVideo) => void }> = ({ video, onShare }) => <article className="surface-card surface-card-hover group overflow-hidden"><div className="relative aspect-video overflow-hidden"><img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /><div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"><a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-primary)] text-[#17120a]"><Play className="h-5 w-5 fill-current" /></a></div><span className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-1 font-mono text-[0.65rem] text-white">{video.duration}</span></div><div className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{video.title}</h3>{video.verified && <Star className="h-4 w-4 shrink-0 fill-current text-[var(--gold-light)]" />}</div><p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{video.artist}</p><div className="mt-3 flex flex-wrap gap-1.5">{video.moods.map((mood) => <span key={mood} className="rounded-full border border-[var(--border-subtle)] px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[var(--text-muted)]">{mood}</span>)}</div><div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[var(--text-muted)]"><span>{video.views} views</span><span>{video.publishedAt}</span><button type="button" className="icon-button !p-1" title="Share" aria-label={`Share ${video.title}`} onClick={() => onShare(video)}><Share2 className="h-3.5 w-3.5" /></button></div></div></article>;

export default Videos;
