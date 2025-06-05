// utils/GoogleApi.ts - Fixed version with proper client/server separation

import { GoogleAlbum, GoogleMediaItem } from 'types/google';
import { loadGooglePickerScript } from './loadGooglePicker';
// Client-side configuration (only public env vars)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Token storage interface
interface TokenData {
  access_token: string;
  expires_at?: number;
}
export const showGooglePhotoPicker = async (): Promise<any[]> => {
  await loadGooglePickerScript();

  return new Promise(async (resolve, reject) => {
    const token = await getGoogleApiToken();

    // Load APIs
    (window as any).gapi.load('picker', {
      callback: () => {
        const picker = new (window as any).google.picker.PickerBuilder()
          .addView((new (window as any).google.picker.PhotosView())
            .setType((window as any).google.picker.PhotosView.Type.PHOTOS)
          )
          .setOAuthToken(token)
          .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
          .setCallback((data: any) => {
            if (data.action === 'picked') {
              resolve(data.docs);
            } else if (data.action === 'cancel') {
              resolve([]);
            }
          })
          .build();

        picker.setVisible(true);
      }
    });
  });
};
// Token management functions (client-side only)
export const getStoredTokenData = (): TokenData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const tokenStr = localStorage.getItem('google_token_data');
    return tokenStr ? JSON.parse(tokenStr) : null;
  } catch {
    return null;
  }
};

export const storeTokenData = (tokenData: TokenData): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('google_token_data', JSON.stringify(tokenData));
  console.log('Token data stored successfully');
};

export const clearTokenData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('google_token_data');
  localStorage.removeItem('google_access_token'); // Clear old format too
  console.log('Token data cleared');
};

// Check if access token is expired
const isTokenExpired = (tokenData: TokenData): boolean => {
  if (!tokenData.expires_at) return false;
  
  // Add 5 minute buffer before expiration
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  return Date.now() >= (tokenData.expires_at - bufferTime);
};

// Get fresh token from your API route (client-side)
const getAccessTokenFromAPI = async (): Promise<string> => {
  console.log('Getting fresh token from API...');
  
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', errorText);
    throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.access_token) {
    throw new Error('No access token received from API');
  }

  // Calculate expiration time (usually 1 hour)
  const expiresAt = data.expires_in 
    ? Date.now() + (data.expires_in * 1000) 
    : undefined;

  // Store token data
  const tokenData: TokenData = {
    access_token: data.access_token,
    expires_at: expiresAt
  };

  storeTokenData(tokenData);
  return data.access_token;
};

// Main function to get valid Google API token (client-side)
export const getGoogleApiToken = async (): Promise<string> => {
  console.log('Getting Google API token...');
  
  // Check if we have a valid stored token
  const tokenData = getStoredTokenData();
  
  if (tokenData?.access_token && !isTokenExpired(tokenData)) {
    console.log('Using valid stored access token');
    return tokenData.access_token;
  }
  
  // Token is expired or doesn't exist - get new one from API
  console.log('Access token expired or missing, refreshing via API...');
  return await getAccessTokenFromAPI();
};

// Client-side Google Photos functions
export const getGoogleAlbums = async (pageToken?: string) => {
  console.log('Fetching albums from Google Photos API...');
  
  const token = await getGoogleApiToken();
  
  // Build URL with optional page token
  let url = 'https://photoslibrary.googleapis.com/v1/albums?pageSize=50';
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  
  console.log('Fetching from:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Google Photos API Response Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Photos API Error:', errorText);
    
    if (response.status === 401) {
      // Token issue, clear stored token and retry once
      clearTokenData();
      console.log('Retrying with fresh token...');
      const newToken = await getAccessTokenFromAPI();
      
      const retryResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!retryResponse.ok) {
        throw new Error(`Failed to fetch albums after retry: ${retryResponse.status}`);
      }
      
      return await retryResponse.json();
    }
    
    throw new Error(`Failed to fetch albums: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Albums fetched successfully:', data.albums?.length || 0, 'albums');
  
  return data;
};

// Server-side only functions (for API routes)
export const getAccessTokenFromRefreshTokenServerSide = async (): Promise<string> => {
  // These env vars are only available server-side
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

  console.log('=== Server-side Environment Variables Check ===');
  console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
  console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
  console.log('GOOGLE_REFRESH_TOKEN:', GOOGLE_REFRESH_TOKEN ? 'SET' : 'MISSING');

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in environment variables');
  }
  
  if (!GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not set in environment variables');
  }
  
  if (!GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not set in environment variables');
  }

  console.log('Getting access token using refresh token (server-side)...');

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', errorText);
    throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Access token obtained successfully (server-side)');

  if (!data.access_token) {
    throw new Error('No access token received from refresh');
  }

  return data.access_token;
};

// Client-side functions that use getGoogleApiToken
export const getGoogleAlbum = async (albumId: string): Promise<GoogleAlbum> => {
  console.log('Fetching album:', albumId);
  
  const token = await getGoogleApiToken();
  
  const response = await fetch(
    `https://photoslibrary.googleapis.com/v1/albums/${albumId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      clearTokenData();
      throw new Error('Authentication failed. Please check your refresh token.');
    }
    throw new Error(`Failed to fetch album: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleMediaItemsAlbum = async (albumId: string, pageToken?: string) => {
  console.log('Fetching media items for album:', albumId);
  
  const token = await getGoogleApiToken();
  
  const body: any = {
    albumId: albumId,
    pageSize: 100,
  };
  
  if (pageToken) {
    body.pageToken = pageToken;
  }
  
  const response = await fetch(
    'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      clearTokenData();
      throw new Error('Authentication failed. Please check your refresh token.');
    }
    throw new Error(`Failed to fetch album media items: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleMediaItems = async (pageToken?: string) => {
  console.log('Fetching media items from Google Photos...');
  
  const token = await getGoogleApiToken();
  
  const body: any = {
    pageSize: 100,
  };
  
  if (pageToken) {
    body.pageToken = pageToken;
  }
  
  const response = await fetch(
    'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      clearTokenData();
      throw new Error('Authentication failed. Please check your refresh token.');
    }
    throw new Error(`Failed to fetch media items: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleMediaItem = async (mediaItemId: string): Promise<GoogleMediaItem> => {
  console.log('Fetching media item:', mediaItemId);
  
  const token = await getGoogleApiToken();
  
  const response = await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      clearTokenData();
      throw new Error('Authentication failed. Please check your refresh token.');
    }
    throw new Error(`Failed to fetch media item: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

// Server-side Google Photos functions (for API routes)
export const getGoogleAlbumsWithToken = async (token: string, pageToken?: string) => {
  let url = 'https://photoslibrary.googleapis.com/v1/albums?pageSize=50';
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch albums: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleAlbumWithToken = async (token: string, albumId: string): Promise<GoogleAlbum> => {
  const response = await fetch(
    `https://photoslibrary.googleapis.com/v1/albums/${albumId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch album: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleMediaItemsAlbumWithToken = async (token: string, albumId: string, pageToken?: string) => {
  const body: any = {
    albumId: albumId,
    pageSize: 100,
  };
  
  if (pageToken) {
    body.pageToken = pageToken;
  }
  
  const response = await fetch(
    'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch album media items: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleMediaItemWithToken = async (token: string, mediaItemId: string): Promise<GoogleMediaItem> => {
  const response = await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch media item: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getGoogleMediaItemsWithToken = async (token: string, pageToken?: string) => {
  const body: any = {
    pageSize: 100,
  };
  
  if (pageToken) {
    body.pageToken = pageToken;
  }
  
  const response = await fetch(
    'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch media items: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

// Export types for convenience
export type { GoogleAlbum, GoogleMediaItem };