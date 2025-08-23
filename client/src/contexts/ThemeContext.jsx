import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage or prefers dark mode
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }

      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    return 'light'; // Default theme
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Function to actually apply the theme to the DOM
  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    
    // Remove the previous theme class
    const oldTheme = newTheme === 'dark' ? 'light' : 'dark';
    root.classList.remove(oldTheme);
    
    // Add the new theme class
    root.classList.add(newTheme);
    
    // Update the HTML data-theme attribute for components that use it
    root.setAttribute('data-theme', newTheme);
    
    // Store the theme preference in localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Apply theme when component mounts and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 