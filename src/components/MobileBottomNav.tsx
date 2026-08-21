import React from 'react';
import { Compass, Library, ListMusic, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const items = [
    { label: 'Discover', href: '/', icon: Compass, active: location.pathname === '/' },
    { label: 'Lyrics', href: '/search', icon: ListMusic, active: location.pathname.startsWith('/songs/') },
    { label: 'Library', href: '/playlists', icon: Library, active: location.pathname.startsWith('/playlists') || location.pathname.startsWith('/generated-lyrics') },
    { label: 'Search', href: '/search', icon: Search, active: location.pathname.startsWith('/search') },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
      {items.map(({ label, href, icon: Icon, active }) => (
        <Link key={label} to={href} className={`mobile-bottom-nav-item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
