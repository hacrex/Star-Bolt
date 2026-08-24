import React from 'react';
import { ArrowRight, BadgeCheck, BookOpen, Clock3, Languages, ListMusic, Sparkles, Trophy, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { languageLabel, readRecentSongs } from '../lib/discovery';
import { BADGE_DEFINITIONS, badgeProgress, badgeValue, summarizeReputation } from '../lib/reputation';
import { useReputationStore } from '../store/reputationStore';

const eventLabels: Record<string, string> = {
  song_submitted: 'Added a song',
  lyrics_submitted: 'Submitted lyric text',
  translation_submitted: 'Started a translation',
  translation_revision_submitted: 'Suggested a translation revision',
  translation_approved: 'Translation approved',
  translation_revision_approved: 'Revision approved',
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const recentSongs = React.useMemo(() => readRecentSongs(), []);
  const { events, loading: reputationLoading, error: reputationError, fetchMyReputation } = useReputationStore();
  const reputation = React.useMemo(() => summarizeReputation(events), [events]);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    void fetchMyReputation();
  }, [fetchMyReputation, navigate, user]);

  if (!user || !profile) return null;

  const languages = Array.from(new Set(recentSongs.map((song) => languageLabel(song.language))));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="surface-card overflow-hidden">
        <div className="profile-hero">
          <div className="profile-orbit profile-orbit-one" /><div className="profile-orbit profile-orbit-two" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[rgba(242,195,91,0.4)] bg-[var(--bg-surface)] text-[var(--gold-light)] shadow-[var(--shadow-glow)]"><User className="h-10 w-10" /></div><div><p className="eyebrow">Your taste profile</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">{profile.username}</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email}</p><p className="mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">A thoughtful listener with a shelf for the lines that stay. Keep exploring to shape your Star Lyrix identity.</p></div></div>
        </div>
        <div className="profile-stats"><div><strong>{recentSongs.length}</strong><span>recent reads</span></div><div><strong>{languages.length || 1}</strong><span>languages</span></div><div><strong>{reputation.points}</strong><span>reputation points</span></div></div>
      </div>

      <section className="profile-reputation-card surface-card" aria-labelledby="reputation-title">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Contribution reputation</p><h2 id="reputation-title" className="mt-2 text-2xl font-bold tracking-[-0.04em]">Earn trust, not empty points.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Your reputation grows from real archive work and moderator-approved contributions. There are no artificial likes or inflated public counters here.</p></div><div className="profile-reputation-score"><Trophy className="h-5 w-5" /><strong>{reputation.points}</strong><span>points</span></div></div>
        {reputationError ? <div className="profile-reputation-note"><Clock3 className="h-4 w-4" /> Reputation events will appear after the Phase 5 migration is applied.</div> : <div className="profile-reputation-metrics"><div><strong>{reputation.submissions}</strong><span>contributions</span></div><div><strong>{reputation.approvals}</strong><span>approved</span></div><div><strong>{reputation.languages}</strong><span>languages</span></div><div><strong>{reputation.activeDays}</strong><span>active days</span></div></div>}
        <div className="mt-7"><div className="mb-3 flex items-center justify-between gap-3"><p className="eyebrow">Badges in your orbit</p><span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">{BADGE_DEFINITIONS.filter((badge) => badgeValue(badge, reputation) >= badge.threshold).length} / {BADGE_DEFINITIONS.length} earned</span></div><div className="profile-badge-grid">{BADGE_DEFINITIONS.map((badge) => { const value = badgeValue(badge, reputation); const earned = value >= badge.threshold; return <article key={badge.id} className={`profile-badge-card ${earned ? 'is-earned' : ''}`} style={{ '--badge-accent': badge.accent } as React.CSSProperties}><div className="profile-badge-icon">{earned ? <BadgeCheck className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}</div><div className="min-w-0"><strong>{badge.name}</strong><p>{badge.description}</p><div className="profile-badge-progress"><span style={{ width: `${badgeProgress(badge, reputation)}%` }} /></div><small>{earned ? 'Earned' : `${value} / ${badge.threshold}`}</small></div></article>; })}</div></div>
      </section>

      <section className="surface-card p-6" aria-labelledby="activity-title"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow">Archive trail</p><h2 id="activity-title" className="mt-2 text-xl font-semibold">Recent contribution activity</h2></div><Link to="/add-song" className="profile-link !w-auto"><Sparkles className="h-4 w-4 text-[var(--gold-light)]" /> Contribute <ArrowRight className="h-4 w-4" /></Link></div>{reputationLoading ? <p className="text-sm text-[var(--text-muted)]">Gathering your archive trail…</p> : reputation.recentEvents.length > 0 ? <div className="profile-activity-list">{reputation.recentEvents.map((event) => <div key={event.id} className="profile-activity-row"><span className="profile-activity-dot" /><div><strong>{eventLabels[event.event_type] || 'Archive activity'}</strong><p>{event.points} points · {new Date(event.created_at).toLocaleDateString()}</p></div><span className="profile-activity-type">{event.metadata?.language_code ? languageLabel(String(event.metadata.language_code)) : 'Star Lyrix'}</span></div>)}</div> : <div className="profile-reputation-note"><Clock3 className="h-4 w-4" /> Your first contribution will begin this trail.</div>}</section>

      <div className="grid gap-5 md:grid-cols-2"><section className="surface-card p-6"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--gold-light)]" /><p className="eyebrow">Your current energy</p></div><h2 className="mt-3 font-serif text-2xl italic text-[var(--text-primary)]">{recentSongs.length ? 'poetic · nocturnal · multilingual' : 'undiscovered · curious · open'}</h2><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{recentSongs.length ? `Your latest shelf moves through ${languages.join(' · ')}.` : 'Read a few songs and your taste profile will start to take shape.'}</p></section><section className="surface-card p-6"><p className="eyebrow">Your spaces</p><div className="mt-4 grid gap-2"><Link to="/playlists" className="profile-link"><ListMusic className="h-4 w-4 text-[var(--gold-light)]" /> Your shelves <ArrowRight className="ml-auto h-4 w-4" /></Link><Link to="/generated-lyrics" className="profile-link"><Sparkles className="h-4 w-4 text-[var(--gold-light)]" /> Your lyric studio <ArrowRight className="ml-auto h-4 w-4" /></Link><Link to="/search" className="profile-link"><BookOpen className="h-4 w-4 text-[var(--gold-light)]" /> Keep reading <ArrowRight className="ml-auto h-4 w-4" /></Link><span className="profile-link cursor-default"><Languages className="h-4 w-4 text-[var(--gold-light)]" /> {languages.join(' · ') || 'Start with any language'}</span></div></section></div>
      <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export default Profile;
