import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type EffectiveTheme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    effectiveTheme: EffectiveTheme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'loksewa-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Get initial theme from localStorage or default to 'dark'
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return (stored as Theme) || 'dark';
    });

    // Determine effective theme based on system preference if auto
    const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() => {
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme as EffectiveTheme;
    });

    // Update effective theme when theme changes or system preference changes
    useEffect(() => {
        const updateEffectiveTheme = () => {
            if (theme === 'auto') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setEffectiveTheme(isDark ? 'dark' : 'light');
            } else {
                setEffectiveTheme(theme as EffectiveTheme);
            }
        };

        updateEffectiveTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'auto') {
                updateEffectiveTheme();
            }
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        // Legacy browsers
        else {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [theme]);

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(`theme-${effectiveTheme}`);
    }, [effectiveTheme]);

    // Persist theme preference
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const value: ThemeContextValue = {
        theme,
        effectiveTheme,
        setTheme
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
