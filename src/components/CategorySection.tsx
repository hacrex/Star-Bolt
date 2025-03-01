import React from 'react';
import { Music, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = {
  genres: [
    { name: 'Pop', count: 1243 },
    { name: 'Hip-Hop', count: 892 },
    { name: 'Rock', count: 756 },
    { name: 'EDM', count: 445 },
    { name: 'Country', count: 334 },
    { name: 'Jazz', count: 223 },
  ],
  languages: [
    { name: 'English', count: 2345 },
    { name: 'Spanish', count: 1234 },
    { name: 'Hindi', count: 890 },
    { name: 'Korean', count: 567 },
    { name: 'Japanese', count: 445 },
    { name: 'French', count: 334 },
  ]
};

const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (type: string, category: string) => {
    navigate(`/search?${type}=${encodeURIComponent(category)}`);
  };

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Genres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Browse by Genre
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.genres.map((genre) => (
              <button
                key={genre.name}
                onClick={() => handleCategoryClick('genre', genre.name)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span>{genre.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{genre.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Browse by Language
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.languages.map((language) => (
              <button
                key={language.name}
                onClick={() => handleCategoryClick('language', language.name)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span>{language.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{language.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;