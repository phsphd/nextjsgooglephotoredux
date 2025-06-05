// ./components/albums/album.tsx - Super safe version
import { FunctionComponent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleAlbum } from 'types/google';
import styles from './album.module.scss';

export interface AlbumProps {
  album: GoogleAlbum;
  layout?: 'grid' | 'list';
  viewMode?: 'grid' | 'list';
  showPhotoCount?: boolean;
  lazyLoad?: boolean;
  onAlbumClick?: (album: GoogleAlbum) => void;
  className?: string;
}

const Album: FunctionComponent<AlbumProps> = ({ 
  album, 
  layout, 
  viewMode, 
  showPhotoCount = true,
  lazyLoad = true,
  onAlbumClick,
  className = ''
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // COMPREHENSIVE SAFETY CHECKS
  console.log('Album component received:', { album, layout, viewMode });

  // Check 1: album exists
  if (!album) {
    console.error('Album component: album prop is null/undefined');
    return (
      <div className={styles.errorCard || 'error-card'}>
        <p>Album data missing</p>
      </div>
    );
  }

  // Check 2: album is an object
  if (typeof album !== 'object') {
    console.error('Album component: album prop is not an object:', typeof album);
    return (
      <div className={styles.errorCard || 'error-card'}>
        <p>Invalid album data type</p>
      </div>
    );
  }

  // Check 3: album has required properties
  if (!album.id) {
    console.error('Album component: album missing required id property:', album);
    return (
      <div className={styles.errorCard || 'error-card'}>
        <p>Album missing ID</p>
      </div>
    );
  }

  // Use viewMode if provided, otherwise use layout, default to 'grid'
  const currentLayout = viewMode || layout || 'grid';

  // Safe function to get cover photo URL
  const getCoverPhotoUrl = (baseUrl?: string | null | undefined) => {
    try {
      if (!baseUrl || typeof baseUrl !== 'string') {
        console.log('No valid cover photo URL for album:', album.id);
        return null;
      }
      
      // For picsum.photos URLs, don't append Google Photos API parameters
      if (baseUrl.includes('picsum.photos')) {
        return baseUrl; // Return as-is for mock images
      }
      
      // For Google Photos URLs, append the size parameters
      const size = currentLayout === 'list' ? 'w160-h120' : 'w400-h300';
      return `${baseUrl}=${size}-c`;
    } catch (error) {
      console.error('Error generating cover photo URL:', error);
      return null;
    }
  };

  const coverPhotoUrl = getCoverPhotoUrl(album.coverPhotoBaseUrl);
  const hasValidCover = coverPhotoUrl && !imageError;

  const handleClick = (e: React.MouseEvent) => {
    if (onAlbumClick) {
      e.preventDefault();
      onAlbumClick(album);
    }
  };

  // Safe title extraction
  const albumTitle = album.title || album.id || 'Untitled Album';

  // Safe photo count extraction
  const photoCount = album.mediaItemsCount || '0';
  const photoCountNum = parseInt(photoCount.toString()) || 0;

  const albumContent = (
    <article 
      className={`${styles.album || 'album'} ${styles[currentLayout] || ''} ${className}`} 
      onClick={handleClick}
    >
      <div className={styles.imageContainer || 'image-container'}>
        {hasValidCover ? (
          <>
            {imageLoading && (
              <div className={styles.imagePlaceholder || 'image-placeholder'}>
                <div className={styles.imageLoader || 'image-loader'}>
                  Loading...
                </div>
              </div>
            )}
            <Image
              src={coverPhotoUrl}
              alt={`Cover photo for ${albumTitle}`}
              fill
              sizes={currentLayout === 'list' ? '160px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
              className={styles.coverImage || 'cover-image'}
              priority={!lazyLoad}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                console.error('Image failed to load for album:', album.id);
                setImageError(true);
                setImageLoading(false);
              }}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              unoptimized={false}
            />
          </>
        ) : (
          <div className={styles.noCoverPhoto || 'no-cover-photo'}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <span>No Cover Photo</span>
          </div>
        )}
        
        {showPhotoCount && photoCount && (
          <div className={styles.photoCount || 'photo-count'}>
            {photoCount} photo{photoCountNum !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className={styles.albumInfo || 'album-info'}>
        <h3 className={styles.albumTitle || 'album-title'}>
          {albumTitle}
        </h3>
        
        <div className={styles.albumMeta || 'album-meta'}>
          {photoCount && (
            <span className={styles.metaItem || 'meta-item'}>
              {photoCount} item{photoCountNum !== 1 ? 's' : ''}
            </span>
          )}
          
          {album.productUrl && (
            <span className={styles.metaItem || 'meta-item'}>
              Google Photos
            </span>
          )}
        </div>
      </div>
    </article>
  );

  // If custom click handler, don't wrap with Link
  if (onAlbumClick) {
    return albumContent;
  }

  // Safe link rendering
  try {
    return (
      <Link href={`/album/${album.id}`} className={styles.albumLink || 'album-link'}>
        {albumContent}
      </Link>
    );
  } catch (error) {
    console.error('Error rendering album link:', error);
    return albumContent;
  }
};

export default Album;