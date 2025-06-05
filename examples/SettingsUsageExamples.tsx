// examples/SettingsUsageExamples.tsx
// Examples of how to use the enhanced settings throughout your wedding gallery app

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/store';
import { 
  selectCurrentTheme, 
  selectGalleryLayout, 
  selectPhotoQuality,
  selectPerformanceSettings,
  selectAccessibilitySettings,
  GalleryLayout,
  PhotoQuality 
} from 'app/features/settingsSlice';

// 1. Theme-aware component
export const ThemedButton: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ 
  children, 
  onClick 
}) => {
  const currentTheme = useSelector(selectCurrentTheme);
  
  const buttonStyles = {
    backgroundColor: currentTheme === 'dark' ? '#333' : '#fff',
    color: currentTheme === 'dark' ? '#fff' : '#333',
    border: `1px solid ${currentTheme === 'dark' ? '#555' : '#ddd'}`,
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
  };
  
  return (
    <button style={buttonStyles} onClick={onClick}>
      {children}
    </button>
  );
};

// 2. Gallery layout component that adapts to settings
export const AdaptiveGallery: React.FC<{ photos: any[] }> = ({ photos }) => {
  const galleryLayout = useSelector(selectGalleryLayout);
  const photoQuality = useSelector(selectPhotoQuality);
  const performanceSettings = useSelector(selectPerformanceSettings);
  
  // Determine image URL based on quality setting
  const getImageUrl = (photo: any, size: 'thumbnail' | 'full' = 'thumbnail') => {
    if (!photo.baseUrl) return '';
    
    let quality = '';
    switch (photoQuality) {
      case PhotoQuality.Low:
        quality = size === 'thumbnail' ? '=w300-h200-c' : '=w800-h600';
        break;
      case PhotoQuality.Medium:
        quality = size === 'thumbnail' ? '=w500-h350-c' : '=w1200-h800';
        break;
      case PhotoQuality.High:
        quality = size === 'thumbnail' ? '=w720-h480-c' : '=w1920-h1080';
        break;
      default: // Auto
        // Detect connection speed and choose accordingly
        quality = size === 'thumbnail' ? '=w400-h300-c' : '=w1000-h700';
    }
    
    return `${photo.baseUrl}${quality}`;
  };
  
  // Render based on layout preference
  const renderGallery = () => {
    switch (galleryLayout) {
      case GalleryLayout.Masonry:
        return (
          <div className="masonry-grid">
            {photos.map((photo, index) => (
              <div key={photo.id} className="masonry-item">
                <img 
                  src={getImageUrl(photo)}
                  alt={photo.filename}
                  loading={performanceSettings.enableLazyLoading ? "lazy" : "eager"}
                />
              </div>
            ))}
          </div>
        );
        
      case GalleryLayout.Grid:
        return (
          <div className="grid-layout">
            {photos.map((photo, index) => (
              <div key={photo.id} className="grid-item">
                <img 
                  src={getImageUrl(photo)}
                  alt={photo.filename}
                  loading={performanceSettings.enableLazyLoading ? "lazy" : "eager"}
                />
              </div>
            ))}
          </div>
        );
        
      case GalleryLayout.List:
        return (
          <div className="list-layout">
            {photos.map((photo, index) => (
              <div key={photo.id} className="list-item">
                <img src={getImageUrl(photo, 'thumbnail')} alt={photo.filename} />
                <div className="photo-info">
                  <h3>{photo.filename}</h3>
                  <p>{new Date(photo.mediaMetadata?.creationTime).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return <div>Unsupported layout</div>;
    }
  };
  
  return <div className="adaptive-gallery">{renderGallery()}</div>;
};

// 3. Accessibility-aware slideshow component
export const AccessibleSlideshow: React.FC<{ photos: any[] }> = ({ photos }) => {
  const settings = useSelector((state: RootState) => state.settings);
  const accessibilitySettings = useSelector(selectAccessibilitySettings);
  
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(settings.slideshowAutoPlay);
  
  // Auto-advance slideshow (respecting user preferences)
  React.useEffect(() => {
    if (!isPlaying || accessibilitySettings.reducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => 
        settings.slideshowLoop 
          ? (prev + 1) % photos.length 
          : Math.min(prev + 1, photos.length - 1)
      );
    }, settings.slideshowInterval * 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, settings.slideshowInterval, settings.slideshowLoop, photos.length, accessibilitySettings.reducedMotion]);
  
  const slideStyles = {
    transition: accessibilitySettings.reducedMotion 
      ? 'none' 
      : `opacity ${settings.slideshowTransition === 'fade' ? '0.5s' : '0s'} ease-in-out`,
    opacity: 1,
  };
  
  return (
    <div className="accessible-slideshow">
      <div className="slide-container" style={slideStyles}>
        <img 
          src={photos[currentIndex]?.baseUrl + '=w1200-h800'}
          alt={photos[currentIndex]?.filename || 'Wedding photo'}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      {/* Controls with accessibility support */}
      <div className="slideshow-controls">
        <button 
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous photo"
        >
          ← Previous
        </button>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        <button 
          onClick={() => setCurrentIndex(Math.min(photos.length - 1, currentIndex + 1))}
          disabled={currentIndex === photos.length - 1}
          aria-label="Next photo"
        >
          Next →
        </button>
      </div>
      
      {/* Screen reader friendly photo counter */}
      <div className="sr-only" aria-live="polite">
        Photo {currentIndex + 1} of {photos.length}
      </div>
    </div>
  );
};

// 4. Performance-optimized photo component
export const OptimizedPhoto: React.FC<{ photo: any; onLoad?: () => void }> = ({ 
  photo, 
  onLoad 
}) => {
  const performanceSettings = useSelector(selectPerformanceSettings);
  const photoQuality = useSelector(selectPhotoQuality);
  
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  
  // Determine optimal image size based on viewport and quality settings
  const getOptimalImageUrl = () => {
    if (!photo.baseUrl) return '';
    
    const viewport = {
      width: typeof window !== 'undefined' ? window.innerWidth : 1200,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
    };
    
    // Auto quality based on connection and viewport
    if (photoQuality === PhotoQuality.Auto) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return `${photo.baseUrl}=w400-h300-c`;
      } else if (effectiveType === '3g') {
        return `${photo.baseUrl}=w800-h600-c`;
      } else {
        return `${photo.baseUrl}=w${Math.min(1200, viewport.width)}-h${Math.min(800, viewport.height)}-c`;
      }
    }
    
    // Manual quality settings
    const qualityMap = {
      [PhotoQuality.Low]: '=w400-h300-c',
      [PhotoQuality.Medium]: '=w800-h600-c',
      [PhotoQuality.High]: '=w1200-h900-c',
    };
    
    return `${photo.baseUrl}${qualityMap[photoQuality]}`;
  };
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setHasError(true);
  };
  
  return (
    <div className="optimized-photo">
      {!isLoaded && !hasError && (
        <div className="photo-placeholder">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
      
      {hasError ? (
        <div className="photo-error">
          Failed to load image
        </div>
      ) : (
        <img
          src={getOptimalImageUrl()}
          alt={photo.filename || 'Wedding photo'}
          loading={performanceSettings.enableLazyLoading ? "lazy" : "eager"}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
};

// 5. Settings-aware layout wrapper
export const SettingsAwareLayout: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const settings = useSelector((state: RootState) => state.settings);
  
  // Apply settings as CSS variables and classes
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply font size
      root.style.setProperty('--base-font-size', 
        settings.fontSize === 'small' ? '14px' : 
        settings.fontSize === 'large' ? '18px' : '16px'
      );
      
      // Apply accessibility settings
      root.classList.toggle('reduced-motion', settings.reducedMotion);
      root.classList.toggle('high-contrast', settings.highContrast);
      
      // Apply theme
      root.setAttribute('data-theme', settings.currentTheme);
    }
  }, [settings]);
  
  return (
    <div className={`app-layout ${settings.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {children}
    </div>
  );
};

// 6. Usage in your main app component
export const WeddingGalleryApp: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [photos, setPhotos] = React.useState([]);
  
  return (
    <SettingsAwareLayout>
      <header>
        <h1>Alex & Annie's Wedding</h1>
        <ThemedButton onClick={() => setIsSettingsOpen(true)}>
          ⚙️ Settings
        </ThemedButton>
      </header>
      
      <main>
        <AdaptiveGallery photos={photos} />
      </main>
      
      {/* Settings panel would be imported and used here */}
      {/* <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} /> */}
    </SettingsAwareLayout>
  );
};