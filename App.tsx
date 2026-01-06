import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import ApiKeyModal from './components/ApiKeyModal';
import { 
  fetchPopularMovies, 
  fetchTopRatedMovies, 
  fetchPopularTV, 
  fetchUpcomingMovies, 
  searchMulti 
} from './services/tmdbService';
import { Movie } from './types';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const loadContent = async (category: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      let results: Movie[] = [];
      
      if (query) {
         results = await searchMulti(query);
      } else {
        switch (category) {
          case 'home':
            results = await fetchPopularMovies();
            break;
          case 'movies':
            results = await fetchTopRatedMovies();
            break;
          case 'series':
            results = await fetchPopularTV();
            break;
          case 'upcoming':
            results = await fetchUpcomingMovies();
            break;
          default:
            results = await fetchPopularMovies();
        }
      }
      setMovies(results);
    } catch (err) {
      setError('No se pudieron cargar los datos. Verifica tu conexión o tu API Key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(activeCategory);
  }, []); // Initial load

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentQuery(''); // Clear search when changing category
    loadContent(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setActiveCategory('search');
    setCurrentQuery(query);
    loadContent('search', query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const getPageTitle = () => {
    if (activeCategory === 'search') return `Resultados para "${currentQuery}"`;
    if (activeCategory === 'movies') return 'Películas Mejor Valoradas';
    if (activeCategory === 'series') return 'Series Populares';
    if (activeCategory === 'upcoming') return 'Novedades y Estrenos';
    return 'Populares en CineStream';
  };

  // Loading State
  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="text-white mt-4 font-semibold animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-red-600 selection:text-white pb-10">
      <Navbar 
        onCategoryChange={handleCategoryChange} 
        onSearch={handleSearch}
        activeCategory={activeCategory}
      />
      
      <ApiKeyModal onRetry={handleRetry} />
      <MovieModal 
        movie={selectedMovie} 
        onClose={closeModal} 
        onMovieSelect={openModal}
      />

      {error ? (
        <div className="h-screen flex flex-col items-center justify-center text-center px-4">
           <i className="fas fa-video-slash text-6xl text-gray-600 mb-4"></i>
           <h2 className="text-2xl font-bold mb-2">Ups, algo salió mal</h2>
           <p className="text-gray-400 mb-6">{error}</p>
           <button onClick={() => loadContent(activeCategory)} className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700">
             Reintentar
           </button>
        </div>
      ) : (
        <>
          {/* Hero Section (Only show on Home or when we have valid data and not searching) */}
          {movies.length > 0 && activeCategory !== 'search' && (
            <Hero 
              movie={movies[0]} 
              onMoreInfoClick={() => openModal(movies[0])}
            />
          )}

          {/* Main Content Grid */}
          <main id="movies" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${activeCategory === 'search' ? 'pt-24' : '-mt-20 py-16'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{getPageTitle()}</h2>
              {activeCategory !== 'search' && (
                <div className="flex gap-2">
                   <button onClick={() => handleCategoryChange('movies')} className="text-xs border border-gray-600 px-2 py-1 rounded hover:bg-white hover:text-black transition-colors">Películas</button>
                   <button onClick={() => handleCategoryChange('series')} className="text-xs border border-gray-600 px-2 py-1 rounded hover:bg-white hover:text-black transition-colors">Series</button>
                </div>
              )}
            </div>

            {movies.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <i className="far fa-folder-open text-5xl mb-4"></i>
                    <p>No se encontraron resultados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                {/* If it's home/category, skip the first one because it is in Hero. If search, show all. */}
                {(activeCategory === 'search' ? movies : movies.slice(1)).map((movie) => (
                    <MovieCard 
                    key={`${movie.id}-${movie.media_type}`} // unique key for mixed lists
                    movie={movie} 
                    onClick={() => openModal(movie)}
                    />
                ))}
                </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-black py-12 border-t border-gray-800 mt-auto">
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