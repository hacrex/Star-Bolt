import React from 'react';
import { ArrowRight, Clapperboard, FileText, Film, KeyRound, Layers3, Mic2, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAIStore } from '../store/aiStore';

const CreatorStudio = () => {
  const { providers, providersLoading, loadProviders } = useAIStore();
  const enabledProviders = providers.filter((provider) => provider.enabled);

  React.useEffect(() => {
    void loadProviders().catch(() => undefined);
  }, [loadProviders]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-[rgba(212,168,67,0.22)] bg-[linear-gradient(135deg,var(--bg-surface),var(--bg-elevated))] p-6 sm:p-9">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[rgba(242,195,91,0.15)]" aria-hidden="true" />
        <div className="relative max-w-3xl"><p className="eyebrow">Star Lyrix Creator Studio</p><h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">Bring your own AI. Make the moment yours.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">Start with original lyrics, then grow toward authorized lyric videos, Shorts, and cinematic music stories. Your provider, your key, your creative direction.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/ai-lyrics" className="btn-primary"><Wand2 className="h-4 w-4" /> Start with lyrics</Link><Link to="/settings/ai" className="btn-secondary"><KeyRound className="h-4 w-4" /> Manage providers</Link></div></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Creator Studio tools">
        <CreatorTool icon={<Sparkles className="h-5 w-5" />} title="AI Lyrics" description="Original lyric drafts with your connected provider." href="/ai-lyrics" active />
        <CreatorTool icon={<Film className="h-5 w-5" />} title="Lyric Video" description="Authorized lyrics, audio, and visual direction." href="/creator/lyrics-video" />
        <CreatorTool icon={<Clapperboard className="h-5 w-5" />} title="Shorts" description="Turn an approved lyric video into vertical moments." href="/creator/shorts" />
        <CreatorTool icon={<Mic2 className="h-5 w-5" />} title="Voiceover" description="Narration for meaning and behind-the-lyrics stories." href="/creator/voiceover" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="surface-card p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Your creative queue</p><h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Projects will live here.</h2></div><Layers3 className="h-5 w-5 text-[var(--gold-light)]" aria-hidden="true" /></div><div className="mt-7 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-6 text-center"><FileText className="mx-auto h-7 w-7 text-[var(--gold-muted)]" /><h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">No creator projects yet</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">The project and rendering queue arrives with the next storage and worker migration. For now, create and save original lyric drafts in the lyric studio.</p><Link to="/ai-lyrics" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-light)]">Open lyric studio <ArrowRight className="h-4 w-4" /></Link></div></div>
        <aside className="space-y-5"><div className="glass-panel p-6"><p className="eyebrow">Provider status</p><div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm text-[var(--text-secondary)]">Connected providers</span><strong className="text-xl text-[var(--text-primary)]">{providersLoading ? '…' : enabledProviders.length}</strong></div><p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">Keys are never shown here. Only provider metadata returns to the browser.</p><Link to="/settings/ai" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-light)]">Open provider settings <ArrowRight className="h-4 w-4" /></Link></div><div className="surface-card p-6"><p className="eyebrow">Rights first</p><p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">Only use lyrics, audio, artwork, and footage that are original, licensed, owned, or explicitly authorized. Restricted lyrics never become a video input.</p></div></aside>
      </section>
    </div>
  );
};

const CreatorTool: React.FC<{ icon: React.ReactNode; title: string; description: string; href: string; active?: boolean }> = ({ icon, title, description, href, active }) => active ? <Link to={href} className="surface-card surface-card-hover border-[rgba(242,195,91,0.35)] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,168,67,0.12)] text-[var(--gold-light)]">{icon}</span><h2 className="mt-5 font-semibold text-[var(--text-primary)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--gold-light)]">Open <ArrowRight className="h-3.5 w-3.5" /></span></Link> : <div className="surface-card p-5 opacity-75"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)]">{icon}</span><h2 className="mt-5 font-semibold text-[var(--text-primary)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p><span className="mt-4 inline-flex text-xs font-mono uppercase tracking-[0.1em] text-[var(--text-muted)]">Coming in pipeline phase</span></div>;

export default CreatorStudio;
