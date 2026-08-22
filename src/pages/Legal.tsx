import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

type LegalSlug = 'terms' | 'privacy' | 'copyright' | 'community-guidelines';

type LegalDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
};

const DOCUMENTS: Record<LegalSlug, LegalDocument> = {
  terms: {
    eyebrow: 'The fine print',
    title: 'Terms of use',
    intro: 'These terms describe the simple rules for using Star Lyrix, contributing content, and taking part in the community.',
    sections: [
      { heading: 'Use of the service', body: 'Use Star Lyrix lawfully and respectfully. You are responsible for the account activity and material you submit, and you should keep your sign-in details secure.' },
      { heading: 'Community contributions', body: 'Only submit lyrics, audio references, artwork, or notes that you have permission to share. Contributions may be reviewed, edited for safety or clarity, or removed when they do not meet these guidelines.' },
      { heading: 'Accounts and availability', body: 'Some features require an account. We may pause or change features to maintain the service, protect the community, or respond to security and infrastructure needs.' },
      { heading: 'Contact', body: 'Questions about these terms can be sent to support@starlyrix.com. This page is product guidance and should not be treated as individualized legal advice.' },
    ],
  },
  privacy: {
    eyebrow: 'Your data, clearly',
    title: 'Privacy notice',
    intro: 'This page explains the information Star Lyrix uses to provide accounts, playlists, lyrics discovery, and community features.',
    sections: [
      { heading: 'Information you provide', body: 'When you create an account or contribute, we may store your email address, username, submitted lyrics, ratings, comments, playlists, and other information you choose to add.' },
      { heading: 'How information is used', body: 'We use this information to authenticate you, show your library, operate community features, improve reliability, and respond to support requests. We do not need your password to provide support.' },
      { heading: 'Storage and deletion', body: 'Account and content data is stored in the connected Supabase project configured for this deployment. You can contact support to request account or content assistance, subject to applicable retention and safety requirements.' },
      { heading: 'Contact', body: 'For privacy questions, contact support@starlyrix.com. Do not include passwords or private authentication tokens in support messages.' },
    ],
  },
  copyright: {
    eyebrow: 'Rights and attribution',
    title: 'Copyright & DMCA',
    intro: 'Star Lyrix respects creators and rights holders. This page explains how to report content that you believe is used without permission.',
    sections: [
      { heading: 'Report a concern', body: 'Send a clear description of the work, the URL or location of the material, your contact information, and a statement explaining why you believe the use is unauthorized to support@starlyrix.com.' },
      { heading: 'Good-faith submissions', body: 'Please submit only accurate notices. We may request additional information, remove or restrict access while reviewing a report, and notify the contributor when appropriate.' },
      { heading: 'User responsibility', body: 'Contributors must have the rights required for any lyrics, audio, artwork, or other material they submit. The original multilingual catalog included in this repository is test content created for QA and is not production repertoire.' },
      { heading: 'Counter-notices', body: 'If material was removed in error, reply to the notice with the relevant explanation and supporting information. We will review the response under the process applicable to the deployment.' },
    ],
  },
  'community-guidelines': {
    eyebrow: 'Make room for everyone',
    title: 'Community guidelines',
    intro: 'Star Lyrix works best when the archive feels generous, curious, and safe for people who love different songs and stories.',
    sections: [
      { heading: 'Be constructive', body: 'Share context, corrections, and feedback without personal attacks. Critique the contribution, not the person who made it.' },
      { heading: 'Respect boundaries', body: 'Do not harass, threaten, impersonate, or expose private information about another person. Do not use the service to coordinate harmful activity.' },
      { heading: 'Keep contributions honest', body: 'Label translations, interpretations, generated drafts, and test data clearly. Avoid presenting unverified lyrics or generated work as an official source.' },
      { heading: 'Report problems', body: 'If you see abuse, rights concerns, or unsafe material, contact support@starlyrix.com with the relevant link and a short description so the team can review it.' },
    ],
  },
};

const Legal: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname === '/privacy' ? 'privacy' : pathname === '/copyright' ? 'copyright' : pathname === '/community-guidelines' ? 'community-guidelines' : 'terms';
  const document = DOCUMENTS[slug as LegalSlug] ?? DOCUMENTS.terms;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link to="/" className="reading-room-back"><ArrowLeft className="h-4 w-4" /> Back to Discover</Link>
      <article className="surface-card mt-6 overflow-hidden">
        <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-10 sm:px-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(212,168,67,0.3)] bg-[rgba(212,168,67,0.1)] text-[var(--gold-light)]"><FileText className="h-5 w-5" /></span>
            <div><p className="eyebrow">{document.eyebrow}</p><h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">{document.title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{document.intro}</p></div>
          </div>
          <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Star Lyrix · Last updated August 22, 2026</p>
        </header>
        <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
          {document.sections.map((section) => <section key={section.heading}><h2 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">{section.heading}</h2><p className="mt-3 text-sm leading-8 text-[var(--text-secondary)]">{section.body}</p></section>)}
        </div>
      </article>
    </div>
  );
};

export default Legal;
