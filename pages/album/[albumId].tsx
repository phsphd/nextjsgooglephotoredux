// pages/album/[albumId].tsx - Updated selectors
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchGoogleAlbumMediaItems, fetchGoogleAlbum } from 'app/features/photoLibrarySlice';
import { AppDispatch, RootState } from 'app/store';
import Layout from 'components/common/layout';
import Loader from 'components/common/loader';
import MediaItemList from 'components/media-items/media-items-list';
import { GoogleAlbum, GoogleMediaItem } from 'types/google';

import styles from 'styles/Index.module.scss';

// Enhanced props type
type AlbumPageProps = {
  albumId: string;
  initialAlbum?: GoogleAlbum;
  initialPhotos?: GoogleMediaItem[];
  error?: string;
};

const AlbumPage: NextPage<AlbumPageProps> = ({
  albumId,
  initialAlbum,
  initialPhotos,
  error: serverError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  
  // Redux state - Updated to use correct property names
  const { 
    loading, 
    albumPhotos, 
    albumsById, // Changed from 'albums' to 'albumsById'
    error: reduxError 
  } = useSelector((state: RootState) => state.photoLibrary);
  
  // Local state for enhanced UX
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Get current album and photos from Redux or initial props
  const currentAlbum = albumsById[albumId] || initialAlbum; // Updated selector
  const currentPhotos = albumPhotos[albumId] || initialPhotos || [];
  const hasPhotos = currentPhotos.length > 0;
  const isLoading = loading && !hasPhotos;
  const hasError = serverError || reduxError;

  // Fetch data effect
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch album info if we don't have it
        if (!currentAlbum) {
          dispatch(fetchGoogleAlbum(albumId));
        }

        // Fetch photos if we don't have them or if we want fresh data
        if (!albumPhotos[albumId] || isRefreshing) {
          dispatch(fetchGoogleAlbumMediaItems(albumId));
        }
      } catch (error) {
        console.error('Error fetching album data:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Only fetch if we don't have data or if user is refreshing
    if (!hasPhotos || isRefreshing) {
      fetchData();
    }
  }, [dispatch, albumId, albumPhotos, currentAlbum, hasPhotos, isRefreshing]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRetryCount(prev => prev + 1);
  };

  // Handle retry on error
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleRefresh();
  };

  // Handle back navigation
  const handleGoBack = () => {
    router.back();
  };

  // Dynamic page title and meta
  const pageTitle = currentAlbum?.title 
    ? `${currentAlbum.title} | Wedding Photos`
    : 'Album Photos | Wedding Photos';
    
  const pageDescription = currentAlbum?.title
    ? `View ${currentAlbum.mediaItemsCount || 'photos'} photos from ${currentAlbum.title}`
    : 'Wedding photo album';

  // Error boundary component
  const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <div className={styles.errorActions}>
          <button onClick={onRetry} className={styles.retryButton}>
            Try Again
          </button>
          <button onClick={handleGoBack} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyContent}>
        <h2>No Photos Found</h2>
        <p>This album appears to be empty or the photos are still loading.</p>
        <button onClick={handleRefresh} className={styles.refreshButton}>
          Refresh Album
        </button>
      </div>
    </div>
  );

  // Album header component
  const AlbumHeader = () => (
    currentAlbum && (
      <div className={styles.albumHeader}>
        <button onClick={handleGoBack} className={styles.backButton}>
          ← Back to Albums
        </button>
        <div className={styles.albumInfo}>
          <h1>{currentAlbum.title || 'Untitled Album'}</h1>
          {currentAlbum.mediaItemsCount && (
            <p className={styles.photoCount}>
              {currentAlbum.mediaItemsCount} photos
            </p>
          )}
        </div>
        <button 
          onClick={handleRefresh} 
          className={styles.refreshButton}
          disabled={isRefreshing}
        >
          {isRefreshing ? '↻' : '⟳'} Refresh
        </button>
      </div>
    )
  );

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {currentAlbum?.coverPhotoBaseUrl && (
          <meta property="og:image" content={`${currentAlbum.coverPhotoBaseUrl}=w1200-h630-c`} />
        )}
        <meta name="robots" content="noindex, nofollow" /> {/* Private photos */}
      </Head>

      {/* Loading State */}
      {isLoading && <Loader />}

      {/* Error State */}
      {hasError && !isLoading && (
        <ErrorDisplay error={hasError} onRetry={handleRetry} />
      )}

      {/* Content */}
      {!isLoading && !hasError && (
        <section className={styles.container}>
          <AlbumHeader />
          
          {hasPhotos ? (
            <>
              <MediaItemList 
                mediaItems={currentPhotos}
              />
              
              {/* Loading indicator for refresh */}
              {isRefreshing && (
                <div className={styles.refreshIndicator}>
                  <p>Refreshing photos...</p>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </section>
      )}
    </Layout>
  );
};

export default AlbumPage;

export const getServerSideProps: GetServerSideProps<AlbumPageProps> = async (
  context: GetServerSidePropsContext
) => {
  const albumId = context.params?.albumId as string;

  if (!albumId || typeof albumId !== 'string') {
    return {
      notFound: true,
    };
  }

  try {
    return {
      props: {
        albumId,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    return {
      props: {
        albumId,
        error: 'Failed to load album data',
      },
    };
  }
};