import React, { useState } from 'react';
import { useAIStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import { Wand2, Save, Share2, Languages, Settings } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const GENRES = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Jazz', 'Electronic'];
const MOODS = ['Happy', 'Sad', 'Energetic', 'Romantic', 'Angry', 'Peaceful'];

const AILyricsGenerator = () => {
  const { user } = useAuthStore();
  const {
    settings,
    updateSettings,
    generateLyrics,
    saveLyrics,
    translateLyrics,
    loading,
    error
  } = useAIStore();

  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');

  const handleGenerate = async () => {
    try {
      const lyrics = await generateLyrics(prompt);
      setGeneratedContent(lyrics);
    } catch (err) {
      console.error('Failed to generate lyrics:', err);
    }
  };

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a title for your lyrics');
      return;
    }
    try {
      await saveLyrics(title, generatedContent);
      alert('Lyrics saved successfully!');
    } catch (err) {
      console.error('Failed to save lyrics:', err);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: title || 'Generated Lyrics',
        text: generatedContent,
        url: window.location.href,
      };
      await navigator.share(shareData);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleTranslate = async () => {
    try {
      const translated = await translateLyrics(generatedContent, targetLanguage);
      setGeneratedContent(translated);
    } catch (err) {
      console.error('Failed to translate:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI Lyrics Generator</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>

        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Generation Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rhyme Scheme
                </label>
                <select
                  value={settings.rhymeScheme}
                  onChange={(e) => updateSettings({ rhymeScheme: e.target.value as any })}
                  className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="ABAB">ABAB</option>
                  <option value="AABB">AABB</option>
                  <option value="FREE">Free Style</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Syllables per Line
                </label>
                <input
                  type="number"
                  value={settings.syllablesPerLine}
                  onChange={(e) => updateSettings({ syllablesPerLine: parseInt(e.target.value) })}
                  min="4"
                  max="16"
                  className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Genre
                </label>
                <select
                  value={settings.genre}
                  onChange={(e) => updateSettings({ genre: e.target.value })}
                  className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                >
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mood
                </label>
                <select
                  value={settings.mood}
                  onChange={(e) => updateSettings({ mood: e.target.value })}
                  className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                >
                  {MOODS.map((mood) => (
                    <option key={mood} value={mood.toLowerCase()}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            What would you like to write about?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your topic or theme..."
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 min-h-[100px]"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Wand2 className="w-5 h-5" />
            Generate Lyrics
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title for your lyrics..."
                className="flex-1 p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              />
              
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <pre className="whitespace-pre-wrap font-sans">
                {generatedContent}
              </pre>
            </div>

            <div className="flex gap-4">
              {user && (
                <button
                  onClick={handleSave}
                  disabled={loading || !title}
                  className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save Lyrics
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              <button
                onClick={handleTranslate}
                disabled={loading || targetLanguage === settings.language}
                className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Languages className="w-5 h-5" />
                Translate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILyricsGenerator;