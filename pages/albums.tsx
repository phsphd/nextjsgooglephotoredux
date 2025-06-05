// ./pages/albums.tsx - Debug version with full API testing
import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { GoogleAlbum } from 'types/google';
import { AppDispatch, RootState } from 'app/store';
import {
  setFilter,
  fetchAllGoogleAlbums,
} from 'app/features/photoLibrarySlice';
import styles from 'styles/Albums.module.scss';
import AlbumList from 'components/albums/album-list';
import ElementCounter from 'components/common/element-counter';
import Filter from 'components/common/filter';
import Layout from 'components/common/layout';
import Loader from 'components/common/loader';

const AlbumsPage: NextPage = () => {
  const loading = useSelector((state: RootState) => state.photoLibrary.loading);
  const albums = useSelector((state: RootState) => state.photoLibrary.albums);
  const filter = useSelector((state: RootState) => state.photoLibrary.filter);
  const error = useSelector((state: RootState) => state.photoLibrary.error);
  const albumsError = useSelector((state: RootState) => state.photoLibrary.albumsError);
  
  // Get the entire Redux state for debugging
  const fullState = useSelector((state: RootState) => state);
  
  const dispatch: AppDispatch = useDispatch();
  const [filteredAlbums, setFilteredAlbums] = useState<GoogleAlbum[]>([]);
  const [apiTestResults, setApiTestResults] = useState<any>({});

  // Enhanced debugging
  console.log('=== FULL REDUX DEBUG ===');
  console.log('Full Redux State:', fullState);
  console.log('PhotoLibrary State:', fullState.photoLibrary);
  console.log('Loading:', loading);
  console.log('Albums:', albums);
  console.log('Error:', error);
  console.log('Albums Error:', albumsError);
  console.log('========================');

  const setTitleFilter = (titleFilter: string) => {
    dispatch(setFilter(titleFilter));
  };

  // Test API endpoints directly
  useEffect(() => {
    const testAPIs = async () => {
      console.log('=== TESTING API ENDPOINTS ===');
      const results: any = {};
      
      try {
        // Test albums API
        console.log('Testing /api/albums...');
        const albumsResponse = await fetch('/api/albums');
        console.log('Albums API Response Status:', albumsResponse.status);
        console.log('Albums API Response Headers:', Object.fromEntries(albumsResponse.headers.entries()));
        
        results.albumsAPI = {
          status: albumsResponse.status,
          ok: albumsResponse.ok,
          headers: Object.fromEntries(albumsResponse.headers.entries())
        };
        
        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          console.log('Albums API Data:', albumsData);
          console.log('Albums API Data Type:', typeof albumsData);
          console.log('Albums API Data Length:', albumsData?.length);
          results.albumsAPI.data = albumsData;
          results.albumsAPI.dataType = typeof albumsData;
          results.albumsAPI.dataLength = albumsData?.length;
        } else {
          const errorText = await albumsResponse.text();
          console.error('Albums API Error:', errorText);
          results.albumsAPI.error = errorText;
        }
      } catch (error) {
        console.error('Albums API Request Failed:', error);
        results.albumsAPI.error = error instanceof Error ? error.message : String(error);
      }

      // Test if Google API utilities exist
      try {
        console.log('Testing Google API utilities...');
        const { getGoogleApiToken, getGoogleAlbums } = await import('utils/GoogleApi');
        console.log('Google API utilities imported successfully');
        results.googleAPI = { imported: true };
        
        // Test token function
        try {
          const token = await getGoogleApiToken();
          console.log('Token retrieved:', token ? 'Success' : 'No token');
          results.googleAPI.tokenTest = token ? 'Success' : 'No token';
        } catch (tokenError) {
          console.error('Token retrieval failed:', tokenError);
          results.googleAPI.tokenError = tokenError instanceof Error ? tokenError.message : String(tokenError);
        }
      } catch (importError) {
        console.error('Failed to import Google API utilities:', importError);
        results.googleAPI = { error: importError instanceof Error ? importError.message : String(importError) };
      }
      
      console.log('=== END API TEST ===');
      setApiTestResults(results);
    };
    
    // Run once on mount
    testAPIs();
  }, []);

  useEffect(() => {
    async function fetchData() {
      console.log('About to dispatch fetchAllGoogleAlbums');
      try {
        const resultAction = await dispatch(fetchAllGoogleAlbums());
        console.log('Fetch albums result:', resultAction);
        
        // Check if it was fulfilled or rejected
        if (fetchAllGoogleAlbums.fulfilled.match(resultAction)) {
          console.log('Albums fetch successful:', resultAction.payload);
        } else if (fetchAllGoogleAlbums.rejected.match(resultAction)) {
          console.error('Albums fetch failed:', resultAction.error);
        }
      } catch (error) {
        console.error('Error dispatching fetchAllGoogleAlbums:', error);
      }
    }

    if (!Array.isArray(albums) || albums.length === 0) {
      console.log('Triggering album fetch...');
      fetchData();
    }
  }, [dispatch, albums]);

  useEffect(() => {
    console.log('Filter effect triggered');
    console.log('Albums for filtering:', albums);
    console.log('Filter value:', filter);

    if (!Array.isArray(albums)) {
      console.warn('Albums is not an array in filter effect:', albums);
      setFilteredAlbums([]);
      return;
    }

    const filtered = albums.filter((album: GoogleAlbum, index: number) => {
      console.log(`Filtering album ${index}:`, album);
      
      // Safety check: ensure album exists and has required properties
      if (!album || typeof album !== 'object') {
        console.warn(`Invalid album at index ${index}:`, album);
        return false;
      }
      
      if (!album.id) {
        console.warn(`Album missing ID at index ${index}:`, album);
        return false;
      }
      
      // Safety check: ensure title exists and is a string
      const title = album.title || '';
      const matches = title.toLowerCase().includes(filter.toLowerCase());
      console.log(`Album "${title}" matches filter "${filter}":`, matches);
      return matches;
    });
    
    console.log('Filtered result:', filtered);
    setFilteredAlbums(filtered);
  }, [albums, filter]);

  // Update filteredAlbums when albums change (initial load)
  useEffect(() => {
    console.log('Albums change effect triggered');
    console.log('New albums:', albums);
    
    if (Array.isArray(albums)) {
      console.log('Setting filtered albums from albums array:', albums);
      // Validate each album before setting
      const validAlbums = albums.filter((album, index) => {
        if (!album || typeof album !== 'object') {
          console.error(`Invalid album at index ${index}:`, album);
          return false;
        }
        if (!album.id) {
          console.error(`Album missing ID at index ${index}:`, album);
          return false;
        }
        return true;
      });
      console.log('Valid albums after filtering:', validAlbums);
      setFilteredAlbums(validAlbums);
    } else {
      console.warn('Albums is not an array in change effect:', albums);
      setFilteredAlbums([]);
    }
  }, [albums]);

  // Create mock albums for testing UI
  const createMockAlbums = () => {
    const mockAlbums: GoogleAlbum[] = [
      {
        id: 'mock-1',
        title: 'Test Album 1',
        coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=1',
        mediaItemsCount: '25',
        productUrl: 'https://photos.google.com'
      },
      {
        id: 'mock-2',
        title: 'Test Album 2',
        coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=2',
        mediaItemsCount: '12',
        productUrl: 'https://photos.google.com'
      },
      {
        id: 'mock-3',
        title: 'Test Album 3',
        coverPhotoBaseUrl: undefined, // Changed from null to undefined
        mediaItemsCount: '8',
        productUrl: 'https://photos.google.com'
      }
    ];
    setFilteredAlbums(mockAlbums);
    console.log('Mock albums created:', mockAlbums);
  };

  // Render debugging info
  const renderDebugInfo = () => (
    <div style={{ 
      background: '#f0f0f0', 
      padding: '10px', 
      margin: '10px 0', 
      fontSize: '12px',
      fontFamily: 'monospace',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4>Debug Info:</h4>
      <div>Loading: {String(loading)}</div>
      <div>Albums type: {typeof albums}</div>
      <div>Albums is array: {String(Array.isArray(albums))}</div>
      <div>Albums length: {albums?.length || 'N/A'}</div>
      <div>Filtered albums length: {filteredAlbums.length}</div>
      <div>Filter: &quot;{filter}&quot;</div>
      <div>Error: {error || 'None'}</div>
      <div>Albums Error: {albumsError || 'None'}</div>
      
      <button 
        onClick={createMockAlbums}
        style={{ 
          margin: '10px 0', 
          padding: '5px 10px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '3px' 
        }}
      >
        Load Mock Albums (Test UI)
      </button>
      
      <details>
        <summary>API Test Results:</summary>
        <pre>{JSON.stringify(apiTestResults, null, 2)}</pre>
      </details>
      
      <details>
        <summary>Full Redux State:</summary>
        <pre>{JSON.stringify(fullState, null, 2)}</pre>
      </details>
      
      <details>
        <summary>Raw albums data:</summary>
        <pre>{JSON.stringify(albums, null, 2)}</pre>
      </details>
      
      <details>
        <summary>Filtered albums data:</summary>
        <pre>{JSON.stringify(filteredAlbums, null, 2)}</pre>
      </details>
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>Albums - Digital Nomad Photos (Debug)</title>
        <meta name="description" content="Albums - Digital Nomad Photos" />
      </Head>

      <h1 hidden>Albums</h1>

      {/* Debug info - always show in this debug version */}
      {renderDebugInfo()}

      {loading ? (
        <Loader />
      ) : (
        <section className={styles.container}>
          <Filter
            placeholder="Search albums..."
            filter={filter}
            setFilter={setTitleFilter}
          />
          <ElementCounter
            count={filteredAlbums.length}
            text={{ singular: 'Album', plural: 'Albums' }}
          />
          {filteredAlbums.length > 0 ? (
            <AlbumList albums={filteredAlbums} />
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3>No albums to display</h3>
              {albums?.length === 0 && <p>No albums loaded from API</p>}
              {!Array.isArray(albums) && <p>Albums data is not in expected format</p>}
              
              <div style={{ marginTop: '20px' }}>
                <h4>Possible Issues:</h4>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                  <li>Google Photos API not configured</li>
                  <li>Authentication tokens not set up</li>
                  <li>API endpoints returning errors</li>
                  <li>Network connectivity issues</li>
                </ul>
                
                <button 
                  onClick={createMockAlbums}
                  style={{ 
                    marginTop: '10px',
                    padding: '10px 20px', 
                    background: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Test UI with Mock Data
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </Layout>
  );
};

export default AlbumsPage;