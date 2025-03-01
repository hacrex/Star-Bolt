import React from 'react';
import { useAIStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Clock, Download, Share2, Trash2 } from 'lucide-react';

const GeneratedLyrics = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { generatedLyrics, fetchUserLyrics, loading } = useAIStore();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserLyrics();
  }, [user, navigate, fetchUserLyrics]);

  const handleExport = async (lyrics: any) => {
    const blob = new Blob([lyrics.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lyrics.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async (lyrics: any) => {
    try {
      await navigator.share({
        title: lyrics.title,
        text: lyrics.content,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Generated Lyrics</h1>

      {generatedLyrics.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">
            You haven't generated any lyrics yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {generatedLyrics.map((lyrics) => (
            <div
              key={lyrics.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{lyrics.title}</h2>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(lyrics.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(lyrics)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare(lyrics)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <pre className="whitespace-pre-wrap font-sans">
                    {lyrics.content}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                    {lyrics.settings.genre}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    {lyrics.settings.mood}
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-sm">
                    {lyrics.settings.rhymeScheme}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratedLyrics;