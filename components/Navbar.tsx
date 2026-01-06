import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-2xl">
              <i className="fas fa-play-circle"></i>
            </span>
            <span className="font-bold text-xl tracking-wider text-white">
              CINE<span className="text-red-600">STREAM</span>
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-white hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Inicio</a>
              <a href="#movies" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Películas</a>
              <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Series</a>
              <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Novedades</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              <i className="fas fa-search text-lg"></i>
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <div className="h-8 w-8 rounded bg-red-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer">
              US
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;