import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const { user, signOut } = useAuth();

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
        <div className="flex items-center gap-3 absolute right-4">
          {user && (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-stone-200 dark:border-slate-600"
                />
              )}
              <span className="hidden sm:block text-sm text-stone-600 dark:text-slate-300 max-w-[120px] truncate">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;