import React from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Send } from 'lucide-react';
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
    return <div className="text-center py-8">Loading song details...</div>;
  }

  if (error || !song) {
    return (
      <div className="text-center py-8 text-red-500">
        {error || 'Song not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
        {song.thumbnail_url && (
          <img
            src={song.thumbnail_url}
            alt={song.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
          <p className="text-xl text-gray-400 mb-4">{song.artist}</p>
          {song.album && (
            <p className="text-gray-500 mb-2">Album: {song.album}</p>
          )}
          {song.release_date && (
            <p className="text-gray-500">
              Released: {new Date(song.release_date).toLocaleDateString()}
            </p>
          )}

          {user && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Rate this song:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= userRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lyrics ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Lyrics</h2>
          <pre className="whitespace-pre-wrap font-sans text-gray-300">
            {lyrics}
          </pre>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center text-gray-400">
          No lyrics available yet
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Comments ({comments.length})
        </h2>

        {user && (
          <form onSubmit={handleAddComment} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-700 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-purple-400">
                    {comment.user.username}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default SongDetails;