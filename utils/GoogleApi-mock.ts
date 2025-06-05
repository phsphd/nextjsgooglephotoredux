// utils/GoogleApi.ts - Complete working version with mock data

import { GoogleAlbum, GoogleMediaItem } from 'types/google';

// Mock data for testing
const mockAlbumsData = {
  albums: [
    {
      id: 'album-1',
      title: 'Wedding Ceremony',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=1',
      mediaItemsCount: '45',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-2', 
      title: 'Wedding Reception',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=2',
      mediaItemsCount: '67',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-3',
      title: 'Wedding Portraits',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=3',
      mediaItemsCount: '23',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-4',
      title: 'Getting Ready',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=4',
      mediaItemsCount: '34',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-5',
      title: 'Guests & Candids',
      coverPhotoBaseUrl: undefined, // Changed from null to undefined
      mediaItemsCount: '89',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-6',
      title: 'Honeymoon',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=6',
      mediaItemsCount: '156',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-7',
      title: 'Preparation',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=7',
      mediaItemsCount: '28',
      productUrl: 'https://photos.google.com'
    },
    {
      id: 'album-8',
      title: 'Family Photos',
      coverPhotoBaseUrl: 'https://picsum.photos/400/300?random=8',
      mediaItemsCount: '42',
      productUrl: 'https://photos.google.com'
    }
  ] as GoogleAlbum[] // Add type assertion to ensure compatibility
};

const mockMediaItemsData = {
  mediaItems: [
    {
      id: 'media-1',
      baseUrl: 'https://picsum.photos/800/600?random=10',
      filename: 'IMG_001.jpg',
      mediaMetadata: {
        width: '800',
        height: '600',
        creationTime: new Date('2024-01-15T10:30:00Z').toISOString()
      }
    },
    {
      id: 'media-2',
      baseUrl: 'https://picsum.photos/800/600?random=11',
      filename: 'IMG_002.jpg',
      mediaMetadata: {
        width: '800',
        height: '600',
        creationTime: new Date('2024-01-15T10:35:00Z').toISOString()
      }
    },
    {
      id: 'media-3',
      baseUrl: 'https://picsum.photos/600/800?random=12',
      filename: 'IMG_003.jpg',
      mediaMetadata: {
        width: '600',
        height: '800',
        creationTime: new Date('2024-01-15T10:40:00Z').toISOString()
      }
    },
    {
      id: 'media-4',
      baseUrl: 'https://picsum.photos/800/600?random=13',
      filename: 'IMG_004.jpg',
      mediaMetadata: {
        width: '800',
        height: '600',
        creationTime: new Date('2024-01-15T10:45:00Z').toISOString()
      }
    },
    {
      id: 'media-5',
      baseUrl: 'https://picsum.photos/700/700?random=14',
      filename: 'IMG_005.jpg',
      mediaMetadata: {
        width: '700',
        height: '700',
        creationTime: new Date('2024-01-15T10:50:00Z').toISOString()
      }
    }
  ]
};

// Mock Google API token function
export const getGoogleApiToken = async (): Promise<string> => {
  console.log('Using mock Google API token for testing');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return 'mock-token-12345-for-testing';
};

// Get albums with mock data
export const getGoogleAlbums = async (pageToken?: string) => {
  console.log('getGoogleAlbums called with pageToken:', pageToken);
  console.log('Using mock data - returning test albums');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock data
  console.log('Mock albums data:', mockAlbumsData);
  console.log('Albums in response:', mockAlbumsData.albums?.length || 0);
  
  return mockAlbumsData;
};

// Get single album
export const getGoogleAlbum = async (albumId: string): Promise<GoogleAlbum> => {
  console.log('getGoogleAlbum called for:', albumId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const album = mockAlbumsData.albums.find(a => a.id === albumId);
  if (!album) {
    throw new Error(`Album with ID ${albumId} not found`);
  }
  
  console.log('Found album:', album);
  return album;
};

// Get media items for album
export const getGoogleMediaItemsAlbum = async (albumId: string, pageToken?: string) => {
  console.log('getGoogleMediaItemsAlbum called for album:', albumId, 'pageToken:', pageToken);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mock media items
  const result = {
    mediaItems: mockMediaItemsData.mediaItems.map(item => ({
      ...item,
      id: `${albumId}-${item.id}`
    })),
    nextPageToken: pageToken ? undefined : 'mock-next-page-token' // Changed null to undefined
  };
  
  console.log('Mock media items for album:', result);
  return result;
};

// Get all media items (general search)
export const getGoogleMediaItems = async (pageToken?: string) => {
  console.log('getGoogleMediaItems called with pageToken:', pageToken);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const result = {
    mediaItems: mockMediaItemsData.mediaItems,
    nextPageToken: pageToken ? undefined : 'mock-general-next-page-token' // Changed null to undefined
  };
  
  console.log('Mock general media items:', result);
  return result;
};

// Get single media item by ID
export const getGoogleMediaItem = async (mediaItemId: string): Promise<GoogleMediaItem> => {
  console.log('getGoogleMediaItem called for:', mediaItemId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Find in mock data or create a mock item
  let mediaItem = mockMediaItemsData.mediaItems.find(item => item.id === mediaItemId);
  
  if (!mediaItem) {
    // Create a mock item if not found
    mediaItem = {
      id: mediaItemId,
      baseUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
      filename: `${mediaItemId}.jpg`,
      mediaMetadata: {
        width: '800',
        height: '600',
        creationTime: new Date().toISOString()
      }
    };
  }
  
  console.log('Mock media item:', mediaItem);
  return mediaItem;
};

// Token-accepting versions for API routes
export const getGoogleAlbumsWithToken = async (token: string, pageToken?: string) => {
  console.log('getGoogleAlbumsWithToken called with token:', token ? 'Token exists' : 'No token');
  return await getGoogleAlbums(pageToken);
};

export const getGoogleAlbumWithToken = async (token: string, albumId: string): Promise<GoogleAlbum> => {
  console.log('getGoogleAlbumWithToken called for album:', albumId);
  return await getGoogleAlbum(albumId);
};

export const getGoogleMediaItemsAlbumWithToken = async (token: string, albumId: string, pageToken?: string) => {
  console.log('getGoogleMediaItemsAlbumWithToken called for album:', albumId);
  return await getGoogleMediaItemsAlbum(albumId, pageToken);
};

export const getGoogleMediaItemWithToken = async (token: string, mediaItemId: string): Promise<GoogleMediaItem> => {
  console.log('getGoogleMediaItemWithToken called for:', mediaItemId);
  return await getGoogleMediaItem(mediaItemId);
};

export const getGoogleMediaItemsWithToken = async (token: string, pageToken?: string) => {
  console.log('getGoogleMediaItemsWithToken called');
  return await getGoogleMediaItems(pageToken);
};

// OAuth helper functions (for future real implementation)
export const getGoogleAuthUrl = (): string => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';
  const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/photoslibrary.sharing'
  ].join(' ');
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || '',
    redirect_uri: GOOGLE_REDIRECT_URI,
    scope: GOOGLE_SCOPES,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  console.log('exchangeCodeForToken called (mock implementation)');
  // Mock implementation for now
  return 'mock-exchanged-token-' + code.substring(0, 10);
};

// Helper functions for token management
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('google_access_token') || sessionStorage.getItem('google_access_token') || null;
};

export const storeToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('google_access_token', token);
  sessionStorage.setItem('google_access_token', token);
};

export const clearToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('google_access_token');
  sessionStorage.removeItem('google_access_token');
};

// Export types for convenience
export type { GoogleAlbum, GoogleMediaItem };