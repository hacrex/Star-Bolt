import { ArrowLeft, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShortsGallery from '../components/ShortsGallery';

const Shorts = () => (
  <div className="mx-auto max-w-6xl space-y-8">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-light)]"><ArrowLeft className="h-4 w-4" /> Back to Creator Studio</Link>
    <header className="max-w-3xl"><p className="eyebrow">Star Lyrix on YouTube</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl">Shorts for the songs that stay.</h1><p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">A focused gallery from the official Star Lyrix channel. Watch on YouTube, then come back when a line asks to be read.</p><a href="https://www.youtube.com/@starlyrix" target="_blank" rel="noreferrer" className="btn-primary mt-6"><Youtube className="h-4 w-4 text-[#ff4b4b]" /> Open @starlyrix on YouTube</a></header>
    <ShortsGallery limit={12} />
  </div>
);

export default Shorts;
