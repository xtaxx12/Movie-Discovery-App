import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'es-ES' | 'en-US';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  'es-ES': {
    home: 'Inicio',
    movies: 'Películas',
    series: 'Series',
    upcoming: 'Novedades',
    favorites: 'Favoritos',
    searchPlaceholder: 'Títulos, gente, géneros...',
    popularTitle: 'Populares en CineStream',
    topRatedMovies: 'Películas Mejor Valoradas',
    popularSeries: 'Series Populares',
    upcomingReleases: 'Novedades y Estrenos',
    myFavorites: 'Mi Lista de Favoritos',
    searchResults: 'Resultados para',
    loading: 'Cargando...',
    noFavorites: 'Aún no tienes favoritos.',
    addFavorites: 'Agrega películas o series para verlas aquí.',
    exploreContent: 'Explorar contenido',
    noResults: 'No se encontraron resultados.',
    errorTitle: 'Ups, algo salió mal',
    errorMessage: 'No se pudieron cargar los datos. Verifica tu conexión o tu API Key.',
    retry: 'Reintentar',
    page: 'Página',
    of: 'de',
    moreInfo: 'Más información',
    play: 'Reproducir',
    close: 'Cerrar',
    watchTrailer: 'Ver Tráiler',
    addToList: 'Mi Lista',
    removeFromList: 'Quitar de Lista',
    recommendations: 'Recomendaciones',
    footerText: 'Datos provistos por TMDB API.',
    // Mobile menu
    moviesShort: 'Pelis',
    upcomingShort: 'Nuevos',
    favoritesShort: 'Favs',
  },
  'en-US': {
    home: 'Home',
    movies: 'Movies',
    series: 'Series',
    upcoming: 'Upcoming',
    favorites: 'Favorites',
    searchPlaceholder: 'Titles, people, genres...',
    popularTitle: 'Popular on CineStream',
    topRatedMovies: 'Top Rated Movies',
    popularSeries: 'Popular Series',
    upcomingReleases: 'Upcoming Releases',
    myFavorites: 'My Favorites',
    searchResults: 'Results for',
    loading: 'Loading...',
    noFavorites: 'No favorites yet.',
    addFavorites: 'Add movies or series to see them here.',
    exploreContent: 'Explore content',
    noResults: 'No results found.',
    errorTitle: 'Oops, something went wrong',
    errorMessage: 'Could not load data. Check your connection or API Key.',
    retry: 'Retry',
    page: 'Page',
    of: 'of',
    moreInfo: 'More Info',
    play: 'Play',
    close: 'Close',
    watchTrailer: 'Watch Trailer',
    addToList: 'My List',
    removeFromList: 'Remove from List',
    recommendations: 'Recommendations',
    footerText: 'Data provided by TMDB API.',
    // Mobile menu
    moviesShort: 'Movies',
    upcomingShort: 'New',
    favoritesShort: 'Favs',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'es-ES';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
