import { BookOpen, Compass, Library, Search, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const items = [
    { label: 'Discover', href: '/', icon: Compass, active: location.pathname === '/' },
    { label: 'Read', href: '/search', icon: BookOpen, active: location.pathname.startsWith('/songs/') || location.pathname.startsWith('/search') },
    { label: 'Create', href: '/ai-lyrics', icon: Sparkles, active: location.pathname.startsWith('/ai-lyrics'), featured: true },
    { label: 'Library', href: '/playlists', icon: Library, active: location.pathname.startsWith('/playlists') || location.pathname.startsWith('/generated-lyrics') || location.pathname.startsWith('/profile') },
    { label: 'Search', href: '/search', icon: Search, active: false },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
      {items.map(({ label, href, icon: Icon, active, featured }) => (
        <Link key={label} to={href} className={`mobile-bottom-nav-item ${active ? 'is-active' : ''} ${featured ? 'is-featured' : ''}`} aria-current={active ? 'page' : undefined}>
          <span className="mobile-bottom-nav-icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
