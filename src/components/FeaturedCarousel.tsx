import React from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

const FeaturedCarousel: React.FC = () => {
  const videos = [
    {
      id: 1,
      title: "Shape of You",
      artist: "Ed Sheeran",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    },
    {
      id: 2,
      title: "Blinding Lights",
      artist: "The Weeknd",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    },
    // Add more videos as needed
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 dark:text-white text-gray-900">Featured Lyric Videos</h2>
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide">
          {videos.map((video) => (
            <div key={video.id} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] p-2">
              <div className="relative group cursor-pointer">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                  <p className="text-sm text-gray-300">{video.artist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
};

export default FeaturedCarousel;