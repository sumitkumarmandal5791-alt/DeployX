import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-200 
                ${isDark
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                    : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                } ${className}`}
            aria-label="Toggle Theme"
        >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};

export default ThemeToggle;
