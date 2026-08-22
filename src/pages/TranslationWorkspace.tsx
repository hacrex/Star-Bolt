import React from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Languages, LockKeyhole, Send, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LANGUAGE_OPTIONS, languageLabel } from '../lib/discovery';
import type { Database } from '../lib/database.types';
import { useAuthStore } from '../store/authStore';
import { useTranslationStore } from '../store/translationStore';
import { useToast } from '../components/Toast';

type Lyric = Database['public']['Tables']['lyrics']['Row'];
type Song = Database['public']['Tables']['songs']['Row'];

const targetLanguages = LANGUAGE_OPTIONS.filter((option) => option.code !== 'all');

const TranslationWorkspace = () => {
  const { lyricsId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { translations, versions, loading, error, fetchForLyrics, fetchVersions, clearVersions, submitTranslation } = useTranslationStore();
  const [source, setSource] = React.useState<Lyric | null>(null);
  const [song, setSong] = React.useState<Song | null>(null);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState('');
  const [targetLanguage, setTargetLanguage] = React.useState('en');
  const [draft, setDraft] = React.useState('');
  const [changeNote, setChangeNote] = React.useState('');
  const [rightsStatus, setRightsStatus] = React.useState('authorized');
  const [confirmRights, setConfirmRights] = React.useState(false);
  const [submittedMessage, setSubmittedMessage] = React.useState('');

  const selectedTranslation = translations.find((translation) => translation.language_code === targetLanguage) || null;
  const selectedTranslationId = selectedTranslation?.id;
  const selectedTranslationText = selectedTranslation?.translated_text || '';

  React.useEffect(() => {
    if (!lyricsId) return;
    const loadWorkspace = async () => {
      try {
        setPageLoading(true);
        setPageError('');
        const { data: lyric, error: lyricError } = await supabase.from('lyrics').select('*').eq('id', lyricsId).maybeSingle();
        if (lyricError) throw lyricError;
        if (!lyric) throw new Error('This lyric is not available for translation collaboration.');
        setSource(lyric);
        setTargetLanguage((current) => current === lyric.language_code ? targetLanguages.find((option) => option.code !== lyric.language_code)?.code || 'en' : current);
        const { data: songRecord, error: songError } = await supabase.from('songs').select('*').eq('id', lyric.song_id).maybeSingle();
        if (songError) throw songError;
        setSong(songRecord);
        await fetchForLyrics(lyricsId);
      } catch (loadError) {
        setPageError(loadError instanceof Error ? loadError.message : 'Could not open the translation workspace.');
      } finally {
        setPageLoading(false);
      }
    };
    void loadWorkspace();
  }, [fetchForLyrics, lyricsId]);

  React.useEffect(() => {
    setDraft(selectedTranslationText);
    setSubmittedMessage('');
    clearVersions();
    if (selectedTranslationId) void fetchVersions(selectedTranslationId);
  }, [clearVersions, fetchVersions, selectedTranslationId, selectedTranslationText]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lyricsId || !source || !draft.trim()) return;
    if (!source.allowed_translation) {
      showToast('This lyric is not yet cleared for translation', 'info');
      return;
    }
    if (!confirmRights) {
      showToast('Confirm your rights to submit this translation', 'error');
      return;
    }
    try {
      const version = await submitTranslation({
        lyricsId,
        languageCode: targetLanguage,
        translatedText: draft.trim(),
        rightsStatus,
        changeNote: changeNote.trim() || null,
      });
      setConfirmRights(false);
      setChangeNote('');
      setSubmittedMessage(`Version ${version.version_number} is pending review. It will not replace the public translation until approved.`);
      showToast('Translation revision submitted for review', 'success');
    } catch (submitError) {
      showToast(submitError instanceof Error ? submitError.message : 'Could not submit translation', 'error');
    }
  };

  if (pageLoading) return <div className="reading-room-loading" role="status">Opening the translation workspace...</div>;
  if (pageError || !source) return <div className="reading-room-error"><p>{pageError || 'Translation source unavailable'}</p><button type="button" className="btn-secondary mt-5" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Back</button></div>;

  return (
    <div className="translation-workspace-page mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><Link to={`/songs/${source.song_id}`} className="reading-room-back"><ArrowLeft className="h-4 w-4" /> Back to Reading Room</Link><span className="eyebrow">Collaborative translation</span></div>
      <header className="translation-workspace-hero surface-card">
        <div><p className="eyebrow">{song ? `${song.title} · ${song.artist}` : 'Lyric source'}</p><h1>Make the feeling travel.</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">Translate from {languageLabel(source.language_code)} with care. Every suggestion is versioned, rights-aware, and held for review before it can become public.</p></div>
        <div className="translation-workspace-lock"><LockKeyhole className="h-5 w-5 text-[var(--gold-light)]" /><span>Pending by default</span></div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="translation-source-card surface-card" aria-labelledby="translation-source-title"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow">Original words</p><h2 id="translation-source-title">Source lyric</h2></div><span className="language-badge">{languageLabel(source.language_code)}</span></div><div className="translation-source-copy">{source.content}</div><div className="mt-6 flex items-start gap-3 border-t border-[var(--border-subtle)] pt-5 text-xs leading-5 text-[var(--text-muted)]"><Languages className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-light)]" /><span>{source.allowed_translation ? 'This source is marked translation-eligible.' : 'Translation eligibility is still subject to rights review.'}</span></div></section>

        <section className="translation-editor-card surface-card" aria-labelledby="translation-editor-title"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow">Your contribution</p><h2 id="translation-editor-title">Translate with context</h2></div><Sparkles className="h-5 w-5 text-[var(--gold-light)]" /></div><form onSubmit={handleSubmit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Translate into</span><select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none">{targetLanguages.filter((option) => option.code !== source.language_code).map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Rights status</span><select value={rightsStatus} onChange={(event) => setRightsStatus(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"><option value="owned">I own this translation</option><option value="authorized">I am authorized</option><option value="licensed">Licensed</option><option value="public_domain">Public domain</option></select></label></div><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Translation draft</span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={12} placeholder="Let the meaning travel without flattening the feeling…" className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 font-serif text-lg leading-8 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" required /></label><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Change note <span className="text-[var(--text-muted)]">(optional)</span></span><input value={changeNote} onChange={(event) => setChangeNote(event.target.value)} placeholder="Clarified the chorus metaphor" maxLength={240} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" /></label><label className="flex items-start gap-3 text-sm leading-6 text-[var(--text-secondary)]"><input type="checkbox" checked={confirmRights} onChange={(event) => setConfirmRights(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--gold-primary)]" /><span>I own or am authorized to submit this translation. I understand it stays pending until reviewed.</span></label>{submittedMessage && <div className="translation-success-message" role="status"><CheckCircle2 className="h-4 w-4 shrink-0" />{submittedMessage}</div>}<button type="submit" className="btn-primary min-h-12 w-full" disabled={loading || !user || !draft.trim() || !source.allowed_translation}>
<Send className="h-4 w-4" />{loading ? 'Submitting…' : selectedTranslation ? 'Suggest revision' : 'Submit translation'}</button>{error && <p className="text-sm text-red-200">{error}</p>}</form></section>
      </div>

      <section className="translation-history-card surface-card mt-6" aria-labelledby="translation-history-title"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow">Version control</p><h2 id="translation-history-title">Translation history</h2></div><span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">{versions.length} snapshots</span></div>{selectedTranslation ? <div className="translation-current-row"><div><span className="language-badge">{languageLabel(selectedTranslation.language_code)}</span><p className="mt-3 whitespace-pre-line font-serif text-lg leading-8 text-[var(--text-primary)]">{selectedTranslation.translated_text}</p></div><span className="translation-status-pill"><Clock3 className="h-3.5 w-3.5" />{selectedTranslation.status}</span></div> : <p className="text-sm leading-6 text-[var(--text-muted)]">No translation exists for this language yet. Your first submission will create version 1 and remain private until review.</p>}{versions.length > 0 && <div className="mt-6 grid gap-3 border-t border-[var(--border-subtle)] pt-5">{versions.map((version) => <article key={version.id} className="translation-version-row"><div className="flex items-center gap-3"><span className="translation-version-number">v{version.version_number}</span><span className="translation-status-pill"><Clock3 className="h-3.5 w-3.5" />{version.status}</span><span className="text-xs text-[var(--text-muted)]">{new Date(version.created_at).toLocaleDateString()}</span></div><p className="mt-2 whitespace-pre-line font-serif text-base leading-7 text-[var(--text-secondary)]">{version.translated_text}</p>{version.change_note && <p className="mt-2 text-xs text-[var(--text-muted)]">Note: {version.change_note}</p>}</article>)}</div>}</section>
    </div>
  );
};

export default TranslationWorkspace;
