// types/google.ts

export type GoogleAlbum = {
  id: string;
  title?: string;
  productUrl?: string;
  mediaItemsCount?: string; // API returns this as string, not number
  coverPhotoBaseUrl?: string;
  coverPhotoMediaItemId?: string;
  isWriteable?: boolean;
  shareInfo?: {
    sharedAlbumOptions?: {
      isCollaborative?: boolean;
      isCommentable?: boolean;
    };
    shareableUrl?: string;
    shareToken?: string;
    isJoined?: boolean;
    isOwned?: boolean;
    isJoinable?: boolean;
  };
};

export type GoogleAlbumsResponse = {
  albums?: GoogleAlbum[]; // Optional since empty response possible
  nextPageToken?: string;
};

export type GoogleMediaMetadata = {
  creationTime?: string;
  width?: string;
  height?: string;
  photo?: {
    cameraMake?: string;
    cameraModel?: string;
    focalLength?: number;
    apertureFNumber?: number;
    isoEquivalent?: number;
    exposureTime?: string;
  };
  video?: {
    cameraMake?: string;
    cameraModel?: string;
    fps?: number;
    status?: 'UNSPECIFIED' | 'PROCESSING' | 'READY' | 'FAILED';
  };
};

export type GoogleMediaItem = {
  id: string;
  description?: string;
  productUrl?: string;
  baseUrl?: string; // Expires after ~1 hour
  mimeType?: string;
  mediaMetadata?: GoogleMediaMetadata;
  contributorInfo?: {
    profilePictureBaseUrl?: string;
    displayName?: string;
  };
  filename?: string;
};

export type GoogleMediaItemsResponse = {
  mediaItems?: GoogleMediaItem[]; // Optional since empty response possible
  nextPageToken?: string;
};

// Additional utility types that might be useful

export type GoogleMediaItemStatus = 'UNSPECIFIED' | 'PROCESSING' | 'READY' | 'FAILED';

export type GoogleSharedAlbumOptions = {
  isCollaborative?: boolean;
  isCommentable?: boolean;
};

export type GoogleShareInfo = {
  sharedAlbumOptions?: GoogleSharedAlbumOptions;
  shareableUrl?: string;
  shareToken?: string;
  isJoined?: boolean;
  isOwned?: boolean;
  isJoinable?: boolean;
};

// For search requests
export type GoogleMediaItemsSearchRequest = {
  albumId?: string;
  pageSize?: number;
  pageToken?: string;
  filters?: {
    dateFilter?: {
      ranges?: Array<{
        startDate?: {
          year?: number;
          month?: number;
          day?: number;
        };
        endDate?: {
          year?: number;
          month?: number;
          day?: number;
        };
      }>;
      dates?: Array<{
        year?: number;
        month?: number;
        day?: number;
      }>;
    };
    contentFilter?: {
      includedContentCategories?: string[];
      excludedContentCategories?: string[];
    };
    mediaTypeFilter?: {
      mediaTypes?: ('ALL_MEDIA' | 'VIDEO' | 'PHOTO')[];
    };
    featureFilter?: {
      includedFeatures?: ('NONE' | 'FAVORITES')[];
    };
  };
};

// Error response type
export type GoogleApiError = {
  error: {
    code: number;
    message: string;
    status: string;
    details?: Array<{
      '@type': string;
      [key: string]: any;
    }>;
  };
};

// Union type for API responses that might contain errors
export type GoogleApiResponse<T> = T | GoogleApiError;

// Type guards to check for errors
export const isGoogleApiError = (response: any): response is GoogleApiError => {
  return response && typeof response === 'object' && 'error' in response;
};

// Enhanced types for your wedding gallery use case
export type WeddingPhoto = GoogleMediaItem & {
  // Add computed properties for your app
  thumbnailUrl?: string;
  fullSizeUrl?: string;
  blurDataUrl?: string;
  aspectRatio?: number;
  isProcessed?: boolean;
};

export type WeddingAlbum = GoogleAlbum & {
  // Add computed properties
  thumbnailPhotos?: WeddingPhoto[];
  photoCount?: number;
  isWeddingAlbum?: boolean;
};

// Helper type for pagination
export type PaginatedResponse<T> = {
  items: T[];
  nextPageToken?: string;
  hasMore: boolean;
  totalCount?: number;
};

// Utility type for API call options
export type GoogleApiOptions = {
  pageSize?: number;
  pageToken?: string;
  maxRetries?: number;
  timeout?: number;
};