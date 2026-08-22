import React, { useState } from 'react';
import { useAIStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from './Toast';
import { Languages, Save, Settings2, Share2, Sparkles, Wand2 } from 'lucide-react';

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
  const { showToast } = useToast();
  const { settings, updateSettings, generateLyrics, saveLyrics, translateLyrics, loading, error } = useAIStore();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const lyrics = await generateLyrics(prompt.trim());
      setGeneratedContent(lyrics);
      showToast('Lyrics generated successfully!', 'success');
    } catch {
      showToast('Failed to generate lyrics', 'error');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a title for your lyrics', 'error');
      return;
    }
    try {
      await saveLyrics(title.trim(), generatedContent);
      showToast('Lyrics saved successfully!', 'success');
    } catch {
      showToast('Failed to save lyrics', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = { title: title || 'Generated Lyrics', text: generatedContent, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(generatedContent);
        showToast('Lyrics copied to clipboard', 'success');
      }
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name !== 'AbortError') showToast('Failed to share', 'error');
    }
  };

  const handleTranslate = async () => {
    try {
      const translated = await translateLyrics(generatedContent, targetLanguage);
      setGeneratedContent(translated);
      showToast('Lyrics translated successfully!', 'success');
    } catch {
      showToast('Failed to translate lyrics', 'error');
    }
  };

  return (
    <div className="ai-studio-page">
      <header className="ai-studio-header">
        <div>
          <p className="eyebrow">The lyric studio</p>
          <h1 className="section-heading mt-2">Write the feeling down.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">Shape a mood, a memory, or a cinematic moment into lyrics that feel like yours.</p>
        </div>
        <button type="button" onClick={() => setShowSettings((visible) => !visible)} className={`btn-secondary ${showSettings ? 'is-active' : ''}`} aria-expanded={showSettings}>
          <Settings2 className="h-4 w-4" /> Settings
        </button>
      </header>

      <div className="ai-studio-layout">
        <section className="surface-card ai-studio-prompt-card">
          <div className="ai-studio-card-kicker"><Sparkles className="h-4 w-4 text-[var(--gold-light)]" /><span>Begin anywhere</span></div>
          <label htmlFor="lyric-prompt" className="mt-6 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">What would you like to write about?</label>
          <textarea id="lyric-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="A late-night drive through a city that still remembers us..." className="ai-studio-prompt-input" rows={7} maxLength={1200} />
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]"><span>{prompt.length}/1200</span><span className="font-mono uppercase tracking-[0.12em]">{settings.genre} / {settings.mood}</span></div>
          <button type="button" onClick={() => void handleGenerate()} disabled={loading || !prompt.trim()} className="btn-primary mt-6 min-h-12 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"><Wand2 className="h-4 w-4" />{loading ? 'Writing…' : 'Generate lyrics'}</button>
          {error && <div className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</div>}
        </section>

        <aside className={`glass-panel ai-studio-settings ${showSettings ? 'is-open' : ''}`} aria-hidden={!showSettings}>
          <div className="ai-studio-card-kicker"><Settings2 className="h-4 w-4 text-[var(--gold-light)]" /><span>Generation settings</span></div>
          <div className="mt-6 grid gap-5">
            <StudioSelect label="Rhyme scheme" value={settings.rhymeScheme} onChange={(value) => { if (value === 'ABAB' || value === 'AABB' || value === 'FREE') updateSettings({ rhymeScheme: value }); }} options={[['ABAB', 'ABAB'], ['AABB', 'AABB'], ['FREE', 'Free style']]} />
            <label className="block"><span className="ai-studio-field-label">Syllables per line</span><input type="number" min="4" max="16" value={settings.syllablesPerLine} onChange={(event) => updateSettings({ syllablesPerLine: parseInt(event.target.value, 10) || 8 })} className="ai-studio-control" /></label>
            <StudioSelect label="Genre" value={settings.genre} onChange={(value) => updateSettings({ genre: value })} options={GENRES.map((genre) => [genre.toLowerCase(), genre])} />
            <StudioSelect label="Mood" value={settings.mood} onChange={(value) => updateSettings({ mood: value })} options={MOODS.map((mood) => [mood.toLowerCase(), mood])} />
          </div>
          <div className="mt-8 border-t border-[var(--border-subtle)] pt-5"><p className="eyebrow">Studio note</p><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Your settings guide the first draft. Edit, save, or translate the result into your own direction.</p></div>
        </aside>
      </div>

      {generatedContent && (
        <section className="surface-card ai-studio-output-card">
          <div className="ai-studio-output-header">
            <div className="min-w-0 flex-1"><p className="eyebrow">Draft one</p><input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this song a title" className="ai-studio-title-input" aria-label="Generated lyrics title" /><div className="mt-3 flex flex-wrap gap-2"><span className="search-chip">{settings.genre}</span><span className="search-chip">{settings.mood}</span><span className="search-chip">{settings.rhymeScheme}</span><span className="search-chip">{settings.syllablesPerLine} syllables</span></div></div>
            <div className="flex flex-wrap justify-end gap-2"><button type="button" className="icon-button" onClick={() => void handleShare()} aria-label="Share generated lyrics"><Share2 className="h-4 w-4" /></button>{user && <button type="button" className="btn-secondary text-xs" onClick={() => void handleSave()} disabled={loading || !title.trim()}><Save className="h-4 w-4" /> Save</button>}</div>
          </div>
          <div className="ai-studio-lyrics-canvas"><div className="ai-studio-lyrics-rule" /><pre>{generatedContent}</pre></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5"><p className="text-xs leading-5 text-[var(--text-muted)]">Generated drafts are starting points. Keep the lines that sound like you.</p><div className="flex items-center gap-2"><select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="ai-studio-control ai-studio-language-select" aria-label="Translation language">{LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}</select><button type="button" className="btn-secondary text-xs" onClick={() => void handleTranslate()} disabled={loading || targetLanguage === settings.language}><Languages className="h-4 w-4" /> Translate</button></div></div>
        </section>
      )}
    </div>
  );
};

const StudioSelect: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: string[][] }> = ({ label, value, onChange, options }) => <label className="block"><span className="ai-studio-field-label">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="ai-studio-control">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;

export default AILyricsGenerator;
