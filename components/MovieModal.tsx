import React, { useEffect, useState, useRef } from 'react';
import { Movie, MovieDetails } from '../types';
import { getImageUrl, fetchMovieVideos, fetchMovieDetails, fetchRecommendations } from '../services/tmdbService';
import MovieCard from './MovieCard';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onMovieSelect?: (movie: Movie) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose, onMovieSelect, isFavorite, onToggleFavorite }) => {
  const [renderMovie, setRenderMovie] = useState<Movie | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (movie) {
      setRenderMovie(movie); // Update content immediately for open animation
      document.body.style.overflow = 'hidden';
      // Reset scroll position when movie changes
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      const type = movie.media_type || 'movie'; // Default to movie if undefined
      
      loadTrailer(movie.id, type);
      fetchMovieDetails(movie.id, type).then(setDetails).catch(err => console.error(err));
      fetchRecommendations(movie.id, type).then(setRecommendations).catch(err => console.error(err));
      
      // Trigger fade-in animation
      // Small timeout ensures the render happened before opacity change
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      // Wait for animation to finish before removing content/scroll lock
      const timer = setTimeout(() => {
        setRenderMovie(null);
        document.body.style.overflow = 'auto';
        setTrailerKey(null);
        setIsPlaying(false);
        setDetails(null);
        setRecommendations([]);
      }, 300); // Matches duration-300
      return () => clearTimeout(timer);
    }
  }, [movie]);

  const loadTrailer = async (movieId: number, type: 'movie' | 'tv') => {
    setLoadingTrailer(true);
    setTrailerKey(null);
    setIsPlaying(false);
    
    try {
      const videos = await fetchMovieVideos(movieId, type);
      // Priority: Official Trailer -> Trailer -> Teaser, strictly YouTube
      const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
                   || videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') 
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

  const handleClose = () => {
    setIsVisible(false); // Trigger close animation
    // The parent controls 'movie' prop. We call onClose immediately, 
    // parent sets movie to null, which triggers the useEffect 'else' block for cleanup.
    // However, to make it smooth, we can just call onClose. 
    // But if parent sets null immediately, the effect runs. 
    // We rely on the effect's delay to keep content visible during fade out.
    onClose(); 
  };

  const renderStars = (voteAverage: number) => {
    const stars = [];
    const rating = voteAverage / 2; // Convert 0-10 scale to 0-5 scale
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (rating >= i - 0.5) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-gray-600"></i>);
      }
    }
    return stars;
  };

  // Only return null if we have absolutely nothing to render (initial state)
  if (!renderMovie && !movie) return null;

  // Use renderMovie to keep content valid during fade-out
  const activeMovie = movie || renderMovie;
  if (!activeMovie) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center sm:p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div 
        className={`relative bg-[#181818] w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out transform ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-50 w-9 h-9 sm:w-10 sm:h-10 bg-[#181818]/60 hover:bg-[#181818] rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef} 
          className="overflow-y-auto flex-1 no-scrollbar"
        >
            
            {/* Hero Image / Video Section */}
            <div className="relative aspect-video w-full bg-black shadow-lg">
                {isPlaying && trailerKey ? (
                <iframe
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0&modestbranding=1&fs=1&iv_load_policy=3&color=white`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
                ) : (
                <>
                    <img 
                        src={getImageUrl(activeMovie.backdrop_path, 'original')} 
                        alt={activeMovie.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 p-4 sm:p-8 w-full z-10 transition-transform duration-500 delay-100 translate-y-0 opacity-100">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg leading-tight">
                            {activeMovie.title}
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
                            
                            <button 
                                onClick={onToggleFavorite}
                                className={`
                                    px-4 sm:px-8 py-2 rounded font-bold flex items-center gap-2 transition-colors border text-sm sm:text-base
                                    ${isFavorite 
                                        ? 'bg-white/90 text-black border-white hover:bg-white' 
                                        : 'bg-gray-500/40 text-white hover:bg-gray-500/60 border-white/20'}
                                `}
                            >
                                <i className={`${isFavorite ? 'fas fa-heart text-red-600' : 'far fa-heart'}`}></i> 
                                <span className="hidden sm:inline">{isFavorite ? 'En Favoritos' : 'Favoritos'}</span>
                            </button>
                        </div>
                    </div>
                </>
                )}
            </div>

            {/* Details Content */}
            <div className="p-4 sm:p-8 transition-opacity duration-500 delay-200">
              <div className="grid md:grid-cols-[2fr_1fr] gap-6 md:gap-8 mb-8">
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 flex-wrap">
                          <span className="text-green-400 font-bold">{(activeMovie.vote_average * 10).toFixed(0)}% Coincidencia</span>
                          <span>{activeMovie.release_date ? new Date(activeMovie.release_date).getFullYear() : 'N/A'}</span>
                          <span className="border border-gray-500 px-1 rounded uppercase">HD</span>
                          {activeMovie.vote_average >= 8 && (
                              <span className="border border-red-500 text-red-500 px-1 rounded text-[10px] sm:text-xs uppercase">Top Rated</span>
                          )}
                          {activeMovie.media_type === 'tv' && (
                              <span className="bg-gray-700 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">TV Series</span>
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
                        {details?.number_of_seasons && (
                             <span className="text-xs font-medium text-gray-400 px-2 py-0.5 flex items-center gap-1">
                                <i className="fas fa-layer-group"></i> {details.number_of_seasons} Temporadas
                             </span>
                        )}
                      </div>
                      
                      {details?.tagline && (
                        <p className="text-white italic text-sm border-l-2 border-red-600 pl-3">
                          "{details.tagline}"
                        </p>
                      )}

                      <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                          {details?.overview || activeMovie.overview || "No hay descripción disponible para este título."}
                      </p>
                  </div>
                  
                  <div className="space-y-4 text-xs sm:text-sm text-gray-400">
                      <div>
                          <span className="text-gray-500 block mb-1">Valoración:</span>
                          <div className="flex items-center gap-2">
                              <div className="flex text-sm space-x-0.5">
                                  {renderStars(activeMovie.vote_average)}
                              </div>
                              <span className="text-white font-bold text-sm sm:text-base">
                                  {activeMovie.vote_average.toFixed(1)}
                              </span>
                          </div>
                      </div>
                      <div>
                          <span className="text-gray-500 block mb-1">Título Original:</span>
                          <span className="text-white text-sm sm:text-base break-words">{activeMovie.title}</span>
                      </div>
                      <div>
                          <span className="text-gray-500 block mb-1">Fecha de estreno:</span>
                          <span className="text-white text-sm sm:text-base">{activeMovie.release_date || 'N/A'}</span>
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

              {/* Recommendations Carousel */}
              {recommendations.length > 0 && (
                <div className="mt-8 border-t border-gray-800 pt-8">
                  <h3 className="text-xl font-bold text-white mb-4">Recomendaciones</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {recommendations.map(rec => (
                        <div key={rec.id} className="min-w-[140px] w-[140px] sm:min-w-[180px] sm:w-[180px] flex-none">
                          <MovieCard 
                            movie={rec} 
                            onClick={() => onMovieSelect?.(rec)} 
                          />
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;