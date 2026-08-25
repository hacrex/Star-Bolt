import React from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://starlyrix.com';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': { title: 'Star Lyrix Creator Studio — Original lyrics. Visual stories.', description: 'Shape original lyrics, lyric-led video ideas, and YouTube Shorts with Star Lyrix Creator Studio.' },
  '/search': { title: 'Music catalog — Star Lyrix', description: 'Match songs and artists across the Star Lyrix music catalog.' },
  '/lyrics': { title: 'Lyrics Reader — Star Lyrix', description: 'Read authorized lyrics with Spotify catalog matching and Musixmatch-powered availability.' },
  '/shorts': { title: 'Star Lyrix Shorts — YouTube gallery', description: 'Watch the official Star Lyrix Shorts gallery on YouTube.' },
  '/creators': { title: 'For Creators — Star Lyrix', description: 'Turn original lyrics into visual stories, lyric videos, and Shorts with a rights-aware Star Lyrix creator workflow.' },
  '/ai-lyrics': { title: 'AI Lyrics Studio — Star Lyrix', description: 'Create original lyrics in a warm, private studio built for musical ideas.' },
  '/creator': { title: 'Creator Studio — Star Lyrix', description: 'Bring your own AI provider and shape original lyric content in Star Lyrix.' },
  '/settings/ai': { title: 'AI Provider Settings — Star Lyrix', description: 'Manage your private BYOK provider connections for original Star Lyrix creator work.' },
  '/submit': { title: 'Artist Submission Portal — Star Lyrix', description: 'Submit an artist video for rights review and possible publication to the Star Lyrix YouTube channel.' },
  '/auth': { title: 'Sign in — Star Lyrix', description: 'Return to the songs, shelves, and lyric rooms you love.' },
  '/terms': { title: 'Terms — Star Lyrix', description: 'Read the Star Lyrix terms of service.' },
  '/privacy': { title: 'Privacy — Star Lyrix', description: 'Read the Star Lyrix privacy policy.' },
  '/copyright': { title: 'Copyright & DMCA — Star Lyrix', description: 'Learn how Star Lyrix handles rights, notices, and lyric removal requests.' },
  '/community-guidelines': { title: 'Community Guidelines — Star Lyrix', description: 'Read the Star Lyrix community standards for thoughtful contribution.' },
};

const SeoHead = () => {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith('/songs/') ? '/songs' : pathname.startsWith('/playlists/') ? '/playlists' : pathname.startsWith('/translate/') ? '/translate' : pathname === '/videos' ? '/shorts' : pathname;
  const meta = routeMeta[basePath] || { title: 'Star Lyrix — Lyrics that light up your world', description: 'A warm, community-driven home for the lyrics, stories, and sounds that stay with us.' };
  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`;

  React.useEffect(() => {
    document.title = meta.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle?.setAttribute('content', meta.title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    ogDescription?.setAttribute('content', meta.description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    ogUrl?.setAttribute('content', canonicalUrl);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [canonicalUrl, meta.description, meta.title]);

  return null;
};

export default SeoHead;
