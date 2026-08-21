import React from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Music2, Send, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSongStore } from '../store/songStore';
import { useToast } from '../components/Toast';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'] & { user: { username: string } };

const SongDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { rateSong, addComment } = useSongStore();
  const { showToast } = useToast();
  const [song, setSong] = React.useState<Song | null>(null);
  const [lyrics, setLyrics] = React.useState<string>('');
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [newComment, setNewComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [userRating, setUserRating] = React.useState(0);

  React.useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        setLoading(true);

        const [songResult, lyricsResult, commentsResult] = await Promise.all([
          supabase.from('songs').select('*').eq('id', id).single(),
          supabase.from('lyrics').select('content').eq('song_id', id).single(),
          supabase.from('comments').select('*, user:users(username)').eq('song_id', id).order('created_at', { ascending: false }),
        ]);

        if (songResult.error) throw songResult.error;
        setSong(songResult.data);

        if (lyricsResult.error && lyricsResult.error.code !== 'PGRST116') throw lyricsResult.error;
        setLyrics(lyricsResult.data?.content || '');

        if (commentsResult.error) throw commentsResult.error;
        setComments((commentsResult.data || []) as Comment[]);

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

    if (id) {
      fetchSongDetails();
    }
  }, [id, user]);

  const handleRate = async (score: number) => {
    if (!user || !id) return;
    try {
      await rateSong(id, score);
      setUserRating(score);
      showToast(`Rated ${score} star${score > 1 ? 's' : ''}!`, 'success');
    } catch {
      showToast('Failed to rate song', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (loading) {
    return <div className="py-16 text-center text-[var(--text-secondary)]">Loading your reading room...</div>;
  }

  if (error || !song) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-[var(--gold-light)]">
        {error || 'Song not found'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="surface-card mb-8 overflow-hidden">
        <div className="grid lg:grid-cols-[260px_1fr]">
          <div className="relative min-h-64 bg-[var(--bg-elevated)]">
            {song.thumbnail_url ? <img src={song.thumbnail_url} alt={song.title} className="h-full min-h-64 w-full object-cover" /> : <div className="flex h-full min-h-64 items-center justify-center"><Music2 className="h-14 w-14 text-[var(--gold-muted)]" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
          </div>
          <div className="p-6 sm:p-8">
            <p className="eyebrow">The reading room</p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">{song.title}</h1>
            <p className="mt-2 text-xl text-[var(--gold-light)]">{song.artist}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {song.album && <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5">{song.album}</span>}
              {song.release_date && <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5">{new Date(song.release_date).toLocaleDateString()}</span>}
              <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5">Authorized content</span>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">Read along with the words that make this song yours. Translations, sharing, and synchronized playback can build on this space as the catalog grows.</p>

            {user && (
              <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Rate this song</p>
                <div className="flex gap-1" aria-label="Rate this song from one to five stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => handleRate(star)} className="rounded-lg p-1 transition-transform hover:scale-110" aria-label={`${star} star${star > 1 ? 's' : ''}`}>
                      <Star className={`h-6 w-6 ${star <= userRating ? 'fill-current text-[var(--gold-light)]' : 'text-[var(--text-muted)]'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {lyrics ? (
        <section className="surface-card mb-8 p-6 sm:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
            <div><p className="eyebrow">Words & meaning</p><h2 className="section-heading mt-2">Lyrics</h2></div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5">Translation ready</span><span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5">Reading mode</span></div>
          </div>
          <pre className="lyrics-copy whitespace-pre-wrap">{lyrics}</pre>
          <p className="mt-8 border-t border-[var(--border-subtle)] pt-5 text-xs leading-6 text-[var(--text-muted)]">Only display lyrics you are licensed or authorized to publish. Community corrections and translations should pass through review before being marked verified.</p>
        </section>
      ) : (
        <section className="surface-card mb-8 p-10 text-center text-[var(--text-secondary)]">No lyrics available yet.</section>
      )}

      <section className="surface-card p-6 sm:p-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]"><MessageSquare className="h-5 w-5 text-[var(--gold-light)]" /> Community notes <span className="text-sm font-normal text-[var(--text-muted)]">({comments.length})</span></h2>
        {user && (
          <form onSubmit={handleAddComment} className="mb-6 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="song-comment" className="sr-only">Add a comment</label>
            <input id="song-comment" type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share a thought about this song..." className="min-h-12 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none" maxLength={500} />
            <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /> Post note</button>
          </form>
        )}
        {comments.length > 0 ? <div className="space-y-4">{comments.map((comment) => <div key={comment.id} className="border-b border-[var(--border-subtle)] pb-4 last:border-0"><div className="flex items-start justify-between gap-4"><span className="font-semibold text-[var(--gold-light)]">{comment.user.username}</span><span className="text-xs text-[var(--text-muted)]">{new Date(comment.created_at).toLocaleDateString()}</span></div><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{comment.content}</p></div>)}</div> : <p className="text-sm text-[var(--text-muted)]">No community notes yet.</p>}
      </section>
    </div>
  );
};

export default SongDetails;