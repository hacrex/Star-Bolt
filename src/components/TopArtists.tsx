import React from 'react';
import { Users } from 'lucide-react';

const TopArtists: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Top Artists
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {/* Placeholder for artists */}
        <div className="bg-gray-800 rounded-lg p-6 min-w-[200px]">
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    </section>
  );
}

export default TopArtists;