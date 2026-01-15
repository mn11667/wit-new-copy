import React from 'react';
import { useTheme, Theme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { theme, effectiveTheme, setTheme } = useTheme();

    const cycleTheme = () => {
        const themeOrder: Theme[] = ['dark', 'light', 'auto'];
        const currentIndex = themeOrder.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        setTheme(themeOrder[nextIndex]);
    };

    const getIcon = () => {
        if (theme === 'auto') {
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            );
        }

        if (effectiveTheme === 'dark') {
            // Moon icon
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            );
        } else {
            // Sun icon
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            );
        }
    };

    const getLabel = () => {
        if (theme === 'auto') return 'Auto (System)';
        return theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    };

    return (
        <button
            onClick={cycleTheme}
            className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-white/5 hover:bg-white/10
        border border-white/10 hover:border-white/20
        text-slate-300 hover:text-white
        transition-all duration-200
        group
        ${className}
      `}
            title={`Theme: ${getLabel()}`}
            aria-label={`Change theme - Current: ${getLabel()}`}
        >
            <span className="transition-transform duration-300 group-hover:rotate-12">
                {getIcon()}
            </span>
            <span className="text-sm font-medium hidden sm:inline">
                {theme === 'auto' ? 'Auto' : effectiveTheme === 'dark' ? 'Dark' : 'Light'}
            </span>

            {/* Tooltip */}
            <span className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2 py-1 text-xs rounded bg-slate-900 text-white
        opacity-0 group-hover:opacity-100
        pointer-events-none transition-opacity
        whitespace-nowrap
      ">
                Click to switch ({theme === 'dark' ? 'Light' : theme === 'light' ? 'Auto' : 'Dark'})
            </span>
        </button>
    );
};
