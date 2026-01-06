import React, { useEffect, useState } from 'react';
import { Movie, MovieDetails } from '../types';
import { getImageUrl, fetchMovieVideos, fetchMovieDetails } from '../services/tmdbService';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose }) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden';
      loadTrailer(movie.id);
      fetchMovieDetails(movie.id).then(setDetails).catch(err => console.error(err));
    } else {
      document.body.style.overflow = 'auto';
      setTrailerKey(null);
      setIsPlaying(false);
      setDetails(null);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [movie]);

  const loadTrailer = async (movieId: number) => {
    setLoadingTrailer(true);
    setTrailerKey(null);
    setIsPlaying(false);
    
    try {
      const videos = await fetchMovieVideos(movieId);
      // Priority: Official Trailer -> Trailer -> Teaser, strictly YouTube
      const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') 
                   || videos.find(v => v.site === 'YouTube' && v.type === 'Teaser');
      
      if (trailer) {
        setTrailerKey(trailer.key);
      }
    } catch (e) {
      console.error("Could not load trailer");
    } finally {
      setLoadingTrailer(false);
    }
  };

  const handlePlayClick = () => {
    if (trailerKey) {
      setIsPlaying(true);
    }
  };

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
      {/* Animation Styles */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div 
        className="relative bg-[#181818] w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'modalFadeIn 0.3s ease-out' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-9 h-9 sm:w-10 sm:h-10 bg-[#181818]/60 hover:bg-[#181818] rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
            
            {/* Hero Image / Video Section */}
            <div className="relative aspect-video w-full bg-black">
                {isPlaying && trailerKey ? (
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
                ) : (
                <>
                    <img 
                        src={getImageUrl(movie.backdrop_path, 'original')} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 p-4 sm:p-8 w-full z-10">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg leading-tight">
                            {movie.title}
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <button 
                            onClick={handlePlayClick}
                            disabled={!trailerKey || loadingTrailer}
                            className={`
                                px-4 sm:px-8 py-2 rounded font-bold flex items-center gap-2 transition-colors text-sm sm:text-base
                                ${(!trailerKey && !loadingTrailer) 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-black hover:bg-gray-200'}
                            `}
                            >
                                {loadingTrailer ? (
                                    <><i className="fas fa-spinner fa-spin"></i> <span className="hidden sm:inline">Cargando...</span></>
                                ) : trailerKey ? (
                                    <><i className="fas fa-play"></i> Ver Tráiler</>
                                ) : (
                                    <><i className="fas fa-video-slash"></i> Sin Tráiler</>
                                )}
                            </button>
                            <button className="bg-gray-500/40 text-white hover:bg-gray-500/60 px-4 sm:px-8 py-2 rounded font-bold flex items-center gap-2 transition-colors border border-white/20 text-sm sm:text-base">
                                <i className="fas fa-plus"></i> <span className="hidden sm:inline">Mi Lista</span>
                            </button>
                        </div>
                    </div>
                </>
                )}
            </div>

            {/* Details Content */}
            <div className="p-4 sm:p-8 grid md:grid-cols-[2fr_1fr] gap-6 md:gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 flex-wrap">
                        <span className="text-green-400 font-bold">{(movie.vote_average * 10).toFixed(0)}% Coincidencia</span>
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        <span className="border border-gray-500 px-1 rounded uppercase">HD</span>
                        {movie.vote_average >= 8 && (
                             <span className="border border-red-500 text-red-500 px-1 rounded text-[10px] sm:text-xs uppercase">Top Rated</span>
                        )}
                    </div>

                    {/* Genres & Runtime */}
                    <div className="flex flex-wrap gap-2">
                      {details?.genres?.map((genre) => (
                          <span key={genre.id} className="text-xs font-medium text-gray-300 border border-gray-600 px-2 py-0.5 rounded-full bg-white/5">
                              {genre.name}
                          </span>
                      ))}
                      {details?.runtime && details.runtime > 0 && (
                          <span className="text-xs font-medium text-gray-400 px-2 py-0.5 flex items-center gap-1">
                               <i className="far fa-clock"></i> {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                          </span>
                      )}
                    </div>
                    
                    {details?.tagline && (
                      <p className="text-white italic text-sm border-l-2 border-red-600 pl-3">
                        "{details.tagline}"
                      </p>
                    )}

                    <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                        {details?.overview || movie.overview || "No hay descripción disponible para este título."}
                    </p>
                </div>
                
                <div className="space-y-4 text-xs sm:text-sm text-gray-400">
                    <div>
                        <span className="text-gray-500 block mb-1">Valoración:</span>
                        <span className="text-white flex items-center gap-2 text-sm sm:text-base">
                            <i className="fas fa-star text-yellow-500"></i> {movie.vote_average.toFixed(1)} <span className="text-gray-600 text-xs">/ 10</span>
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block mb-1">Título Original:</span>
                        <span className="text-white text-sm sm:text-base break-words">{movie.title}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block mb-1">Fecha de estreno:</span>
                        <span className="text-white text-sm sm:text-base">{movie.release_date}</span>
                    </div>
                    {details && (
                       <div>
                          <span className="text-gray-500 block mb-1">Géneros:</span>
                          <span className="text-white text-sm">
                            {details.genres.map(g => g.name).join(", ")}
                          </span>
                       </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;