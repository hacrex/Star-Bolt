import React from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Song = Database['public']['Tables']['songs']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'] & { user: { username: string } };

const SongDetails = () => {
  const { id } = useParams();
  const [song, setSong] = React.useState<Song | null>(null);
  const [lyrics, setLyrics] = React.useState<string>('');
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch song details
        const { data: songData, error: songError } = await supabase
          .from('songs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (songError) throw songError;
        setSong(songData);

        // Fetch lyrics
        const { data: lyricsData, error: lyricsError } = await supabase
          .from('lyrics')
          .select('content')
          .eq('song_id', id)
          .single();
        
        if (lyricsError && lyricsError.code !== 'PGRST116') throw lyricsError;
        setLyrics(lyricsData?.content || '');

        // Fetch comments with user info
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*, user:users(username)')
          .eq('song_id', id)
          .order('created_at', { ascending: false });
        
        if (commentsError) throw commentsError;
        setComments(commentsData as Comment[]);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load song details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSongDetails();
    }
  }, [id]);

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
          Comments
        </h2>
        
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