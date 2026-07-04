import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeContextProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('recruitai_theme');
    return stored === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('recruitai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('recruitai_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeContextProvider');
  return ctx;
};

export default ThemeContext;
