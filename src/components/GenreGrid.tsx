import React from 'react';
import { Mic2 } from 'lucide-react';

const GenreGrid: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Mic2 className="w-6 h-6" />
        Browse by Genre
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Placeholder for genres */}
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    </section>
  );
}

export default GenreGrid;