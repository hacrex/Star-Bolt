import React, { useState, useEffect } from 'react';
import { Play, Share2, ExternalLink, TrendingUp, Clock, Hash } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  duration: string;
}

const MOCK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'How to Write Better Lyrics - Star Lyrix Tutorial',
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
    views: '1.2M',
    publishedAt: '2025-02-10',
    duration: '10:23'
  },
  {
    id: 'xvFZjo5PgG0',
    title: 'Using AI to Generate Creative Lyrics - Pro Tips',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
    views: '856K',
    publishedAt: '2025-02-08',
    duration: '8:45'
  },
  {
    id: 'yPYZpwSpKmA',
    title: 'Songwriting Masterclass with Star Lyrix',
    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80',
    views: '623K',
    publishedAt: '2025-02-05',
    duration: '15:30'
  },
  // Add more mock videos as needed
];

const CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'latest', name: 'Latest', icon: Clock },
  { id: 'tutorials', name: 'Tutorials', icon: Hash },
];

const Videos = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [videos, setVideos] = useState<YouTubeVideo[]>(MOCK_VIDEOS);

  useEffect(() => {
    setVideos(MOCK_VIDEOS);
  }, [activeCategory]);

  const handleShare = async (video: YouTubeVideo) => {
    const shareText = `🎶 Check out this latest Star Lyrix video! Watch here: https://youtube.com/watch?v=${video.id}`;
    
    try {
      await navigator.share({
        title: video.title,
        text: shareText,
        url: `https://youtube.com/watch?v=${video.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div><p className="eyebrow">From the Star Lyrix channel</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">Videos worth replaying</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">Explore lyric videos, tutorials, and Shorts in one calm, visual space.</p></div>
        <a
          href="https://youtube.com/@starlyrix"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          Visit channel
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Categories */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              activeCategory === id
                ? 'bg-[var(--gold-primary)] text-[#17120a]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {name}
          </button>
        ))}
      </div>

      {/* Featured Playlist */}
      <div className="surface-card mb-12 overflow-hidden">
        <div className="p-5 sm:p-6"><p className="eyebrow">Start here</p><h2 className="section-heading mt-2">Featured playlist</h2></div>
        <div className="aspect-video w-full overflow-hidden bg-[var(--bg-elevated)]">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/videoseries?list=PLv7V_-HyQYkDg-wST4bBwJqLl_JH-uXQK"
            title="Star Lyrix Featured Playlist"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
            <article key={video.id} className="surface-card surface-card-hover group overflow-hidden">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-primary)] text-[#17120a] transition-transform hover:scale-105"
                  >
                    <Play className="w-6 h-6" />
                  </a>
                </div>
                <div className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-1 text-xs text-white">
                  {video.duration}
                </div>
              </div>
              <div className="p-4"><h3 className="line-clamp-2 font-semibold text-[var(--text-primary)]">{video.title}</h3>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-4">
                  <span>{video.views} views</span>
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleShare(video)}
                  className="icon-button"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              </div>
            </article>
          ))}
      </div>

      {/* YouTube Shorts Section */}
      <div className="mt-14">
        <div className="mb-5"><p className="eyebrow">Quick listens</p><h2 className="section-heading mt-2">Short & sweet</h2></div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {videos.map((video) => (
            <div
              key={`short-${video.id}`}
              className="group w-[200px] flex-shrink-0"
            >
              <div className="relative mb-2 aspect-[9/16] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={`https://youtube.com/shorts/${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-primary)] text-[#17120a]"
                  >
                    <Play className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <h3 className="line-clamp-2 text-sm font-medium text-[var(--text-primary)]">{video.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Videos;