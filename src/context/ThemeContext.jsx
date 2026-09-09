import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'default', label: 'Default', icon: 'fa-moon', desc: 'Pure Black' },
  { id: 'dark', label: 'Dark', icon: 'fa-circle-half-stroke', desc: 'Slate Navy' },
  { id: 'white', label: 'White', icon: 'fa-sun', desc: 'Clean White' }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('de_edu_theme') || 'default';
    } catch {
      return 'default';
    }
  });

  const setTheme = (newTheme) => {
    if (!['default', 'dark', 'white'].includes(newTheme)) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem('de_edu_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'default',
      setTheme: () => {},
      themes: THEMES
    };
  }
  return context;
};

export default ThemeProvider;
