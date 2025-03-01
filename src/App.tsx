import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import SongDetails from './pages/SongDetails';
import AddSong from './pages/AddSong';
import Profile from './pages/Profile';
import Playlists from './pages/Playlists';
import Search from './pages/Search';
import AILyricsGenerator from './components/AILyricsGenerator';
import GeneratedLyrics from './pages/GeneratedLyrics';
import Videos from './pages/Videos';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  const { loadUser } = useAuthStore();

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/songs/:id" element={<SongDetails />} />
              <Route path="/add-song" element={<AddSong />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/search" element={<Search />} />
              <Route path="/ai-lyrics" element={<AILyricsGenerator />} />
              <Route path="/generated-lyrics" element={<GeneratedLyrics />} />
              <Route path="/videos" element={<Videos />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;