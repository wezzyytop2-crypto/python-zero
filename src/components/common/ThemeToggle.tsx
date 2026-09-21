import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200 border text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:scale-105 active:scale-95 shadow-sm ${className}`}
      title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      aria-label="Переключить тему оформления"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500 animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
};
