import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Music2 } from 'lucide-react';
import { useSongStore } from '../store/songStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import type { PlaybackCue } from '../lib/database.types';

const URL_REGEX = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const AUDIO_URL_REGEX = /^https?:\/\/.+$/i;

const AddSong = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addSong } = useSongStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formData, setFormData] = React.useState({
    title: '', artist: '', album: '', release_date: '', thumbnail_url: '', audio_url: '', duration_seconds: '', synced_lyrics: '',
  });
  const [confirmAuthorized, setConfirmAuthorized] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const hasAudio = Boolean(formData.audio_url.trim());

    if (formData.thumbnail_url && !URL_REGEX.test(formData.thumbnail_url)) {
      setError('Thumbnail URL must be a valid image URL (jpg, png, gif, webp, svg)');
      return;
    }
    if (hasAudio && (!AUDIO_URL_REGEX.test(formData.audio_url) || !confirmAuthorized)) {
      setError('Confirm that the audio is authorized before adding playback.');
      return;
    }
    const duration = Number(formData.duration_seconds);
    if (hasAudio && (!Number.isInteger(duration) || duration <= 0)) {
      setError('Authorized audio needs a duration in whole seconds.');
      return;
    }

    let syncedCues: PlaybackCue[] = [];
    if (formData.synced_lyrics.trim()) {
      try {
        const parsed: unknown = JSON.parse(formData.synced_lyrics);
        if (!Array.isArray(parsed)) throw new Error('Cue data must be an array.');
        syncedCues = parsed.map((cue) => {
          if (!cue || typeof cue !== 'object') throw new Error('Each cue must be an object.');
          const candidate = cue as Record<string, unknown>;
          if (typeof candidate.startMs !== 'number' || typeof candidate.text !== 'string') throw new Error('Each cue needs startMs and text.');
          return { startMs: candidate.startMs, endMs: typeof candidate.endMs === 'number' ? candidate.endMs : undefined, text: candidate.text };
        });
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : 'Timed lyric cues must be valid JSON.');
        return;
      }
    }

    setLoading(true);
    try {
      if (!user) throw new Error('Must be logged in');
      const createdSong = await addSong({
        title: formData.title,
        artist: formData.artist,
        album: formData.album || null,
        release_date: formData.release_date || null,
        thumbnail_url: formData.thumbnail_url || null,
        created_by: user.id,
      });

      if (hasAudio) {
        const { error: playbackError } = await supabase.from('song_playback').insert([{
          song_id: createdSong.id,
          audio_url: formData.audio_url.trim(),
          audio_source: 'authorized-contributor-url',
          audio_authorized: true,
          duration_seconds: duration,
          synced_lyrics: syncedCues,
          created_by: user.id,
        }]);
        if (playbackError) throw playbackError;
      }
      navigate(`/songs/${createdSong.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8"><p className="eyebrow">Contribute to the archive</p><h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">Add a song</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">Publish song metadata and, when you have the rights, connect an authorized audio source with synchronized Reading Room cues.</p></div>
      <form onSubmit={handleSubmit} className="surface-card space-y-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="title" label="Title *" value={formData.title} onChange={handleChange} required />
          <Field id="artist" label="Artist *" value={formData.artist} onChange={handleChange} required />
          <Field id="album" label="Album" value={formData.album} onChange={handleChange} />
          <Field id="release_date" label="Release date" type="date" value={formData.release_date} onChange={handleChange} />
        </div>
        <Field id="thumbnail_url" label="Thumbnail URL" value={formData.thumbnail_url} onChange={handleChange} placeholder="https://example.com/image.jpg" type="url" />

        <div className="rounded-2xl border border-[rgba(212,168,67,0.22)] bg-[rgba(212,168,67,0.06)] p-5">
          <div className="flex items-start gap-3"><Music2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-light)]" /><div><p className="eyebrow">Authorized Reading Room playback</p><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Optional. Use an audio URL you are authorized to publish and stream. The player will not load unverified sources.</p></div></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2"><Field id="audio_url" label="Authorized audio URL" value={formData.audio_url} onChange={handleChange} placeholder="https://cdn.example.com/song.mp3" type="url" /><Field id="duration_seconds" label="Duration (seconds)" value={formData.duration_seconds} onChange={handleChange} placeholder="245" type="number" min="1" /></div>
          <label className="mt-5 block"><span className="block text-sm font-medium text-[var(--text-primary)]">Timed lyric cues (JSON)</span><textarea name="synced_lyrics" value={formData.synced_lyrics} onChange={handleChange} rows={5} placeholder={'[{"startMs": 0, "endMs": 4200, "text": "First line"}]'} className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 font-mono text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" /><span className="mt-2 block text-xs leading-5 text-[var(--text-muted)]">Each cue needs <code>startMs</code> and <code>text</code>; <code>endMs</code> is optional.</span></label>
          <label className="mt-5 flex items-start gap-3 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={confirmAuthorized} onChange={(event) => setConfirmAuthorized(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--gold-primary)]" /> <span>I confirm that I have the rights to publish and stream this audio and these timed lyrics.</span></label>
        </div>

        {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{loading ? 'Publishing…' : 'Publish song'}</button>
      </form>
    </div>
  );
};

const Field: React.FC<{ id: string; label: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; min?: string; required?: boolean }> = ({ id, label, value, onChange, type = 'text', placeholder, min, required }) => <label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">{label}</span><input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} required={required} maxLength={type === 'number' ? undefined : 200} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" /></label>;

export default AddSong;
