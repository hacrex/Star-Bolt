import React from 'react';
import { Music2 } from 'lucide-react';

const TopNewSongs: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Music2 className="w-6 h-6" />
        Top New Songs
      </h2>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {/* Placeholder for new songs */}
          <div className="bg-gray-800 rounded-lg p-6 min-w-[300px]">
            <p className="text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TopNewSongs;