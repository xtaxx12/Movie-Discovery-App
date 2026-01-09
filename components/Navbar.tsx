import React, { useState, useEffect, useRef } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface NavbarProps {
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  activeCategory: string;
}

const Navbar: React.FC<NavbarProps> = ({ onCategoryChange, onSearch, activeCategory }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const getLinkClass = (category: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer";
    return activeCategory === category 
      ? `${baseClass} text-white bg-white/10` 
      : `${baseClass} text-gray-300 hover:text-white hover:bg-white/5`;
  };

  const getLanguageLabel = () => {
    return language === 'es-ES' ? 'ES' : 'EN';
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onCategoryChange('home')}
          >
            <span className="text-red-600 text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-play-circle"></i>
            </span>
            <span className="font-bold text-xl tracking-wider text-white">
              CINE<span className="text-red-600">STREAM</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a onClick={() => onCategoryChange('home')} className={getLinkClass('home')}>{t('home')}</a>
              <a onClick={() => onCategoryChange('movies')} className={getLinkClass('movies')}>{t('movies')}</a>
              <a onClick={() => onCategoryChange('series')} className={getLinkClass('series')}>{t('series')}</a>
              <a onClick={() => onCategoryChange('upcoming')} className={getLinkClass('upcoming')}>{t('upcoming')}</a>
              <a onClick={() => onCategoryChange('favorites')} className={getLinkClass('favorites')}>{t('favorites')}</a>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className={`flex items-center bg-black/50 rounded-full border border-gray-700 transition-all duration-300 overflow-hidden ${isSearchOpen ? 'w-48 sm:w-64 px-3 py-1' : 'w-8 h-8 justify-center border-transparent bg-transparent'}`}>
              <button onClick={toggleSearch} className="text-gray-300 hover:text-white transition-colors">
                <i className="fas fa-search text-lg"></i>
              </button>
              <form onSubmit={handleSearchSubmit} className={`flex-1 ml-2 ${isSearchOpen ? 'block' : 'hidden'}`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="bg-transparent text-white text-sm w-full focus:outline-none placeholder-gray-500"
                />
              </form>
              {isSearchOpen && searchQuery && (
                 <button onClick={() => { setSearchQuery(''); onCategoryChange('home'); setIsSearchOpen(false); }} className="text-gray-400 hover:text-white text-xs ml-1">
                   <i className="fas fa-times"></i>
                 </button>
              )}
            </div>

            <button className="text-gray-300 hover:text-white transition-colors hidden sm:block">
              <i className="fas fa-bell text-lg"></i>
            </button>

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="h-8 w-8 rounded bg-red-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-red-700 transition-colors"
              >
                {getLanguageLabel()}
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => handleLanguageChange('es-ES')}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors ${language === 'es-ES' ? 'bg-slate-800 text-white' : 'text-gray-300'}`}
                  >
                    <span className="text-lg">🇪🇸</span>
                    <span>Español</span>
                    {language === 'es-ES' && <i className="fas fa-check ml-auto text-red-500"></i>}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en-US')}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors ${language === 'en-US' ? 'bg-slate-800 text-white' : 'text-gray-300'}`}
                  >
                    <span className="text-lg">🇺🇸</span>
                    <span>English</span>
                    {language === 'en-US' && <i className="fas fa-check ml-auto text-red-500"></i>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden flex justify-around py-2 bg-black/90 text-xs text-gray-400 border-t border-gray-800 overflow-x-auto">
          <button onClick={() => onCategoryChange('home')} className={`whitespace-nowrap px-3 ${activeCategory === 'home' ? 'text-white' : ''}`}>{t('home')}</button>
          <button onClick={() => onCategoryChange('movies')} className={`whitespace-nowrap px-3 ${activeCategory === 'movies' ? 'text-white' : ''}`}>{t('moviesShort')}</button>
          <button onClick={() => onCategoryChange('series')} className={`whitespace-nowrap px-3 ${activeCategory === 'series' ? 'text-white' : ''}`}>{t('series')}</button>
          <button onClick={() => onCategoryChange('upcoming')} className={`whitespace-nowrap px-3 ${activeCategory === 'upcoming' ? 'text-white' : ''}`}>{t('upcomingShort')}</button>
          <button onClick={() => onCategoryChange('favorites')} className={`whitespace-nowrap px-3 ${activeCategory === 'favorites' ? 'text-white' : ''}`}>{t('favoritesShort')}</button>
      </div>
    </nav>
  );
};

export default Navbar;
