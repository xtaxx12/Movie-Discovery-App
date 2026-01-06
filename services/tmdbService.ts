import { TMDBResponse, Movie, VideoResponse, Video, MovieDetails } from '../types';

// ==========================================
// 🔑 TU_API_KEY_AQUI
// Por favor, reemplaza esta cadena con tu API Key v3 de TMDB
// ==========================================
export const API_KEY: string = '43711959018d1023c3d8568219a6cab6'; 

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'original' | 'w500' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  if (API_KEY === 'TU_API_KEY_AQUI') {
    console.warn('⚠️ ATENCIÓN: No has configurado tu API KEY de TMDB en services/tmdbService.ts');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: TMDBResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const fetchMovieVideos = async (movieId: number): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=es-ES` // Attempt ES first
    );

    if (!response.ok) throw new Error('Failed to fetch videos');

    const data: VideoResponse = await response.json();
    
    // Fallback: If no results in Spanish, try English (common issue with TMDB)
    if (data.results.length === 0) {
       const responseEn = await fetch(
        `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
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

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES`
    );
    if (!response.ok) throw new Error('Failed to fetch details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};