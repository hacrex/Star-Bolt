import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import NowReading from './components/NowReading';
import Home from './pages/Home';
import Auth from './pages/Auth';
import SongDetails from './pages/SongDetails';
import Legal from './pages/Legal';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';

const AddSong = React.lazy(() => import('./pages/AddSong'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Playlists = React.lazy(() => import('./pages/Playlists'));
const Search = React.lazy(() => import('./pages/Search'));
const AILyricsGenerator = React.lazy(() => import('./components/AILyricsGenerator'));
const GeneratedLyrics = React.lazy(() => import('./pages/GeneratedLyrics'));
const Videos = React.lazy(() => import('./pages/Videos'));
const PlaylistDetail = React.lazy(() => import('./pages/PlaylistDetail'));

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl py-20 text-center">
          <span className="eyebrow">Star Lyrix</span>
          <h2 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
          <p className="mt-3 mb-6 text-[var(--text-secondary)]">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold-primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const LoadingSpinner = () => (
  <div className="flex justify-center py-20">
    <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--gold-primary)] border-t-transparent"></div>
  </div>
);

const App = () => {
  const { loadUser } = useAuthStore();

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <ErrorBoundary>
            <div className="app-shell flex flex-col">
              <Header />
              <main className="site-main flex-grow">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/songs/:id" element={<SongDetails />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/ai-lyrics" element={<AILyricsGenerator />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/terms" element={<Legal />} />
                    <Route path="/privacy" element={<Legal />} />
                    <Route path="/copyright" element={<Legal />} />
                    <Route path="/community-guidelines" element={<Legal />} />
                    <Route
                      path="/add-song"
                      element={<ProtectedRoute><AddSong /></ProtectedRoute>}
                    />
                    <Route
                      path="/profile"
                      element={<ProtectedRoute><Profile /></ProtectedRoute>}
                    />
                    <Route
                      path="/playlists"
                      element={<ProtectedRoute><Playlists /></ProtectedRoute>}
                    />
                    <Route
                      path="/playlists/:id"
                      element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>}
                    />
                    <Route
                      path="/generated-lyrics"
                      element={<ProtectedRoute><GeneratedLyrics /></ProtectedRoute>}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <NowReading />
              <Footer />
              <MobileBottomNav />
            </div>
          </ErrorBoundary>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;