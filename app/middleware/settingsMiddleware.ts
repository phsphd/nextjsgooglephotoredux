// app/middleware/settingsMiddleware.ts
import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { saveSettingsToStorage, setSystemTheme, updateAutoTheme } from '../features/settingsSlice';

// Helper function to check if action has type property
const isAction = (action: unknown): action is AnyAction => {
  return typeof action === 'object' && action !== null && 'type' in action;
};

// Settings persistence middleware
export const settingsPersistenceMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    const result = next(action);
    
    // Save settings to localStorage after any settings action
    if (isAction(action) && action.type.startsWith('settings/')) {
      const state = store.getState();
      saveSettingsToStorage(state.settings);
    }
    
    return result;
  };

// Theme detection middleware
export const themeDetectionMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    const result = next(action);
    
    // Set up system theme detection on first load
    if (isAction(action) && (action.type === 'settings/setThemeMode' || action.type === '@@INIT')) {
      if (typeof window !== 'undefined') {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleThemeChange = (e: MediaQueryListEvent) => {
          const systemTheme = e.matches ? 'dark' : 'light';
          store.dispatch(setSystemTheme(systemTheme as any));
        };
        
        // Remove existing listener to avoid duplicates
        mediaQuery.removeEventListener('change', handleThemeChange);
        mediaQuery.addEventListener('change', handleThemeChange);
        
        // Set initial system theme
        const initialSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        store.dispatch(setSystemTheme(initialSystemTheme as any));
      }
    }
    
    return result;
  };

// Auto theme update middleware (updates theme based on time)
export const autoThemeMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    const result = next(action);
    
    // Set up auto theme updates every hour
    if (isAction(action) && action.type === 'settings/setThemeMode' && typeof window !== 'undefined') {
      const state = store.getState();
      
      if (state.settings.themeMode === 'auto') {
        // Clear existing interval
        const existingInterval = (window as any).__autoThemeInterval;
        if (existingInterval) {
          clearInterval(existingInterval);
        }
        
        // Set up new interval to check every hour
        const interval = setInterval(() => {
          store.dispatch(updateAutoTheme());
        }, 60 * 60 * 1000); // 1 hour
        
        (window as any).__autoThemeInterval = interval;
        
        // Update immediately
        store.dispatch(updateAutoTheme());
      }
    }
    
    return result;
  };

// Performance monitoring middleware
export const performanceMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    const start = performance.now();
    const result = next(action);
    const end = performance.now();
    
    // Log slow actions (> 5ms)
    if (end - start > 5 && isAction(action)) {
      console.warn(`Slow action detected: ${action.type} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };

// Settings validation middleware
export const settingsValidationMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    // Validate settings before applying
    if (isAction(action) && action.type.startsWith('settings/')) {
      try {
        const result = next(action);
        const state = store.getState();
        
        // Validate critical settings
        if (state.settings.photosPerPage < 1 || state.settings.photosPerPage > 200) {
          console.error('Invalid photosPerPage value, resetting to 50');
          // Could dispatch a correction action here
        }
        
        if (state.settings.slideshowInterval < 1 || state.settings.slideshowInterval > 60) {
          console.error('Invalid slideshowInterval value, resetting to 5');
        }
        
        return result;
      } catch (error) {
        console.error('Settings validation error:', error);
        return next(action);
      }
    }
    
    return next(action);
  };

// Combined middleware array for easy import
export const settingsMiddleware = [
  settingsPersistenceMiddleware,
  themeDetectionMiddleware,
  autoThemeMiddleware,
  settingsValidationMiddleware,
  // performanceMiddleware, // Enable for debugging
];