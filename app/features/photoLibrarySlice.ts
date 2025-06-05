// app/features/photoLibrarySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GoogleAlbum, GoogleMediaItem } from 'types/google';

// Async thunks for API calls
export const fetchGoogleAlbum = createAsyncThunk(
  'photoLibrary/fetchAlbum',
  async (albumId: string) => {
    // Import your Google API utility
    const { getGoogleAlbum } = await import('utils/GoogleApi');
    return await getGoogleAlbum(albumId);
  }
);

export const fetchGoogleAlbumMediaItems = createAsyncThunk(
  'photoLibrary/fetchAlbumMediaItems',
  async (albumId: string) => {
    // Import your Google API utility
    const { getGoogleMediaItemsAlbum } = await import('utils/GoogleApi');
    const response = await getGoogleMediaItemsAlbum(albumId);
    return { albumId, mediaItems: response.mediaItems || [] };
  }
);

export const fetchGoogleAlbums = createAsyncThunk(
  'photoLibrary/fetchAlbums',
  async () => {
    // Import your Google API utility
    const { getGoogleAlbums } = await import('utils/GoogleApi');
    return await getGoogleAlbums();
  }
);

// Fetch general media items (for photostream)
export const fetchGoogleMediaItems = createAsyncThunk(
  'photoLibrary/fetchMediaItems',
  async () => {
    // Import your Google API utility
    const { getGoogleMediaItems } = await import('utils/GoogleApi');
    const response = await getGoogleMediaItems();
    return response.mediaItems || [];
  }
);

// Alias for backward compatibility
export const fetchAllGoogleAlbums = fetchGoogleAlbums;

// State interface
export interface PhotoLibraryState {
  // Albums
  albums: GoogleAlbum[]; // Changed to array to match your component usage
  albumsById: { [albumId: string]: GoogleAlbum };
  
  // General media items (for photostream)
  mediaItems: GoogleMediaItem[];
  
  // Photos by album
  albumPhotos: { [albumId: string]: GoogleMediaItem[] };
  
  // Filter state
  filter: string;
  
  // Loading states
  loading: boolean;
  albumsLoading: boolean;
  mediaItemsLoading: boolean;
  photosLoading: { [albumId: string]: boolean };
  
  // Error states
  error: string | null;
  albumsError: string | null;
  mediaItemsError: string | null;
  photosError: { [albumId: string]: string | null };
  
  // Pagination
  nextPageTokens: { [albumId: string]: string | null };
  mediaItemsNextPageToken: string | null;
  
  // Cache timestamps
  lastFetch: { [key: string]: number };
}

const initialState: PhotoLibraryState = {
  albums: [],
  albumsById: {},
  mediaItems: [],
  albumPhotos: {},
  filter: '',
  loading: false,
  albumsLoading: false,
  mediaItemsLoading: false,
  photosLoading: {},
  error: null,
  albumsError: null,
  mediaItemsError: null,
  photosError: {},
  nextPageTokens: {},
  mediaItemsNextPageToken: null,
  lastFetch: {},
};

// Helper to check if data is stale (5 minutes)
const isDataStale = (timestamp: number) => {
  return Date.now() - timestamp > 5 * 60 * 1000;
};

const photoLibrarySlice = createSlice({
  name: 'photoLibrary',
  initialState,
  reducers: {
    // Filter actions
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    
    clearFilter: (state) => {
      state.filter = '';
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.albumsError = null;
    },
    
    clearAlbumError: (state, action: PayloadAction<string>) => {
      delete state.photosError[action.payload];
    },
    
    // Cache management
    clearCache: (state) => {
      state.albums = [];
      state.albumsById = {};
      state.mediaItems = [];
      state.albumPhotos = {};
      state.lastFetch = {};
    },
    
    // Set page tokens for pagination
    setNextPageToken: (state, action: PayloadAction<{ albumId: string; token: string | null }>) => {
      state.nextPageTokens[action.payload.albumId] = action.payload.token;
    },
    
    setMediaItemsNextPageToken: (state, action: PayloadAction<string | null>) => {
      state.mediaItemsNextPageToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch album
    builder
      .addCase(fetchGoogleAlbum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoogleAlbum.fulfilled, (state, action) => {
        state.loading = false;
        state.albumsById[action.meta.arg] = action.payload;
        
        // Update albums array if this album isn't already in it
        const existingIndex = state.albums.findIndex(album => album.id === action.meta.arg);
        if (existingIndex === -1) {
          state.albums.push(action.payload);
        } else {
          state.albums[existingIndex] = action.payload;
        }
        
        state.lastFetch[`album-${action.meta.arg}`] = Date.now();
      })
      .addCase(fetchGoogleAlbum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch album';
      });

    // Fetch album media items
    builder
      .addCase(fetchGoogleAlbumMediaItems.pending, (state, action) => {
        const albumId = action.meta.arg;
        state.photosLoading[albumId] = true;
        state.photosError[albumId] = null;
      })
      .addCase(fetchGoogleAlbumMediaItems.fulfilled, (state, action) => {
        const { albumId, mediaItems } = action.payload;
        state.photosLoading[albumId] = false;
        state.albumPhotos[albumId] = mediaItems;
        state.lastFetch[`photos-${albumId}`] = Date.now();
      })
      .addCase(fetchGoogleAlbumMediaItems.rejected, (state, action) => {
        const albumId = action.meta.arg;
        state.photosLoading[albumId] = false;
        state.photosError[albumId] = action.error.message || 'Failed to fetch album photos';
      });

    // Fetch albums list
    builder
      .addCase(fetchGoogleAlbums.pending, (state) => {
        state.albumsLoading = true;
        state.albumsError = null;
      })
      .addCase(fetchGoogleAlbums.fulfilled, (state, action) => {
        state.albumsLoading = false;
        state.loading = false; // Also set main loading to false
        state.albums = action.payload.albums || [];
        
        // Update albumsById object
        state.albumsById = {};
        action.payload.albums?.forEach((album: GoogleAlbum) => {
          if (album.id) {
            state.albumsById[album.id] = album;
          }
        });
        
        state.lastFetch['albums'] = Date.now();
      })
      .addCase(fetchGoogleAlbums.rejected, (state, action) => {
        state.albumsLoading = false;
        state.albumsError = action.error.message || 'Failed to fetch albums';
      });

    // Fetch general media items
    builder
      .addCase(fetchGoogleMediaItems.pending, (state) => {
        state.mediaItemsLoading = true;
        state.loading = true;
        state.mediaItemsError = null;
      })
      .addCase(fetchGoogleMediaItems.fulfilled, (state, action) => {
        state.mediaItemsLoading = false;
        state.loading = false;
        state.mediaItems = action.payload;
        state.lastFetch['mediaItems'] = Date.now();
      })
      .addCase(fetchGoogleMediaItems.rejected, (state, action) => {
        state.mediaItemsLoading = false;
        state.loading = false;
        state.mediaItemsError = action.error.message || 'Failed to fetch media items';
      });
  },
});

export const {
  setFilter,
  clearFilter,
  clearError,
  clearAlbumError,
  clearCache,
  setNextPageToken,
  setMediaItemsNextPageToken,
} = photoLibrarySlice.actions;

// Selectors
export const selectAlbum = (state: { photoLibrary: PhotoLibraryState }, albumId: string) =>
  state.photoLibrary.albumsById[albumId];

export const selectAlbumPhotos = (state: { photoLibrary: PhotoLibraryState }, albumId: string) =>
  state.photoLibrary.albumPhotos[albumId] || [];

export const selectAlbums = (state: { photoLibrary: PhotoLibraryState }) =>
  state.photoLibrary.albums;

export const selectMediaItems = (state: { photoLibrary: PhotoLibraryState }) =>
  state.photoLibrary.mediaItems;

export const selectFilter = (state: { photoLibrary: PhotoLibraryState }) =>
  state.photoLibrary.filter;

export const selectIsAlbumLoading = (state: { photoLibrary: PhotoLibraryState }, albumId: string) =>
  state.photoLibrary.photosLoading[albumId] || false;

export const selectAlbumError = (state: { photoLibrary: PhotoLibraryState }, albumId: string) =>
  state.photoLibrary.photosError[albumId];

export default photoLibrarySlice.reducer;