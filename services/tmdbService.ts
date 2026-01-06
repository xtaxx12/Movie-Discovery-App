import { TMDBResponse, Movie, VideoResponse, Video, MovieDetails } from '../types';

// ==========================================
// 🔑 TU_API_KEY_AQUI
// Por favor, reemplaza esta cadena con tu API Key v3 de TMDB
// ==========================================
export const API_KEY: string = '43711959018d1023c3d8568219a6cab6'; 

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const getImageUrl = (path: string | null, size: 'original' | 'w500' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Helper function to get data from localStorage with expiry check
const getFromCache = <T>(key: string): T | null => {
  try {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) return null;

    const { data, timestamp } = JSON.parse(cachedItem);
    const now = Date.now();

    if (now - timestamp < CACHE_DURATION) {
      return data as T;
    } else {
      // Expired
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

// Helper function to save data to localStorage
const saveToCache = (key: string, data: any) => {
  try {
    const item = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn('Error saving to cache (Storage likely full):', error);
  }
};

// --- API CALLS ---

export const fetchPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`
    );
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data: TMDBResponse = await response.json();
    return data.results.map(m => ({ ...m, media_type: 'movie' }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const fetchTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=${page}`
    );
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data: TMDBResponse = await response.json();
    return data.results.map(m => ({ ...m, media_type: 'movie' }));
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

export const fetchUpcomingMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=${page}`
    );
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data: TMDBResponse = await response.json();
    return data.results.map(m => ({ ...m, media_type: 'movie' }));
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const fetchPopularTV = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES&page=${page}`
    );
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    
    // Map TV specific fields to our generic Movie interface
    return data.results.map((tv: any) => ({
      id: tv.id,
      title: tv.name, // Map 'name' to 'title'
      overview: tv.overview,
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      vote_average: tv.vote_average,
      release_date: tv.first_air_date, // Map 'first_air_date' to 'release_date'
      genre_ids: tv.genre_ids,
      media_type: 'tv'
    }));
  } catch (error) {
    console.error('Error fetching popular TV:', error);
    throw error;
  }
};

export const searchMulti = async (query: string): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&include_adult=false`
    );
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    
    // Filter out 'person' results and map
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        genre_ids: item.genre_ids,
        media_type: item.media_type
      }));
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

export const fetchMovieVideos = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=es-ES`
    );

    if (!response.ok) throw new Error('Failed to fetch videos');

    const data: VideoResponse = await response.json();
    
    // Fallback: If no results in Spanish, try English
    if (data.results.length === 0) {
       const responseEn = await fetch(
        `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
      );
      const dataEn: VideoResponse = await responseEn.json();
      return dataEn.results;
    }

    return data.results;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const fetchMovieDetails = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails> => {
  const cacheKey = `${type}_details_${id}`;
  
  const cachedData = getFromCache<MovieDetails>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=es-ES`
    );
    if (!response.ok) throw new Error('Failed to fetch details');
    const data = await response.json();
    
    // Standardize title for TV
    if (type === 'tv') {
        data.title = data.name;
        data.release_date = data.first_air_date;
        // TV specific runtime
        if (data.episode_run_time && data.episode_run_time.length > 0) {
            data.runtime = data.episode_run_time[0];
        }
    }
    
    saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching details:', error);
    throw error;
  }
};

export const fetchRecommendations = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
  const cacheKey = `${type}_recs_${id}`;

  const cachedData = getFromCache<Movie[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}&language=es-ES&page=1`
    );
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    const data: TMDBResponse = await response.json();
    
    const results = data.results.map((item: any) => ({
      ...item,
      title: item.title || item.name,
      release_date: item.release_date || item.first_air_date,
      media_type: type
    }));
    
    saveToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};