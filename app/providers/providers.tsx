// app/providers.tsx - React providers and hooks
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  importSettings, 
  loadSettingsFromStorage, 
  selectThemeClass, 
  selectCurrentTheme 
} from '../features/settingsSlice';

// Store initialization hook for React
export const useStoreInitialization = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize settings from localStorage
    const savedSettings = loadSettingsFromStorage();
    if (savedSettings) {
      dispatch(importSettings(savedSettings));
    }

    // Set up system theme detection
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => {
        // This will be handled by middleware
      };
      
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [dispatch]);
};

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeClass = useSelector(selectThemeClass);
  const currentTheme = useSelector(selectCurrentTheme);
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Apply theme classes to document
      document.documentElement.className = themeClass;
      document.documentElement.setAttribute('data-theme', currentTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#1e1e1e' : '#ffffff');
      }
    }
  }, [themeClass, currentTheme]);

  return <>{children}</>;
};

// Enhanced app wrapper component
interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  useStoreInitialization();
  
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};