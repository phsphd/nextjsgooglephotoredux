// app/features/settingsSlice.ts - Fixed TypeScript error
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from 'types/theme';

// Enhanced theme options
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system', // Follows system preference
  Auto = 'auto', // Dark at night, light during day
}

// Gallery layout options
export enum GalleryLayout {
  Masonry = 'masonry',
  Grid = 'grid',
  List = 'list',
  Carousel = 'carousel',
}

// Photo quality preferences
export enum PhotoQuality {
  Low = 'low',     // Fast loading, lower quality
  Medium = 'medium', // Balanced
  High = 'high',   // Best quality, slower loading
  Auto = 'auto',   // Based on connection speed
}

// Slideshow transition effects
export enum SlideshowTransition {
  Fade = 'fade',
  Slide = 'slide',
  Zoom = 'zoom',
  None = 'none',
}

// Privacy settings for sharing
export enum PrivacyLevel {
  Private = 'private',     // Only owner can view
  Family = 'family',       // Family members only
  Friends = 'friends',     // Friends and family
  Public = 'public',       // Anyone with link
}

export interface SettingsState {
  // Theme settings
  themeMode: ThemeMode;
  currentTheme: Theme; // Computed theme based on mode
  systemTheme: Theme;  // Detected system theme
  
  // Gallery preferences
  galleryLayout: GalleryLayout;
  photosPerPage: number;
  showPhotoDetails: boolean;
  enableInfiniteScroll: boolean;
  photoQuality: PhotoQuality;
  
  // Slideshow settings
  slideshowAutoPlay: boolean;
  slideshowInterval: number; // in seconds
  slideshowTransition: SlideshowTransition;
  slideshowLoop: boolean;
  
  // Privacy & sharing
  defaultPrivacyLevel: PrivacyLevel;
  allowDownloads: boolean;
  showMetadata: boolean;
  watermarkPhotos: boolean;
  
  // Performance settings
  enableLazyLoading: boolean;
  prefetchNextPage: boolean;
  maxCacheSize: number; // in MB
  enableOfflineMode: boolean;
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Notifications
  enableNotifications: boolean;
  notifyOnNewPhotos: boolean;
  notifyOnSharedAlbums: boolean;
  
  // Advanced
  enableAnalytics: boolean;
  autoBackup: boolean;
  compressionLevel: number; // 1-10
  
  // UI preferences
  sidebarCollapsed: boolean;
  showWelcomeMessage: boolean;
  lastVisitedAlbum: string | null;
  
  // Persistence metadata
  settingsVersion: number;
  lastUpdated: number;
}

const initialState: SettingsState = {
  // Theme settings
  themeMode: ThemeMode.System,
  currentTheme: Theme.Dark,
  systemTheme: Theme.Dark,
  
  // Gallery preferences
  galleryLayout: GalleryLayout.Masonry,
  photosPerPage: 50,
  showPhotoDetails: true,
  enableInfiniteScroll: true,
  photoQuality: PhotoQuality.Auto,
  
  // Slideshow settings
  slideshowAutoPlay: true,
  slideshowInterval: 5,
  slideshowTransition: SlideshowTransition.Fade,
  slideshowLoop: true,
  
  // Privacy & sharing
  defaultPrivacyLevel: PrivacyLevel.Private,
  allowDownloads: true,
  showMetadata: false,
  watermarkPhotos: false,
  
  // Performance settings
  enableLazyLoading: true,
  prefetchNextPage: true,
  maxCacheSize: 100,
  enableOfflineMode: false,
  
  // Accessibility
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  
  // Notifications
  enableNotifications: true,
  notifyOnNewPhotos: true,
  notifyOnSharedAlbums: true,
  
  // Advanced
  enableAnalytics: true,
  autoBackup: false,
  compressionLevel: 7,
  
  // UI preferences
  sidebarCollapsed: false,
  showWelcomeMessage: true,
  lastVisitedAlbum: null,
  
  // Persistence metadata
  settingsVersion: 1,
  lastUpdated: Date.now(),
};

// Helper functions for theme detection
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return Theme.Dark;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light;
};

const getAutoTheme = (): Theme => {
  const hour = new Date().getHours();
  return (hour >= 19 || hour <= 6) ? Theme.Dark : Theme.Light;
};

const computeCurrentTheme = (mode: ThemeMode, systemTheme: Theme): Theme => {
  switch (mode) {
    case ThemeMode.Light:
      return Theme.Light;
    case ThemeMode.Dark:
      return Theme.Dark;
    case ThemeMode.System:
      return systemTheme;
    case ThemeMode.Auto:
      return getAutoTheme();
    default:
      return Theme.Dark;
  }
};

// Enhanced settings slice
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Theme actions
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      state.currentTheme = computeCurrentTheme(action.payload, state.systemTheme);
      state.lastUpdated = Date.now();
    },
    
    setSystemTheme: (state, action: PayloadAction<Theme>) => {
      state.systemTheme = action.payload;
      if (state.themeMode === ThemeMode.System) {
        state.currentTheme = action.payload;
      }
    },
    
    updateAutoTheme: (state) => {
      if (state.themeMode === ThemeMode.Auto) {
        state.currentTheme = getAutoTheme();
      }
    },
    
    // Gallery preferences
    setGalleryLayout: (state, action: PayloadAction<GalleryLayout>) => {
      state.galleryLayout = action.payload;
      state.lastUpdated = Date.now();
    },
    
    setPhotosPerPage: (state, action: PayloadAction<number>) => {
      state.photosPerPage = Math.max(10, Math.min(200, action.payload)); // Validate range
      state.lastUpdated = Date.now();
    },
    
    setPhotoQuality: (state, action: PayloadAction<PhotoQuality>) => {
      state.photoQuality = action.payload;
      state.lastUpdated = Date.now();
    },
    
    togglePhotoDetails: (state) => {
      state.showPhotoDetails = !state.showPhotoDetails;
      state.lastUpdated = Date.now();
    },
    
    toggleInfiniteScroll: (state) => {
      state.enableInfiniteScroll = !state.enableInfiniteScroll;
      state.lastUpdated = Date.now();
    },
    
    // Slideshow settings
    setSlideshowSettings: (state, action: PayloadAction<{
      autoPlay?: boolean;
      interval?: number;
      transition?: SlideshowTransition;
      loop?: boolean;
    }>) => {
      const { autoPlay, interval, transition, loop } = action.payload;
      if (autoPlay !== undefined) state.slideshowAutoPlay = autoPlay;
      if (interval !== undefined) state.slideshowInterval = Math.max(1, Math.min(60, interval));
      if (transition !== undefined) state.slideshowTransition = transition;
      if (loop !== undefined) state.slideshowLoop = loop;
      state.lastUpdated = Date.now();
    },
    
    // Privacy settings
    setPrivacySettings: (state, action: PayloadAction<{
      defaultPrivacyLevel?: PrivacyLevel;
      allowDownloads?: boolean;
      showMetadata?: boolean;
      watermarkPhotos?: boolean;
    }>) => {
      const { defaultPrivacyLevel, allowDownloads, showMetadata, watermarkPhotos } = action.payload;
      if (defaultPrivacyLevel !== undefined) state.defaultPrivacyLevel = defaultPrivacyLevel;
      if (allowDownloads !== undefined) state.allowDownloads = allowDownloads;
      if (showMetadata !== undefined) state.showMetadata = showMetadata;
      if (watermarkPhotos !== undefined) state.watermarkPhotos = watermarkPhotos;
      state.lastUpdated = Date.now();
    },
    
    // Performance settings
    setPerformanceSettings: (state, action: PayloadAction<{
      enableLazyLoading?: boolean;
      prefetchNextPage?: boolean;
      maxCacheSize?: number;
      enableOfflineMode?: boolean;
    }>) => {
      const { enableLazyLoading, prefetchNextPage, maxCacheSize, enableOfflineMode } = action.payload;
      if (enableLazyLoading !== undefined) state.enableLazyLoading = enableLazyLoading;
      if (prefetchNextPage !== undefined) state.prefetchNextPage = prefetchNextPage;
      if (maxCacheSize !== undefined) state.maxCacheSize = Math.max(10, Math.min(1000, maxCacheSize));
      if (enableOfflineMode !== undefined) state.enableOfflineMode = enableOfflineMode;
      state.lastUpdated = Date.now();
    },
    
    // Accessibility settings
    setAccessibilitySettings: (state, action: PayloadAction<{
      reducedMotion?: boolean;
      highContrast?: boolean;
      fontSize?: 'small' | 'medium' | 'large';
    }>) => {
      const { reducedMotion, highContrast, fontSize } = action.payload;
      if (reducedMotion !== undefined) state.reducedMotion = reducedMotion;
      if (highContrast !== undefined) state.highContrast = highContrast;
      if (fontSize !== undefined) state.fontSize = fontSize;
      state.lastUpdated = Date.now();
    },
    
    // Notification settings
    setNotificationSettings: (state, action: PayloadAction<{
      enableNotifications?: boolean;
      notifyOnNewPhotos?: boolean;
      notifyOnSharedAlbums?: boolean;
    }>) => {
      const { enableNotifications, notifyOnNewPhotos, notifyOnSharedAlbums } = action.payload;
      if (enableNotifications !== undefined) state.enableNotifications = enableNotifications;
      if (notifyOnNewPhotos !== undefined) state.notifyOnNewPhotos = notifyOnNewPhotos;
      if (notifyOnSharedAlbums !== undefined) state.notifyOnSharedAlbums = notifyOnSharedAlbums;
      state.lastUpdated = Date.now();
    },
    
    // UI preferences
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    dismissWelcomeMessage: (state) => {
      state.showWelcomeMessage = false;
      state.lastUpdated = Date.now();
    },
    
    setLastVisitedAlbum: (state, action: PayloadAction<string | null>) => {
      state.lastVisitedAlbum = action.payload;
    },
    
    // Bulk operations
    importSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      const importedSettings = action.payload;
      
      // Validate and merge settings
      Object.keys(importedSettings).forEach(key => {
        const settingKey = key as keyof SettingsState;
        if (settingKey in state && importedSettings[settingKey] !== undefined) {
          (state as any)[settingKey] = importedSettings[settingKey];
        }
      });
      
      state.settingsVersion = 1;
      state.lastUpdated = Date.now();
    },
    
    resetSettings: (state) => {
      // Reset to defaults but keep some user preferences
      const keepSettings = {
        lastVisitedAlbum: state.lastVisitedAlbum,
        showWelcomeMessage: false, // Don't show welcome again
      };
      
      Object.assign(state, initialState, keepSettings);
      state.lastUpdated = Date.now();
    },
    
    // Advanced settings
    setCompressionLevel: (state, action: PayloadAction<number>) => {
      state.compressionLevel = Math.max(1, Math.min(10, action.payload));
      state.lastUpdated = Date.now();
    },
    
    toggleAnalytics: (state) => {
      state.enableAnalytics = !state.enableAnalytics;
      state.lastUpdated = Date.now();
    },
    
    toggleAutoBackup: (state) => {
      state.autoBackup = !state.autoBackup;
      state.lastUpdated = Date.now();
    },
  },
});

// Export actions
export const {
  setThemeMode,
  setSystemTheme,
  updateAutoTheme,
  setGalleryLayout,
  setPhotosPerPage,
  setPhotoQuality,
  togglePhotoDetails,
  toggleInfiniteScroll,
  setSlideshowSettings,
  setPrivacySettings,
  setPerformanceSettings,
  setAccessibilitySettings,
  setNotificationSettings,
  toggleSidebar,
  dismissWelcomeMessage,
  setLastVisitedAlbum,
  importSettings,
  resetSettings,
  setCompressionLevel,
  toggleAnalytics,
  toggleAutoBackup,
} = settingsSlice.actions;

// Selectors
export const selectCurrentTheme = (state: { settings: SettingsState }) => state.settings.currentTheme;
export const selectThemeMode = (state: { settings: SettingsState }) => state.settings.themeMode;
export const selectGalleryLayout = (state: { settings: SettingsState }) => state.settings.galleryLayout;
export const selectPhotoQuality = (state: { settings: SettingsState }) => state.settings.photoQuality;
export const selectSlideshowSettings = (state: { settings: SettingsState }) => ({
  autoPlay: state.settings.slideshowAutoPlay,
  interval: state.settings.slideshowInterval,
  transition: state.settings.slideshowTransition,
  loop: state.settings.slideshowLoop,
});
export const selectPrivacySettings = (state: { settings: SettingsState }) => ({
  defaultPrivacyLevel: state.settings.defaultPrivacyLevel,
  allowDownloads: state.settings.allowDownloads,
  showMetadata: state.settings.showMetadata,
  watermarkPhotos: state.settings.watermarkPhotos,
});
export const selectPerformanceSettings = (state: { settings: SettingsState }) => ({
  enableLazyLoading: state.settings.enableLazyLoading,
  prefetchNextPage: state.settings.prefetchNextPage,
  maxCacheSize: state.settings.maxCacheSize,
  enableOfflineMode: state.settings.enableOfflineMode,
});
export const selectAccessibilitySettings = (state: { settings: SettingsState }) => ({
  reducedMotion: state.settings.reducedMotion,
  highContrast: state.settings.highContrast,
  fontSize: state.settings.fontSize,
});

// Theme helper selectors
export const selectIsDarkMode = (state: { settings: SettingsState }) => 
  state.settings.currentTheme === Theme.Dark;

// FIXED: Explicitly type the classes array as string[]
export const selectThemeClass = (state: { settings: SettingsState }) => {
  const { currentTheme, highContrast, fontSize } = state.settings;
  const classes: string[] = [currentTheme]; // Fixed: explicit string[] type
  if (highContrast) classes.push('high-contrast');
  classes.push(`font-${fontSize}`);
  return classes.join(' ');
};

export default settingsSlice.reducer;

// Utility functions for external use
export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return Theme.Dark;
  
  // Check localStorage first
  const saved = localStorage.getItem('theme');
  if (saved && Object.values(Theme).includes(saved as Theme)) {
    return saved as Theme;
  }
  
  // Fall back to system preference
  return getSystemTheme();
};

export const saveSettingsToStorage = (settings: SettingsState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('gallery-settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

export const loadSettingsFromStorage = (): Partial<SettingsState> | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('gallery-settings');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
    return null;
  }
};