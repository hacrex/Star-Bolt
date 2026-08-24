import React from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { readRecentSongs, type ReadingMemory } from '../lib/discovery';

const NowReading = () => {
  const location = useLocation();
  const [song, setSong] = React.useState<ReadingMemory | null>(() => readRecentSongs()[0] || null);

  React.useEffect(() => {
    setSong(readRecentSongs()[0] || null);
  }, [location.pathname]);

  if (!song || location.pathname.startsWith('/songs/')) return null;

  return (
    <aside className="now-reading-bar" aria-label="Continue reading">
      <div className="now-reading-art">{song.thumbnailUrl ? <img src={song.thumbnailUrl} alt="" /> : <BookOpen className="h-4 w-4" />}</div>
      <div className="min-w-0"><span>Now reading</span><strong className="truncate">{song.title}</strong><small className="truncate">{song.artist}</small></div>
      <Link to={`/songs/${song.id}`} className="now-reading-continue">Continue <ArrowRight className="h-3.5 w-3.5" /></Link>
      <button type="button" className="icon-button !p-1.5" onClick={() => { localStorage.removeItem('star-lyrix-recent-reading'); setSong(null); }} aria-label="Dismiss now reading"><X className="h-3.5 w-3.5" /></button>
    </aside>
  );
};

export default NowReading;
