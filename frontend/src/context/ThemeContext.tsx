import React, { createContext, useContext, useEffect } from 'react';

export type Theme = 'dark';
export type EffectiveTheme = 'dark';

interface ThemeContextValue {
    theme: Theme;
    effectiveTheme: EffectiveTheme;
    setTheme: (theme: Theme) => void; // Keep for compatibility, but does nothing
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Always use dark theme
    const theme: Theme = 'dark';
    const effectiveTheme: EffectiveTheme = 'dark';

    // Apply dark theme class to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add('theme-dark');
    }, []);

    // No-op function for compatibility
    const setTheme = () => {
        // Theme switching disabled - always dark mode
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
