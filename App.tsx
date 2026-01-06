import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import ApiKeyModal from './components/ApiKeyModal';
import { fetchPopularMovies } from './services/tmdbService';
import { Movie } from './types';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchPopularMovies();
      setMovies(results);
    } catch (err) {
      setError('No se pudieron cargar las películas. Verifica tu conexión o tu API Key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="text-white mt-4 font-semibold animate-pulse">Cargando cartelera...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <ApiKeyModal onRetry={handleRetry} />
      <MovieModal movie={selectedMovie} onClose={closeModal} />

      {error ? (
        <div className="h-screen flex flex-col items-center justify-center text-center px-4">
           <i className="fas fa-video-slash text-6xl text-gray-600 mb-4"></i>
           <h2 className="text-2xl font-bold mb-2">Ups, algo salió mal</h2>
           <p className="text-gray-400 mb-6">{error}</p>
           <button onClick={loadMovies} className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700">
             Reintentar
           </button>
        </div>
      ) : (
        <>
          {/* Hero Section (First movie) */}
          {movies.length > 0 && (
            <Hero 
              movie={movies[0]} 
              onMoreInfoClick={() => openModal(movies[0])}
            />
          )}

          {/* Main Content Grid */}
          <main id="movies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Populares en CineStream</h2>
              <button className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Ver todo <i className="fas fa-chevron-right ml-1 text-xs"></i>
              </button>
            </div>

            {/* Movie Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
              {movies.slice(1).map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onClick={() => openModal(movie)}
                />
              ))}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-black py-12 border-t border-gray-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex justify-center gap-6 text-2xl text-gray-400">
                <i className="fab fa-twitter hover:text-white cursor-pointer transition-colors"></i>
                <i className="fab fa-instagram hover:text-white cursor-pointer transition-colors"></i>
                <i className="fab fa-github hover:text-white cursor-pointer transition-colors"></i>
              </div>
              <p className="text-gray-700 text-xs mt-8">
                &copy; {new Date().getFullYear()} CineStream. Datos provistos por TMDB API.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;