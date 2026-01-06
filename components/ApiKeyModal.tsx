import React from 'react';
import { API_KEY } from '../services/tmdbService';

interface ApiKeyModalProps {
  onRetry: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onRetry }) => {
  // Simple check if the user left the placeholder
  if (API_KEY !== 'TU_API_KEY_AQUI') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-lg w-full shadow-2xl text-center">
        <div className="text-red-500 text-5xl mb-4">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">API Key Requerida</h2>
        <p className="text-gray-300 mb-6">
          Para ver el contenido, necesitas editar el archivo <code className="bg-slate-950 px-1 py-0.5 rounded text-red-400">services/tmdbService.ts</code> y colocar tu API Key de TMDB.
        </p>
        <div className="bg-slate-950 p-4 rounded text-left mb-6 overflow-x-auto">
            <pre className="text-xs text-green-400">
{`// services/tmdbService.ts
export const API_KEY = 'TU_API_KEY_AQUI'; // <--- Cambia esto`}
            </pre>
        </div>
        <button 
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors w-full"
        >
          Ya la he puesto, recargar
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;