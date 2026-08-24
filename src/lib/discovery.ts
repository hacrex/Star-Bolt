export type DiscoveryMood = {
  label: string;
  query: string;
  accent: string;
};

export const DISCOVERY_MOODS: DiscoveryMood[] = [
  { label: 'Midnight', query: 'midnight', accent: 'mood-violet' },
  { label: 'Soft launch', query: 'soft', accent: 'mood-rose' },
  { label: 'Main character', query: 'main character', accent: 'mood-gold' },
  { label: 'Heartbreak', query: 'heartbreak', accent: 'mood-coral' },
  { label: 'Focus mode', query: 'focus', accent: 'mood-mint' },
  { label: '2AM drive', query: 'drive', accent: 'mood-blue' },
];

export const LANGUAGE_OPTIONS = [
  { code: 'all', label: 'All languages' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
] as const;

export const LANGUAGE_LABELS: Record<string, string> = {
  hi: 'हिंदी',
  en: 'English',
  ta: 'தமிழ்',
};

export type ReadingMemory = {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
  language?: string;
};

const RECENT_KEY = 'star-lyrix-recent-reading';

export const rememberSong = (song: ReadingMemory) => {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as ReadingMemory[];
    const next = [song, ...existing.filter((item) => item.id !== song.id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Local history is an enhancement, not a reason to interrupt reading.
  }
};

export const readRecentSongs = (): ReadingMemory[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const languageLabel = (code?: string | null) => (code ? LANGUAGE_LABELS[code] || code.toUpperCase() : 'English');
