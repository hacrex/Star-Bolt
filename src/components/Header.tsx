import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ListMusic,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Music2,
  Search,
  Sun,
  User,
  Wand2,
  X,
  Youtube,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <header className="site-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" onClick={closeMobileMenu}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--gold-light)] shadow-[var(--shadow-glow)] transition-transform duration-200 group-hover:-rotate-6">
            <Music2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-[0.18em] text-[var(--text-primary)]">STARLYRIX</span>
            <span className="hidden text-[10px] font-medium tracking-[0.12em] text-[var(--text-muted)] sm:block">LYRICS THAT LIGHT UP YOUR WORLD</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          <NavLink href="/">Discover</NavLink>
          <NavLink href="/search" icon={<BookOpen className="h-3.5 w-3.5" />}>Lyrics</NavLink>
          <NavLink href="/videos" icon={<Youtube className="h-3.5 w-3.5" />}>Videos</NavLink>
          <NavLink href="/ai-lyrics" icon={<Wand2 className="h-3.5 w-3.5" />}>AI Tools</NavLink>
          {user && <NavLink href="/generated-lyrics">My Lyrics</NavLink>}
          {user && <NavLink href="/playlists" icon={<ListMusic className="h-3.5 w-3.5" />}>Playlists</NavLink>}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/search" className="icon-button" aria-label="Search songs and artists">
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="icon-button"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>

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

      {mobileOpen && (
        <nav id="mobile-navigation" className="border-t border-[var(--border-subtle)] bg-[var(--bg-deep)] px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            <MobileNavLink href="/" onClick={closeMobileMenu}>Discover</MobileNavLink>
            <MobileNavLink href="/search" onClick={closeMobileMenu}>Lyrics & Search</MobileNavLink>
            <MobileNavLink href="/videos" onClick={closeMobileMenu}>Videos</MobileNavLink>
            <MobileNavLink href="/ai-lyrics" onClick={closeMobileMenu}>AI Tools</MobileNavLink>
            {user && <MobileNavLink href="/generated-lyrics" onClick={closeMobileMenu}>My Lyrics</MobileNavLink>}
            {user && <MobileNavLink href="/playlists" onClick={closeMobileMenu}>Playlists</MobileNavLink>}
            {user && <MobileNavLink href="/add-song" onClick={closeMobileMenu}>Add Song</MobileNavLink>}
            {user && <button type="button" className="flex min-h-12 items-center rounded-xl px-3 text-left text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--gold-light)]" onClick={handleSignOut}>Sign out</button>}
          </div>
        </nav>
      )}
    </header>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ href, children, icon }) => (
  <Link to={href} className="nav-link inline-flex items-center gap-1.5">
    {icon}
    {children}
  </Link>
);

const MobileNavLink: React.FC<{ href: string; children: React.ReactNode; onClick: () => void }> = ({ href, children, onClick }) => (
  <Link to={href} onClick={onClick} className="flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--gold-light)]">
    {children}
  </Link>
);

export default Header;