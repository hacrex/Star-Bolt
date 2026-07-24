import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Music2 } from 'lucide-react';

const FeaturedArtist = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Featured Artist of the Week</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="relative h-64">
          <img
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80"
            alt="Featured Artist"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-yellow-400">Featured Artist</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Taylor Swift</h3>
            <p className="text-gray-300">11 Grammy Awards · 200M+ Records Sold</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Popular Songs</h4>
            <Link to="/search?q=Taylor+Swift" className="text-purple-400 hover:text-purple-300 text-sm">View All</Link>
          </div>
          <div className="space-y-3">
            {['Anti-Hero', 'Cruel Summer', 'Shake It Off'].map((song) => (
              <div key={song} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Music2 className="w-4 h-4 text-gray-400" />
                <span>{song}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtist;