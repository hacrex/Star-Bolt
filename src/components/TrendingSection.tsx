import React from 'react';
import { TrendingUp } from 'lucide-react';

const TrendingSection: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Trending Now
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for trending content */}
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    </section>
  );
}

export default TrendingSection;