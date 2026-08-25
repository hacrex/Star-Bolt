import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  ListMusic,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Music2,
  Search,
  Sparkles,
  Sun,
  User,
  Wand2,
  X,
  Youtube,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import CommandPalette from './CommandPalette';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setMobileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMobileMenu = () => setMobileOpen(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" onClick={closeMobileMenu}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(212,168,67,0.22)] bg-[var(--bg-surface)] text-[var(--gold-light)] shadow-[var(--shadow-glow)] transition-transform duration-200 group-hover:-rotate-6">
            <Music2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="brand-wordmark">Star Lyrix</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          <NavLink href="/" active={location.pathname === "/"}>Discover</NavLink>
          <NavLink href="/lyrics" active={location.pathname.startsWith('/lyrics')} icon={<BookOpen className="h-3.5 w-3.5" />}>Lyrics Reader</NavLink>
          <NavLink href="/shorts" active={location.pathname.startsWith('/shorts')} icon={<Youtube className="h-3.5 w-3.5" />}>Shorts</NavLink>
          <NavLink href="/creators" active={location.pathname.startsWith('/creators')} icon={<Wand2 className="h-3.5 w-3.5" />}>For Creators</NavLink>
          {user && <NavLink href="/creator" active={location.pathname.startsWith('/creator') || location.pathname.startsWith('/ai-lyrics')} icon={<Wand2 className="h-3.5 w-3.5" />}>Creator Studio</NavLink>}
          {user && <NavLink href="/generated-lyrics" active={location.pathname.startsWith('/generated-lyrics')}>My Lyrics</NavLink>}
          {user && <NavLink href="/playlists" active={location.pathname.startsWith('/playlists')} icon={<ListMusic className="h-3.5 w-3.5" />}>Playlists</NavLink>}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" className="header-command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open command search">
            <Search className="h-4 w-4" aria-hidden="true" /><span className="hidden xl:inline">Search</span><kbd className="hidden xl:inline">/</kbd>
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="icon-button"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>

          <Link to="/creators" className="header-create-link"><Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">For creators</span></Link>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/profile" className="icon-button" aria-label="Open profile">
                <User className="h-5 w-5" aria-hidden="true" />
              </Link>
              <button type="button" onClick={handleSignOut} className="btn-secondary !rounded-full !px-3 !py-2 text-xs">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary !rounded-full !px-3.5 !py-2 text-xs sm:!px-4 sm:text-sm">
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Sign in
            </Link>
          )}

          <button
            type="button"
            className="icon-button lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {mobileOpen && (
        <div className="mobile-menu-layer lg:hidden">
          <button type="button" className="mobile-menu-backdrop" aria-label="Close navigation menu" onClick={closeMobileMenu} />
          <nav id="mobile-navigation" className="mobile-drawer" aria-label="Mobile navigation">
            <div className="mobile-drawer-header"><span className="mobile-drawer-label">STAR LYRIX / MENU</span><button type="button" className="icon-button" onClick={closeMobileMenu} aria-label="Close navigation menu"><X className="h-5 w-5" aria-hidden="true" /></button></div>
            <div className="mobile-drawer-section"><p className="mobile-drawer-section-label">Explore</p><MobileNavLink href="/" onClick={closeMobileMenu}>Discover</MobileNavLink><MobileNavLink href="/lyrics" onClick={closeMobileMenu}>Lyrics Reader</MobileNavLink><MobileNavLink href="/shorts" onClick={closeMobileMenu}>Star Lyrix Shorts</MobileNavLink><MobileNavLink href="/creators" onClick={closeMobileMenu}>For Creators</MobileNavLink><MobileNavLink href="/search" onClick={closeMobileMenu}>Search catalog</MobileNavLink></div>
            <div className="mobile-drawer-section"><p className="mobile-drawer-section-label">Your studio</p><MobileNavLink href={user ? '/creator' : '/auth'} onClick={closeMobileMenu}>{user ? 'Creator Studio' : 'Creator login'}</MobileNavLink>{user && <MobileNavLink href="/generated-lyrics" onClick={closeMobileMenu}>My Lyrics</MobileNavLink>}{user && <MobileNavLink href="/playlists" onClick={closeMobileMenu}>Playlists</MobileNavLink>}{user && <MobileNavLink href="/add-song" onClick={closeMobileMenu}>Add Song</MobileNavLink>}{user && <MobileNavLink href="/profile" onClick={closeMobileMenu}>Profile</MobileNavLink>}</div>
            <div className="mobile-drawer-footer">{user ? <button type="button" className="mobile-drawer-signout" onClick={handleSignOut}><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button> : <MobileNavLink href="/auth" onClick={closeMobileMenu}>Sign in</MobileNavLink>}<a href="https://www.youtube.com/@starlyrix" target="_blank" rel="noreferrer" className="mobile-drawer-channel"><Youtube className="h-4 w-4" aria-hidden="true" /> Visit @starlyrix <ArrowUpRight className="ml-auto h-4 w-4" aria-hidden="true" /></a></div>
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode; icon?: React.ReactNode; active?: boolean }> = ({ href, children, icon, active }) => (
  <Link to={href} aria-current={active ? 'page' : undefined} className={`nav-link inline-flex items-center gap-1.5 ${active ? 'nav-link-active' : ''}`}>
    {icon}
    {children}
  </Link>
);

const MobileNavLink: React.FC<{ href: string; children: React.ReactNode; onClick: () => void }> = ({ href, children, onClick }) => (
  <Link to={href} onClick={onClick} className="mobile-drawer-link">
    {children}
  </Link>
);

export default Header;