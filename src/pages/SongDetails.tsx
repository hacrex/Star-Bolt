import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Heart,
  Languages,
  ListPlus,
  MessageSquare,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Repeat2,
  Send,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Star,
  Volume2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSongStore } from '../store/songStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useToast } from '../components/Toast';
import type { Database, PlaybackCue } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];
type Playback = Database['public']['Tables']['song_playback']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'] & { user: { username: string } };

const parsePlaybackCues = (value: unknown): PlaybackCue[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((cue) => {
    if (!cue || typeof cue !== 'object') return [];
    const candidate = cue as Record<string, unknown>;
    if (typeof candidate.startMs !== 'number' || typeof candidate.text !== 'string') return [];
    return [{ startMs: candidate.startMs, endMs: typeof candidate.endMs === 'number' ? candidate.endMs : undefined, text: candidate.text }];
  });
};

const formatTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${Math.floor(safeSeconds / 60)}:${String(Math.floor(safeSeconds % 60)).padStart(2, '0')}`;
};

type LyricSection = {
  label: string;
  lines: string[];
};

const SongDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rateSong, addComment } = useSongStore();
  const { playlists, fetchPlaylists, addSongToPlaylist, createPlaylist } = usePlaylistStore();
  const { showToast } = useToast();
  const [song, setSong] = React.useState<Song | null>(null);
  const [playback, setPlayback] = React.useState<Playback | null>(null);
  const [lyrics, setLyrics] = React.useState('');
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [newComment, setNewComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [userRating, setUserRating] = React.useState(0);
  const [activeLine, setActiveLine] = React.useState<number | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(80);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [playlistPickerOpen, setPlaylistPickerOpen] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');
  const [playlistActionLoading, setPlaylistActionLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const [songResult, lyricsResult, commentsResult, playbackResult] = await Promise.all([
          supabase.from('songs').select('*').eq('id', id).single(),
          supabase.from('lyrics').select('content').eq('song_id', id).single(),
          supabase.from('comments').select('*, user:users(username)').eq('song_id', id).order('created_at', { ascending: false }),
          supabase.from('song_playback').select('*').eq('song_id', id).eq('audio_authorized', true).maybeSingle(),
        ]);

        if (songResult.error) throw songResult.error;
        setSong(songResult.data);

        if (lyricsResult.error && lyricsResult.error.code !== 'PGRST116') throw lyricsResult.error;

        if (commentsResult.error) throw commentsResult.error;
        setComments((commentsResult.data || []) as Comment[]);

        if (playbackResult.error && playbackResult.error.code !== 'PGRST116' && playbackResult.error.code !== 'PGRST205') throw playbackResult.error;
        const authorizedPlayback = playbackResult.error ? null : playbackResult.data as Playback | null;
        setPlayback(authorizedPlayback);
        setDuration(authorizedPlayback?.duration_seconds || 0);
        const cueLyrics = parsePlaybackCues(authorizedPlayback?.synced_lyrics).map((cue) => cue.text).join('\n');
        setLyrics(lyricsResult.data?.content || cueLyrics);

        if (user && id) {
          const { data: rating } = await supabase
            .from('ratings')
            .select('score')
            .eq('song_id', id)
            .eq('user_id', user.id)
            .single();
          if (rating) setUserRating(rating.score);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load song details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSongDetails();
  }, [id, user]);

  const syncCues = React.useMemo(() => parsePlaybackCues(playback?.synced_lyrics), [playback]);
  const syncedLine = React.useMemo(() => {
    if (syncCues.length === 0) return null;
    const currentMs = currentTime * 1000;
    const cueIndex = syncCues.findIndex((cue) => currentMs >= cue.startMs && (cue.endMs === undefined || currentMs < cue.endMs));
    return cueIndex >= 0 ? cueIndex : null;
  }, [currentTime, syncCues]);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [id]);

  const lyricSections = React.useMemo<LyricSection[]>(() => {
    const blocks = lyrics
      .split(/\n\s*\n/)
      .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
      .filter((lines) => lines.length > 0);

    return blocks.map((lines, index) => ({
      label: index === 0 ? 'Verse 1' : index === 1 ? 'Chorus' : index % 2 === 0 ? `Verse ${Math.floor(index / 2) + 1}` : 'Chorus',
      lines,
    }));
  }, [lyrics]);

  const handleRate = async (score: number) => {
    if (!user || !id) {
      showToast('Sign in to rate this song', 'error');
      return;
    }
    try {
      await rateSong(id, score);
      setUserRating(score);
      showToast(`Rated ${score} star${score > 1 ? 's' : ''}!`, 'success');
    } catch {
      showToast('Failed to rate song', 'error');
    }
  };

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newComment.trim() || !id) return;

    setSubmitting(true);
    try {
      await addComment(id, newComment.trim());
      setNewComment('');
      showToast('Comment added!', 'success');

      const { data } = await supabase
        .from('comments')
        .select('*, user:users(username)')
        .eq('song_id', id)
        .order('created_at', { ascending: false });
      setComments((data || []) as Comment[]);
    } catch {
      showToast('Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: song?.title || 'Star Lyrix Reading Room',
      text: song ? `${song.title} by ${song.artist}` : 'Read this song on Star Lyrix',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Reading Room link copied', 'success');
      }
    } catch {
      // A cancelled native share should not surface as an error.
    }
  };

  const handleSave = () => {
    setIsSaved((saved) => !saved);
    showToast(isSaved ? 'Removed from your library' : 'Saved to your library', 'success');
  };

  const handleOpenPlaylistPicker = async () => {
    if (!user) {
      showToast('Sign in to add songs to playlists', 'error');
      return;
    }
    try {
      await fetchPlaylists();
      setPlaylistPickerOpen(true);
    } catch {
      showToast('Could not load your playlists', 'error');
    }
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    if (!id) return;
    setPlaylistActionLoading(true);
    try {
      await addSongToPlaylist(playlistId, id);
      setPlaylistPickerOpen(false);
      showToast(`Added to ${playlistName}`, 'success');
    } catch (error) {
      showToast(error instanceof Error && error.message.toLowerCase().includes('duplicate') ? 'Song is already in that playlist' : 'Could not add song to playlist', 'error');
    } finally {
      setPlaylistActionLoading(false);
    }
  };

  const handleCreateAndAddPlaylist = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newPlaylistName.trim();
    if (!name || !id) return;
    setPlaylistActionLoading(true);
    try {
      const created = await createPlaylist(name);
      await addSongToPlaylist(created.id, id);
      setNewPlaylistName('');
      setPlaylistPickerOpen(false);
      showToast(`Created ${name} and added the song`, 'success');
    } catch {
      showToast('Could not create playlist', 'error');
    } finally {
      setPlaylistActionLoading(false);
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!playback?.audio_authorized || !audio) {
      showToast('No authorized audio is available for this song yet', 'info');
      return;
    }
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch {
      showToast('The authorized audio could not be played in this browser', 'error');
    }
  };

  const seekPlayback = (nextProgress: number) => {
    const audio = audioRef.current;
    const total = audio?.duration || duration;
    if (!audio || total <= 0) return;
    audio.currentTime = (nextProgress / 100) * total;
    setProgress(nextProgress);
    setCurrentTime(audio.currentTime);
  };

  const handleLyricClick = (lineNumber: number) => {
    setActiveLine(lineNumber);
    const cue = syncCues[lineNumber];
    if (cue && audioRef.current && playback?.audio_authorized) {
      audioRef.current.currentTime = cue.startMs / 1000;
      setCurrentTime(audioRef.current.currentTime);
      void audioRef.current.play().catch(() => showToast('Playback was blocked; use the player button to start audio', 'info'));
    }
  };

  if (loading) {
    return <div className="reading-room-loading">Opening the Reading Room...</div>;
  }

  if (error || !song) {
    return (
      <div className="reading-room-error">
        <p>{error || 'Song not found'}</p>
        <button type="button" className="btn-secondary mt-5" onClick={() => navigate('/search')}>
          <ArrowLeft className="h-4 w-4" /> Back to lyrics
        </button>
      </div>
    );
  }

  return (
    <div className="reading-room-page">
      <div className="reading-room-toolbar">
        <button type="button" className="reading-room-back" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          <span>Back to discovery</span>
        </button>
        <span className="reading-room-toolbar-label">Star Lyrix / Reading Room</span>
        <button type="button" className="icon-button" aria-label="More song actions" onClick={() => showToast('More song actions coming soon', 'info')}>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <main className="reading-room-layout">
        <aside className="reading-room-sidebar">
          <div className="reading-room-cover-wrap">
            {song.thumbnail_url ? (
              <img src={song.thumbnail_url} alt={`${song.title} cover`} className="reading-room-cover" />
            ) : (
              <div className="reading-room-cover reading-room-cover-fallback"><Music2 className="h-16 w-16" /></div>
            )}
            <div className="reading-room-cover-shade" />
            <span className="reading-room-cover-label">The Reading Room — Lyrics</span>
          </div>

          <div className="reading-room-heading">
            <p className="eyebrow">Now reading</p>
            <h1>{song.title}</h1>
            <p className="reading-room-artist">{song.artist} <span>{song.release_date ? new Date(song.release_date).getFullYear() : '—'}</span></p>
          </div>

          <div className="reading-room-actions">
            <button type="button" className={`reading-room-action ${isSaved ? 'is-active' : ''}`} onClick={handleSave}>
              {isSaved ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button type="button" className="reading-room-action" onClick={() => void handleOpenPlaylistPicker()}>
              <ListPlus className="h-4 w-4" />
              <span>Add</span>
            </button>
            <button type="button" className="reading-room-action reading-room-share" aria-label="Share song" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {user && (
            <div className="reading-room-rating">
              <span>Rate this song</span>
              <div className="flex gap-1" aria-label="Rate this song from one to five stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => handleRate(star)} aria-label={`${star} star${star > 1 ? 's' : ''}`}>
                    <Star className={`h-4 w-4 ${star <= userRating ? 'fill-current text-[var(--gold-light)]' : 'text-[var(--text-muted)]'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="reading-room-metadata">
            <div><span>Album</span><strong>{song.album || 'Single release'}</strong></div>
            <div><span>Release</span><strong>{song.release_date ? new Date(song.release_date).toLocaleDateString() : 'Not listed'}</strong></div>
            <div><span>Lyrics status</span><strong>{playback && syncCues.length > 0 ? 'Synced & authorized' : 'Authorized content'}</strong></div>
          </div>
        </aside>

        <section className="reading-room-canvas" aria-labelledby="reading-room-title">
          <header className="reading-room-canvas-header">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-[var(--gold-light)]" aria-hidden="true" />
              <div><p className="eyebrow">Words & meaning</p><h2 id="reading-room-title">The Reading Room</h2></div>
            </div>
            <button type="button" className={`reading-room-translate ${showTranslation ? 'is-active' : ''}`} onClick={() => setShowTranslation((visible) => !visible)}>
              <Languages className="h-4 w-4" />
              <span>{showTranslation ? 'Original' : 'Translate'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showTranslation ? 'rotate-180' : ''}`} />
            </button>
          </header>

          {showTranslation && (
            <div className="reading-room-translation" role="status">
              <Languages className="h-4 w-4 text-[var(--gold-light)]" />
              <span>Translation mode is ready for a licensed translation source. Original lyrics remain visible below.</span>
            </div>
          )}

          {lyrics ? (
            <div className="reading-room-lyrics-scroll">
              <div className="reading-room-lyrics-copy">
                {lyricSections.map((section, sectionIndex) => {
                  const sectionStart = lyricSections.slice(0, sectionIndex).reduce((total, current) => total + current.lines.length, 0);
                  return (
                    <section key={`${section.label}-${sectionIndex}`} className="reading-room-lyric-section">
                      <div className={`reading-room-section-label ${section.label === 'Chorus' ? 'is-highlighted' : ''}`}>{section.label}</div>
                      <div className="reading-room-lines">
                        {section.lines.map((line, lineIndex) => {
                          const lineNumber = sectionStart + lineIndex;
                          const isActive = (syncedLine ?? activeLine) === lineNumber;
                          return (
                            <button type="button" key={`${line}-${lineNumber}`} className={`reading-room-line ${isActive ? 'is-active' : ''}`} onClick={() => handleLyricClick(lineNumber)} aria-pressed={isActive}>
                              {line}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
              <p className="reading-room-rights-note">Only display lyrics you are licensed or authorized to publish. Community corrections and translations should pass through review before being marked verified.</p>
            </div>
          ) : (
            <div className="reading-room-empty"><Music2 className="h-8 w-8 text-[var(--gold-muted)]" /><p>No lyrics available yet.</p></div>
          )}
        </section>
      </main>

      {playlistPickerOpen && (
        <div className="playlist-picker-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setPlaylistPickerOpen(false); }}>
          <section className="playlist-picker-dialog surface-card" role="dialog" aria-modal="true" aria-labelledby="playlist-picker-title">
            <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Your library</p><h2 id="playlist-picker-title" className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Add to a playlist</h2></div><button type="button" className="icon-button" aria-label="Close playlist picker" onClick={() => setPlaylistPickerOpen(false)}>×</button></div>
            <div className="mt-5 grid gap-2">{playlists.length > 0 ? playlists.map((playlist) => <button type="button" key={playlist.id} disabled={playlistActionLoading} onClick={() => void handleAddToPlaylist(playlist.id, playlist.name)} className="playlist-picker-option"><ListPlus className="h-4 w-4 text-[var(--gold-light)]" /><span>{playlist.name}</span></button>) : <p className="text-sm text-[var(--text-secondary)]">No playlists yet. Create one below.</p>}</div>
            <form onSubmit={handleCreateAndAddPlaylist} className="mt-5 border-t border-[var(--border-subtle)] pt-5"><label htmlFor="new-reading-room-playlist" className="eyebrow">Create and add</label><div className="mt-2 flex gap-2"><input id="new-reading-room-playlist" value={newPlaylistName} onChange={(event) => setNewPlaylistName(event.target.value)} placeholder="Late night lines" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" maxLength={80} /><button type="submit" className="btn-primary !px-3 text-xs" disabled={playlistActionLoading || !newPlaylistName.trim()}>{playlistActionLoading ? 'Saving…' : 'Create'}</button></div></form>
          </section>
        </div>
      )}

      <section className="reading-room-comments surface-card" aria-labelledby="community-notes-title">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 id="community-notes-title" className="flex items-center gap-2 text-xl font-semibold"><MessageSquare className="h-5 w-5 text-[var(--gold-light)]" /> Community notes <span className="text-sm font-normal text-[var(--text-muted)]">({comments.length})</span></h2></div>
        {user && (
          <form onSubmit={handleAddComment} className="mb-6 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="song-comment" className="sr-only">Add a comment</label>
            <input id="song-comment" type="text" value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Share a thought about this song..." className="min-h-12 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" maxLength={500} />
            <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /> Post note</button>
          </form>
        )}
        {comments.length > 0 ? <div className="space-y-4">{comments.map((comment) => <div key={comment.id} className="border-b border-[var(--border-subtle)] pb-4 last:border-0"><div className="flex items-start justify-between gap-4"><span className="font-semibold text-[var(--gold-light)]">{comment.user.username}</span><span className="text-xs text-[var(--text-muted)]">{new Date(comment.created_at).toLocaleDateString()}</span></div><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{comment.content}</p></div>)}</div> : <p className="text-sm text-[var(--text-muted)]">No community notes yet.</p>}
      </section>

      <audio ref={audioRef} src={playback?.audio_authorized ? playback.audio_url : undefined} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || duration)} onTimeUpdate={(event) => { const nextTime = event.currentTarget.currentTime; const total = event.currentTarget.duration || duration; setCurrentTime(nextTime); setProgress(total > 0 ? (nextTime / total) * 100 : 0); }} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); setProgress(100); }} />
      <div className="reading-room-player" aria-label="Reading Room playback controls">
        <div className="reading-room-player-track">
          {song.thumbnail_url ? <img src={song.thumbnail_url} alt="" /> : <div className="reading-room-player-cover"><Music2 className="h-5 w-5" /></div>}
          <div><strong>{song.title}</strong><span>{song.artist}</span></div>
        </div>
        <div className="reading-room-player-controls">
          <div className="reading-room-player-buttons">
            <button type="button" className="reading-room-player-quiet" aria-label="Shuffle" onClick={() => showToast('Shuffle is ready for the licensed player', 'info')}><Shuffle className="h-4 w-4" /></button>
            <button type="button" className="reading-room-player-quiet" aria-label="Previous track"><SkipBack className="h-5 w-5" /></button>
            <button type="button" className={`reading-room-player-main ${!playback ? 'opacity-60' : ''}`} aria-label={isPlaying ? 'Pause' : 'Play'} onClick={() => void togglePlayback()}>{isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}</button>
            <button type="button" className="reading-room-player-quiet" aria-label="Next track"><SkipForward className="h-5 w-5" /></button>
            <button type="button" className="reading-room-player-quiet" aria-label="Repeat" onClick={() => showToast('Repeat is ready for the licensed player', 'info')}><Repeat2 className="h-4 w-4" /></button>
          </div>
          <div className="reading-room-progress"><span>{formatTime(currentTime)}</span><input type="range" min="0" max="100" value={progress} onChange={(event) => seekPlayback(Number(event.target.value))} aria-label="Playback progress" disabled={!playback} /><span>{formatTime(duration)}</span></div>
        </div>
        <div className="reading-room-player-volume"><Volume2 className="h-4 w-4" /><input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" /></div>
      </div>
    </div>
  );
};

export default SongDetails;
