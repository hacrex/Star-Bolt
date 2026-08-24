import { BookOpen, Compass, Search, Sparkles, Youtube } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const items = [
    { label: 'Discover', href: '/', icon: Compass, active: location.pathname === '/' },
    { label: 'Read', href: '/lyrics', icon: BookOpen, active: location.pathname.startsWith('/lyrics') || location.pathname.startsWith('/songs/') },
    { label: 'Shorts', href: '/shorts', icon: Youtube, active: location.pathname.startsWith('/shorts'), featured: false },
    { label: user ? 'Create' : 'Creators', href: user ? '/creator' : '/auth', icon: Sparkles, active: location.pathname.startsWith('/creator') || location.pathname.startsWith('/ai-lyrics'), featured: true },
    { label: 'Search', href: '/search', icon: Search, active: location.pathname.startsWith('/search') },
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
