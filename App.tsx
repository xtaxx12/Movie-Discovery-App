import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import ApiKeyModal from './components/ApiKeyModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { 
  fetchPopularMovies, 
  fetchTopRatedMovies, 
  fetchPopularTV, 
  fetchUpcomingMovies, 
  searchMulti,
  FetchResult
} from './services/tmdbService';
import { Movie } from './types';

const AppContent: React.FC = () => {
  const { language, t } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>(() => {
    try {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Error loading favorites", e);
        return [];
    }
  });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleToggleFavorite = (movie: Movie) => {
    setFavorites(prevFavs => {
      const exists = prevFavs.some(f => f.id === movie.id);
      let newFavs;
      if (exists) {
        newFavs = prevFavs.filter(f => f.id !== movie.id);
      } else {
        newFavs = [...prevFavs, movie];
      }
      localStorage.setItem('favorites', JSON.stringify(newFavs));
      
      if (activeCategory === 'favorites') {
        setMovies(newFavs);
      }
      
      return newFavs;
    });
  };

  const loadContent = async (category: string, query?: string, pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    if (category === 'favorites') {
        setMovies(favorites);
        setTotalPages(1);
        setPage(1);
        setLoading(false);
        return;
    }

    try {
      let data: FetchResult = { results: [], total_pages: 0 };
      
      if (query) {
         data = await searchMulti(query, pageNum, language);
      } else {
        switch (category) {
          case 'home':
            data = await fetchPopularMovies(pageNum, language);
            break;
          case 'movies':
            data = await fetchTopRatedMovies(pageNum, language);
            break;
          case 'series':
            data = await fetchPopularTV(pageNum, language);
            break;
          case 'upcoming':
            data = await fetchUpcomingMovies(pageNum, language);
            break;
          default:
            data = await fetchPopularMovies(pageNum, language);
        }
      }

      setMovies(data.results);
      setTotalPages(data.total_pages);
      setPage(pageNum);

    } catch (err) {
      setError(t('errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(activeCategory, currentQuery, 1);
  }, [language]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentQuery(''); 
    setPage(1);
    loadContent(category, '', 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setActiveCategory('search');
    setCurrentQuery(query);
    setPage(1);
    loadContent('search', query, 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    if (activeCategory === 'favorites') return;

    if (newPage >= 1 && newPage <= totalPages) {
      if (activeCategory === 'search') {
        loadContent('search', currentQuery, newPage);
      } else {
        loadContent(activeCategory, '', newPage);
      }
      const grid = document.getElementById('movies');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
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
    if (activeCategory === 'search') return `${t('searchResults')} "${currentQuery}"`;
    if (activeCategory === 'movies') return t('topRatedMovies');
    if (activeCategory === 'series') return t('popularSeries');
    if (activeCategory === 'upcoming') return t('upcomingReleases');
    if (activeCategory === 'favorites') return t('myFavorites');
    return t('popularTitle');
  };

  const isSelectedMovieFavorite = selectedMovie 
    ? favorites.some(f => f.id === selectedMovie.id) 
    : false;

  if (loading && movies.length === 0 && activeCategory !== 'favorites') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="text-white mt-4 font-semibold animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-red-600 selection:text-white pb-10 flex flex-col">
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
        isFavorite={isSelectedMovieFavorite}
        onToggleFavorite={() => selectedMovie && handleToggleFavorite(selectedMovie)}
      />

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
           <i className="fas fa-video-slash text-6xl text-gray-600 mb-4"></i>
           <h2 className="text-2xl font-bold mb-2">{t('errorTitle')}</h2>
           <p className="text-gray-400 mb-6">{error}</p>
           <button onClick={() => loadContent(activeCategory, currentQuery, 1)} className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700">
             {t('retry')}
           </button>
        </div>
      ) : (
        <>
          {activeCategory === 'home' && movies.length > 0 && (
            <Hero 
              movie={movies[0]} 
              onMoreInfoClick={() => openModal(movies[0])}
            />
          )}

          <main id="movies" className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${activeCategory === 'home' ? '-mt-20 py-16' : 'pt-24 py-16'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{getPageTitle()}</h2>
              {activeCategory !== 'search' && activeCategory !== 'favorites' && (
                <div className="flex gap-2">
                   <button onClick={() => handleCategoryChange('movies')} className="text-xs border border-gray-600 px-2 py-1 rounded hover:bg-white hover:text-black transition-colors">{t('movies')}</button>
                   <button onClick={() => handleCategoryChange('series')} className="text-xs border border-gray-600 px-2 py-1 rounded hover:bg-white hover:text-black transition-colors">{t('series')}</button>
                </div>
              )}
            </div>
            
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
                </div>
            ) : movies.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    {activeCategory === 'favorites' ? (
                        <>
                             <i className="far fa-heart text-5xl mb-4 text-gray-700"></i>
                             <p className="text-lg">{t('noFavorites')}</p>
                             <p className="text-sm mt-2">{t('addFavorites')}</p>
                             <button onClick={() => handleCategoryChange('home')} className="mt-6 text-red-500 hover:text-red-400 underline">
                                {t('exploreContent')}
                             </button>
                        </>
                    ) : (
                        <>
                            <i className="far fa-folder-open text-5xl mb-4"></i>
                            <p>{t('noResults')}</p>
                        </>
                    )}
                </div>
            ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                    {(activeCategory === 'home' && page === 1
                        ? movies.slice(1) 
                        : movies
                     ).map((movie) => (
                        <MovieCard 
                        key={`${movie.id}-${movie.media_type}`} 
                        movie={movie} 
                        onClick={() => openModal(movie)}
                        />
                    ))}
                  </div>

                  {activeCategory !== 'favorites' && totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-4">
                        <button 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="bg-slate-800 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-slate-800 border border-slate-700 text-white font-semibold w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center"
                        >
                        <i className="fas fa-chevron-left"></i>
                        </button>
                        
                        <span className="text-gray-400 font-medium">
                            {t('page')} <span className="text-white font-bold">{page}</span> {t('of')} <span className="text-white">{totalPages > 500 ? 500 : totalPages}</span>
                        </span>

                        <button 
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="bg-slate-800 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-slate-800 border border-slate-700 text-white font-semibold w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center"
                        >
                        <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                  )}
                </>
            )}
          </main>

          <footer className="bg-black py-12 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex justify-center gap-6 text-2xl text-gray-400">
                <i className="fab fa-twitter hover:text-white cursor-pointer transition-colors"></i>
                <i className="fab fa-instagram hover:text-white cursor-pointer transition-colors"></i>
                <i className="fab fa-github hover:text-white cursor-pointer transition-colors"></i>
              </div>
              <p className="text-gray-700 text-xs mt-8">
                &copy; {new Date().getFullYear()} CineStream. {t('footerText')}
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
