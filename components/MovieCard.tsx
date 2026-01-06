import React from 'react';
import { Movie } from '../types';
import { getImageUrl } from '../services/tmdbService';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const year = new Date(movie.release_date).getFullYear();

  return (
    <div 
      className="group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-red-900/20 cursor-pointer"
      onClick={onClick}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-slate-800/80 border border-white/20 text-white rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 hover:bg-red-600 hover:border-red-600">
                <i className="fas fa-chevron-down text-xl"></i>
            </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <i className="fas fa-star text-[10px]"></i>
          {movie.vote_average.toFixed(1)}
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-white font-semibold text-base line-clamp-1 group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>{year || 'N/A'}</span>
          <span className="border border-gray-600 px-1 rounded text-[10px] uppercase">HD</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;