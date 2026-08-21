import React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const FeaturedCarousel: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const videos = [
    {
      id: 1,
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      category: 'Lyric video',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=85',
    },
    {
      id: 2,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      category: 'Featured this week',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=85',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollRef.current.offsetWidth * 0.72 : scrollRef.current.offsetWidth * 0.72,
      behavior: 'smooth',
    });
  };

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="eyebrow">From the channel</p><h2 className="section-heading mt-2">Featured lyric videos</h2></div>
        <span className="hidden text-xs uppercase tracking-[0.14em] text-[var(--text-muted)] sm:block">Swipe to explore</span>
      </div>
      <div className="group relative">
        <div ref={scrollRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth scrollbar-hide">
          {videos.map((video) => (
            <article key={video.id} className="surface-card surface-card-hover relative min-w-[88%] snap-start overflow-hidden sm:min-w-[60%] lg:min-w-[42%]">
              <div className="relative h-64 overflow-hidden sm:h-72">
                <img src={video.thumbnail} alt={`${video.title} by ${video.artist}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold-light)]">{video.category}</span>
                  <h3 className="mt-2 text-2xl font-semibold">{video.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{video.artist}</p>
                </div>
                <button type="button" aria-label={`Play ${video.title}`} className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-primary)] text-[#17120a] shadow-lg transition-transform duration-200 hover:scale-105">
                  <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={() => scroll('left')} aria-label="Previous featured videos" className="icon-button absolute -left-3 top-1/2 hidden -translate-y-1/2 bg-[var(--bg-surface)] shadow-lg group-hover:flex sm:flex"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" onClick={() => scroll('right')} aria-label="Next featured videos" className="icon-button absolute -right-3 top-1/2 hidden -translate-y-1/2 bg-[var(--bg-surface)] shadow-lg group-hover:flex sm:flex"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  );
};

export default FeaturedCarousel;