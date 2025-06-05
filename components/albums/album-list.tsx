// components/albums/album-list.tsx
import React, { FunctionComponent, useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/store';
import { GoogleAlbum } from 'types/google';
import { GalleryLayout, selectGalleryLayout, selectPerformanceSettings } from 'app/features/settingsSlice';
import Album from './album';
import AlbumSkeleton from './album-skeleton';
import EmptyState from './empty-state';
import SearchBar from './search-bar';

import styles from './album-list.module.scss';

export interface AlbumListProps {
  albums: GoogleAlbum[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchable?: boolean;
  sortable?: boolean;
  showCreateButton?: boolean;
  onCreateAlbum?: () => void;
  title?: string;
  subtitle?: string;
}

// Sorting options for albums
type SortOption = 'name' | 'date' | 'photos' | 'recent';

const AlbumList: FunctionComponent<AlbumListProps> = ({ 
  albums = [],
  loading = false,
  error = null,
  onRetry,
  searchable = true,
  sortable = true,
  showCreateButton = false,
  onCreateAlbum,
  title = "Wedding Albums",
  subtitle
}) => {
  // Settings from Redux
  const galleryLayout = useSelector(selectGalleryLayout);
  const performanceSettings = useSelector(selectPerformanceSettings);
  const accessibilitySettings = useSelector((state: RootState) => state.settings);

  // Local state for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Detect wedding-specific album categories
  const albumCategories = useMemo(() => {
    const categories = new Set(['all']);
    albums.forEach(album => {
      const title = album.title?.toLowerCase() || '';
      if (title.includes('ceremony')) categories.add('ceremony');
      if (title.includes('reception')) categories.add('reception');
      if (title.includes('portrait') || title.includes('couple')) categories.add('portraits');
      if (title.includes('guest') || title.includes('candid')) categories.add('guests');
      if (title.includes('preparation') || title.includes('getting ready')) categories.add('preparation');
    });
    return Array.from(categories);
  }, [albums]);

  // Filter and sort albums
  const filteredAndSortedAlbums = useMemo(() => {
    let filtered = albums;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(album => 
        album.title?.toLowerCase().includes(query) ||
        album.id.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(album => {
        const title = album.title?.toLowerCase() || '';
        return title.includes(selectedCategory);
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'photos':
          const aCount = parseInt(a.mediaItemsCount || '0');
          const bCount = parseInt(b.mediaItemsCount || '0');
          return bCount - aCount; // Descending
        case 'date':
          // If we had creation dates, we'd sort by those
          return (a.title || '').localeCompare(b.title || '');
        case 'recent':
        default:
          // Keep original order (assume most recent first from API)
          return 0;
      }
    });

    return sorted;
  }, [albums, searchQuery, sortBy, selectedCategory]);

  // Pagination for performance
  const itemsPerPage = performanceSettings.prefetchNextPage ? 20 : 12;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredAndSortedAlbums.length / itemsPerPage);
  
  const paginatedAlbums = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAlbums.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAlbums, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, selectedCategory]);

  // Determine grid layout based on settings and view mode
  const getGridClass = () => {
    if (viewMode === 'list') return styles.listLayout;
    
    switch (galleryLayout) {
      case GalleryLayout.Masonry:
        return styles.masonryLayout;
      case GalleryLayout.Grid:
        return styles.gridLayout;
      default:
        return styles.gridLayout;
    }
  };

  // Loading state
  if (loading && albums.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={getGridClass()}>
          {Array.from({ length: 6 }).map((_, index) => (
            <AlbumSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && albums.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorContent}>
            <h3>Unable to Load Albums</h3>
            <p>{error}</p>
            {onRetry && (
              <button onClick={onRetry} className={styles.retryButton}>
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && albums.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <EmptyState 
          title="No Albums Found"
          message="Your wedding albums will appear here once they're created."
          showCreateButton={showCreateButton}
          onCreateAlbum={onCreateAlbum}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.albumCount}>
            {filteredAndSortedAlbums.length} album{filteredAndSortedAlbums.length !== 1 ? 's' : ''}
            {searchQuery && ` (filtered)`}
          </div>
        </div>
        
        {showCreateButton && onCreateAlbum && (
          <button onClick={onCreateAlbum} className={styles.createButton}>
            + Create Album
          </button>
        )}
      </div>

      {/* Controls */}
      {(searchable || sortable) && (
        <div className={styles.controls}>
          {searchable && (
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search albums..."
              className={styles.searchBar}
            />
          )}
          
          {/* Category filter */}
          {albumCategories.length > 2 && (
            <div className={styles.filterGroup}>
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categoryFilter}
              >
                {albumCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Albums' : 
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sortable && (
            <div className={styles.filterGroup}>
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={styles.sortSelect}
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
                <option value="photos">Photo Count</option>
                <option value="date">Date Created</option>
              </select>
            </div>
          )}

          {/* View mode toggle */}
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      )}

      {/* Albums Grid/List */}
      <div className={`${styles.albumContainer} ${getGridClass()}`}>
        {paginatedAlbums.map((album: GoogleAlbum) => (
          <Album 
            key={album.id} 
            album={album} 
            viewMode={viewMode}
            showPhotoCount={true}
            lazyLoad={performanceSettings.enableLazyLoading}
          />
        ))}
        
        {/* Loading more albums */}
        {loading && albums.length > 0 && (
          <div className={styles.loadingMore}>
            <AlbumSkeleton />
            <AlbumSkeleton />
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          
          <div className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}

      {/* No results state */}
      {filteredAndSortedAlbums.length === 0 && !loading && albums.length > 0 && (
        <div className={styles.noResults}>
          <h3>No albums match your search</h3>
          <p>Try adjusting your search terms or filters.</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className={styles.clearFiltersButton}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AlbumList;