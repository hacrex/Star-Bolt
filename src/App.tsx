import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import SongDetails from './pages/SongDetails';
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
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Reload Page
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
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
              <Header />
              <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/songs/:id" element={<SongDetails />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/ai-lyrics" element={<AILyricsGenerator />} />
                    <Route path="/videos" element={<Videos />} />
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
              <Footer />
            </div>
          </ErrorBoundary>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;