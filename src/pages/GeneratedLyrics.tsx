import React from 'react';
import { Clock, Download, Share2, Wand2 } from 'lucide-react';
import { useAIStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

type GeneratedLyric = {
  id: string;
  content: string;
  title: string;
  created_at: string;
  settings: { genre: string; mood: string; rhymeScheme: string };
};

const GeneratedLyrics = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { generatedLyrics, fetchUserLyrics, loading } = useAIStore();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserLyrics();
  }, [user, navigate, fetchUserLyrics]);

  const handleExport = (lyrics: GeneratedLyric) => {
    const blob = new Blob([lyrics.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${lyrics.title}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async (lyrics: GeneratedLyric) => {
    try {
      if (navigator.share) await navigator.share({ title: lyrics.title, text: lyrics.content, url: window.location.href });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(lyrics.content);
      }
    } catch {
      // Sharing can be cancelled without surfacing an error.
    }
  };

  if (loading) return <div className="reading-room-loading">Opening your lyric archive...</div>;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Your writing room</p><h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">Generated lyrics</h1><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Keep the lines you made, ready for their next verse.</p></div><button type="button" className="btn-primary" onClick={() => navigate('/ai-lyrics')}><Wand2 className="h-4 w-4" /> Create new</button></div>
      {generatedLyrics.length === 0 ? <div className="surface-card p-12 text-center"><p className="text-[var(--text-secondary)]">You haven&apos;t generated any lyrics yet.</p><button type="button" className="mt-5 text-sm font-semibold text-[var(--gold-light)]" onClick={() => navigate('/ai-lyrics')}>Open the lyric generator →</button></div> : <div className="grid gap-5">{generatedLyrics.map((lyrics) => <article key={lyrics.id} className="surface-card overflow-hidden"><div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] p-6"><div><h2 className="text-xl font-semibold text-[var(--text-primary)]">{lyrics.title}</h2><div className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"><Clock className="h-3.5 w-3.5" />{new Date(lyrics.created_at).toLocaleDateString()}</div></div><div className="flex gap-1"><button type="button" onClick={() => handleExport(lyrics as GeneratedLyric)} className="icon-button" title="Download" aria-label={`Download ${lyrics.title}`}><Download className="h-4 w-4" /></button><button type="button" onClick={() => handleShare(lyrics as GeneratedLyric)} className="icon-button" title="Share" aria-label={`Share ${lyrics.title}`}><Share2 className="h-4 w-4" /></button></div></div><div className="p-6"><pre className="lyrics-copy max-w-none whitespace-pre-wrap">{lyrics.content}</pre><div className="mt-6 flex flex-wrap gap-2"><span className="search-chip">{lyrics.settings.genre}</span><span className="search-chip">{lyrics.settings.mood}</span><span className="search-chip">{lyrics.settings.rhymeScheme}</span></div></div></article>)}</div>}
    </div>
  );
};

export default GeneratedLyrics;
