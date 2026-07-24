import React, { useState, useEffect } from 'react';
import { Play, Share2, ExternalLink, TrendingUp, Clock, Hash } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  duration: string;
}

const MOCK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'How to Write Better Lyrics - Star Lyrix Tutorial',
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
    views: '1.2M',
    publishedAt: '2025-02-10',
    duration: '10:23'
  },
  {
    id: 'xvFZjo5PgG0',
    title: 'Using AI to Generate Creative Lyrics - Pro Tips',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
    views: '856K',
    publishedAt: '2025-02-08',
    duration: '8:45'
  },
  {
    id: 'yPYZpwSpKmA',
    title: 'Songwriting Masterclass with Star Lyrix',
    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80',
    views: '623K',
    publishedAt: '2025-02-05',
    duration: '15:30'
  },
  // Add more mock videos as needed
];

const CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'latest', name: 'Latest', icon: Clock },
  { id: 'tutorials', name: 'Tutorials', icon: Hash },
];

const Videos = () => {
  const { darkMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState('trending');
  const [videos, setVideos] = useState<YouTubeVideo[]>(MOCK_VIDEOS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVideos(MOCK_VIDEOS);
  }, [activeCategory]);

  const handleShare = async (video: YouTubeVideo) => {
    const shareText = `🎶 Check out this latest Star Lyrix video! Watch here: https://youtube.com/watch?v=${video.id}`;
    
    try {
      await navigator.share({
        title: video.title,
        text: shareText,
        url: `https://youtube.com/watch?v=${video.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Star Lyrix Videos</h1>
        <a
          href="https://youtube.com/@starlyrix"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          Visit Our Channel
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Categories */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              activeCategory === id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {name}
          </button>
        ))}
      </div>

      {/* Featured Playlist */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Featured Playlist</h2>
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/videoseries?list=PLv7V_-HyQYkDg-wST4bBwJqLl_JH-uXQK"
            title="Star Lyrix Featured Playlist"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          videos.map((video) => (
            <div key={video.id} className="group">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </a>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>{video.views} views</span>
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleShare(video)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* YouTube Shorts Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Short & Sweet</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {videos.map((video) => (
            <div
              key={`short-${video.id}`}
              className="flex-shrink-0 w-[200px] group"
            >
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-2">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`https://youtube.com/shorts/${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Videos;