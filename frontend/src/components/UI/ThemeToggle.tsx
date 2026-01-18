import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { theme } = useTheme();

    // Theme is always dark now, but keep component for UI consistency
    const getIcon = () => {
        // Always show moon icon for dark mode
        return (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        );
    };

    return (
        <button
            disabled
            className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-white/5 
        border border-white/10
        text-slate-400 
        cursor-not-allowed opacity-60
        ${className}
      `}
            title="Dark Mode (Fixed)"
            aria-label="Dark Mode - Always enabled"
        >
            <span>
                {getIcon()}
            </span>
            <span className="text-sm font-medium hidden sm:inline">
                Dark
            </span>

            {/* Tooltip */}
            <span className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2 py-1 text-xs rounded bg-slate-900 text-white
        opacity-0 group-hover:opacity-100
        pointer-events-none transition-opacity
        whitespace-nowrap
      ">
                Dark mode is always enabled
            </span>
        </button>
    );
};
