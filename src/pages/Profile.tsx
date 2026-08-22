import React from 'react';
import { ArrowRight, BookOpen, Languages, ListMusic, Sparkles, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { languageLabel, readRecentSongs } from '../lib/discovery';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const recentSongs = React.useMemo(() => readRecentSongs(), []);

  React.useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  if (!user || !profile) return null;

  const languages = Array.from(new Set(recentSongs.map((song) => languageLabel(song.language))));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="surface-card overflow-hidden">
        <div className="profile-hero">
          <div className="profile-orbit profile-orbit-one" /><div className="profile-orbit profile-orbit-two" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[rgba(242,195,91,0.4)] bg-[var(--bg-surface)] text-[var(--gold-light)] shadow-[var(--shadow-glow)]"><User className="h-10 w-10" /></div><div><p className="eyebrow">Your taste profile</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">{profile.username}</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email}</p><p className="mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">A thoughtful listener with a shelf for the lines that stay. Keep exploring to shape your Star Lyrix identity.</p></div></div>
        </div>
        <div className="profile-stats"><div><strong>{recentSongs.length}</strong><span>recent reads</span></div><div><strong>{languages.length || 1}</strong><span>languages</span></div><div><strong>∞</strong><span>possibilities</span></div></div>
      </div>
      <div className="grid gap-5 md:grid-cols-2"><section className="surface-card p-6"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--gold-light)]" /><p className="eyebrow">Your current energy</p></div><h2 className="mt-3 font-serif text-2xl italic text-[var(--text-primary)]">{recentSongs.length ? 'poetic · nocturnal · multilingual' : 'undiscovered · curious · open'}</h2><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{recentSongs.length ? `Your latest shelf moves through ${languages.join(' · ')}.` : 'Read a few songs and your taste profile will start to take shape.'}</p></section><section className="surface-card p-6"><p className="eyebrow">Your spaces</p><div className="mt-4 grid gap-2"><Link to="/playlists" className="profile-link"><ListMusic className="h-4 w-4 text-[var(--gold-light)]" /> Your shelves <ArrowRight className="ml-auto h-4 w-4" /></Link><Link to="/generated-lyrics" className="profile-link"><Sparkles className="h-4 w-4 text-[var(--gold-light)]" /> Your lyric studio <ArrowRight className="ml-auto h-4 w-4" /></Link><Link to="/search" className="profile-link"><BookOpen className="h-4 w-4 text-[var(--gold-light)]" /> Keep reading <ArrowRight className="ml-auto h-4 w-4" /></Link><span className="profile-link cursor-default"><Languages className="h-4 w-4 text-[var(--gold-light)]" /> {languages.join(' · ') || 'Start with any language'}</span></div></section></div>
      <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export default Profile;
