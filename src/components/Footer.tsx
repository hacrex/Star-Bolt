import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--gold-light)]">
                <span className="text-sm font-black">S</span>
              </span>
              <span className="text-sm font-extrabold tracking-[0.18em] text-[var(--text-primary)]">STARLYRIX</span>
            </div>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              A warm, community-driven home for the lyrics, stories, and sounds that stay with us.
            </p>
            <a href="mailto:support@starlyrix.com" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-light)] hover:text-[var(--text-primary)]">
              <Mail className="h-4 w-4" aria-hidden="true" />
              support@starlyrix.com
            </a>
          </div>

          <FooterColumn title="Explore" links={[
            ['Lyrics', '/search'],
            ['Artists', '/search'],
            ['Genres', '/search'],
            ['YouTube', '/videos'],
          ]} />
          <FooterColumn title="Tools" links={[
            ['AI Lyrics Generator', '/ai-lyrics'],
            ['My Lyrics', '/generated-lyrics'],
            ['Playlists', '/playlists'],
            ['Contribute', '/add-song'],
          ]} />
          <FooterColumn title="Legal" links={[
            ['Terms', '/terms'],
            ['Privacy', '/privacy'],
            ['Copyright & DMCA', '/copyright'],
            ['Community Guidelines', '/community-guidelines'],
          ]} />
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} Star Lyrix. Lyrics that light up your world.</p>
          <div className="flex items-center gap-2" aria-label="Social links">
            <SocialLink href="https://youtube.com/@starlyrix" label="YouTube"><Youtube className="h-4 w-4" /></SocialLink>
            <SocialLink href="https://instagram.com" label="Instagram"><Instagram className="h-4 w-4" /></SocialLink>
            <SocialLink href="https://twitter.com" label="X / Twitter"><Twitter className="h-4 w-4" /></SocialLink>
            <SocialLink href="https://facebook.com" label="Facebook"><Facebook className="h-4 w-4" /></SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn: React.FC<{ title: string; links: [string, string][] }> = ({ title, links }) => (
  <div>
    <h2 className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-primary)]">{title}</h2>
    <ul className="space-y-3 text-sm">
      {links.map(([label, href]) => (
        <li key={label}>
          <Link to={href} className="transition-colors hover:text-[var(--gold-light)]">{label}</Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialLink: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="icon-button">
    {children}
  </a>
);

export default Footer;