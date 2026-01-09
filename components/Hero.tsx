import React from 'react';
import { Movie } from '../types';
import { getImageUrl } from '../services/tmdbService';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  movie: Movie;
  onMoreInfoClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onMoreInfoClick }) => {
  const { t, language } = useLanguage();
  const trendingText = language === 'es-ES' ? '#1 En Tendencia' : '#1 Trending';

  return (
    <div className="relative w-full h-[85vh] lg:h-[90vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradients for text readability and blending with body */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-6 pt-20">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              {trendingText}
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
              <i className="fas fa-star"></i>
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
            {movie.title}
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl line-clamp-3 md:line-clamp-4 drop-shadow-md max-w-xl">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-white text-black hover:bg-gray-200 transition-colors px-8 py-3 rounded font-bold flex items-center gap-2 text-lg">
              <i className="fas fa-play"></i> {t('play')}
            </button>
            <button 
              onClick={onMoreInfoClick}
              className="bg-gray-600/70 hover:bg-gray-600/90 text-white backdrop-blur-sm transition-colors px-8 py-3 rounded font-bold flex items-center gap-2 text-lg"
            >
              <i className="fas fa-info-circle"></i> {t('moreInfo')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
