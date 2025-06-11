import React from 'react';
import SuggestionsToFollow from '../components/profile/SuggestionsToFollow';

const DiscoverPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0 py-8">
      <h1 className="text-2xl font-bold mb-6 text-primary-700 dark:text-primary-300 text-center">Descubrir personas</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
        Explora nuevos perfiles y amplía tu red siguiendo a creadores, artistas y miembros de la comunidad.
      </p>
      <SuggestionsToFollow />
    </div>
  );
};

export default DiscoverPage;
