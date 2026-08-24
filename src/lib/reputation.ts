import type { Database } from './database.types';

export type ReputationEvent = Database['public']['Tables']['reputation_events']['Row'];

type BadgeMetric = 'submissions' | 'songs' | 'languages' | 'approvals' | 'activeDays';

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  metric: BadgeMetric;
  threshold: number;
  accent: string;
};

export type ReputationSummary = {
  points: number;
  submissions: number;
  songs: number;
  lyrics: number;
  translations: number;
  approvals: number;
  languages: number;
  activeDays: number;
  pending: number;
  recentEvents: ReputationEvent[];
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first-light', name: 'First Light', description: 'Make your first contribution to the archive.', metric: 'submissions', threshold: 1, accent: '#D4A843' },
  { id: 'catalog-starter', name: 'Catalog Starter', description: 'Add a song to the community archive.', metric: 'songs', threshold: 1, accent: '#D58B73' },
  { id: 'polyglot-spark', name: 'Polyglot Spark', description: 'Contribute across two languages.', metric: 'languages', threshold: 2, accent: '#9FA8D7' },
  { id: 'verified-voice', name: 'Verified Voice', description: 'Earn your first approved contribution.', metric: 'approvals', threshold: 1, accent: '#9DB69F' },
  { id: 'gold-standard', name: 'Gold Standard', description: 'Earn five approved contributions.', metric: 'approvals', threshold: 5, accent: '#F2C35B' },
  { id: 'steady-hand', name: 'Steady Hand', description: 'Contribute on three different days.', metric: 'activeDays', threshold: 3, accent: '#D9B7A0' },
];

const submittedTypes = new Set(['song_submitted', 'lyrics_submitted', 'translation_submitted', 'translation_revision_submitted']);
const approvalTypes = new Set(['translation_approved', 'translation_revision_approved']);

export const summarizeReputation = (events: ReputationEvent[]): ReputationSummary => {
  const languages = new Set(events.map((event) => typeof event.metadata?.language_code === 'string' ? event.metadata.language_code : null).filter(Boolean));
  const activeDays = new Set(events.map((event) => event.created_at.slice(0, 10)));
  const submissions = events.filter((event) => submittedTypes.has(event.event_type));

  return {
    points: events.reduce((total, event) => total + event.points, 0),
    submissions: submissions.length,
    songs: events.filter((event) => event.event_type === 'song_submitted').length,
    lyrics: events.filter((event) => event.event_type === 'lyrics_submitted').length,
    translations: events.filter((event) => event.event_type === 'translation_submitted' || event.event_type === 'translation_revision_submitted').length,
    approvals: events.filter((event) => approvalTypes.has(event.event_type)).length,
    languages: languages.size,
    activeDays: activeDays.size,
    pending: Math.max(0, submissions.length - events.filter((event) => approvalTypes.has(event.event_type)).length),
    recentEvents: [...events].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8),
  };
};

export const badgeValue = (badge: BadgeDefinition, summary: ReputationSummary) => summary[badge.metric];

export const badgeProgress = (badge: BadgeDefinition, summary: ReputationSummary) => Math.min(100, Math.round((badgeValue(badge, summary) / badge.threshold) * 100));
