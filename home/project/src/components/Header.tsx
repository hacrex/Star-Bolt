import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Moon, Sun, Search, LogIn, LogOut, Music2, User, ListMusic, Wand2, Youtube } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Music2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Star Lyrix
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <NavLink href="/">Discover</NavLink>
            <NavLink href="/ai-lyrics">
              <Wand2 className="w-4 h-4 inline-block mr-1" />
              AI Lyrics
            </NavLink>
            <NavLink href="/videos">
              <Youtube className="w-4 h-4 inline-block mr-1" />
              Videos
            </NavLink>
            {user && (
              <>
                <NavLink href="/generated-lyrics">My Lyrics</NavLink>
                <NavLink href="/playlists">
                  <ListMusic className="w-4 h-4 inline-block mr-1" />
                  Playlists
                </NavLink>
                <NavLink href="/add-song">Add Song</NavLink>
              </>
            )}
            <NavLink href="/search">Search</NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children
}) => (
  <Link
    to={href}
    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
  >
    {children}
  </Link>
);

export default Header;