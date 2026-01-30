import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-stone-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-stone-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-center flex-grow">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
            AI Resume Tailor
            </h1>
            <p className="text-stone-500 dark:text-slate-400 mt-1">
            Craft the perfect resume for your dream job.
            </p>
        </div>
        {toggleTheme && (
          <button 
            onClick={toggleTheme}
            className="absolute right-4 p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;