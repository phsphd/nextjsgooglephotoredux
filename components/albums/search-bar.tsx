// ./components/albums/search-bar.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/store';
import styles from './search-bar.module.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  onClear,
  debounceMs = 300
}) => {
  const [localValue, setLocalValue] = useState(value);
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchInputWrapper}>
        <svg 
          className={styles.searchIcon} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.searchInput}
          aria-label="Search albums"
        />
        
        {localValue && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear search"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search suggestions could go here */}
      {localValue && (
        <div className={styles.searchHint}>
          Press <kbd>Esc</kbd> to clear
        </div>
      )}
    </div>
  );
};

export default SearchBar;