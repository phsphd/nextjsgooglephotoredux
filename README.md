# Digital Nomad Photos - Legacy Redux Implementation

> ⚠️ **DEPRECATED:** This repository contains a legacy implementation that is no longer functional due to Google Photos API changes effective March 31, 2025.

## Important Notice

**Google Photos Library API Deprecation**: On March 31, 2025, Google deprecated the `photoslibrary.readonly`, `photoslibrary.sharing`, and `photoslibrary` scopes that this application relied on. The API now only allows access to photos and videos uploaded by your application, making this legacy implementation non-functional for browsing user's existing Google Photos libraries.

## What This Repository Contains

This is a **legacy React/Next.js application** that originally provided a feature-rich gallery interface for Google Photos using:

- **Redux Toolkit** for complex state management
- **Google Photos Library API** with refresh token authentication
- **Server-side API routes** for Google Photos integration
- **Advanced photo gallery features** including search, filtering, and metadata display

## Legacy Architecture

### Tech Stack (Deprecated)
- **Frontend**: React 18, Next.js 13, TypeScript
- **State Management**: Redux Toolkit with createSlice and createAsyncThunk
- **Authentication**: OAuth 2.0 with refresh tokens
- **API Integration**: Google Photos Library API (now deprecated)
- **Styling**: Tailwind CSS
- **Image Display**: Custom gallery components

### Key Features (Non-functional)
- ✨ Full Google Photos library browsing
- 📁 Album and media item management
- 🔍 Advanced search and filtering
- 📱 Responsive photo gallery
- 🔄 Automatic token refresh
- 📊 Photo metadata display
- 💾 Redux-based state persistence

## Why This No Longer Works

1. **API Scope Removal**: Google removed readonly access to user photos
2. **Authentication Changes**: Previous OAuth flows no longer grant necessary permissions
3. **Endpoint Restrictions**: API endpoints now return 403 errors for user content
4. **Policy Updates**: New Google Photos API policies focus on app-created content only

## Alternative Solutions

Since Google Photos is no longer viable for third-party gallery applications, consider these alternatives:

### 1. Cloudinary Integration
**Recommended replacement** - Professional image and video management:

```bash
npm install cloudinary @cloudinary/react @cloudinary/url-gen
```

**Benefits:**
- Advanced image transformations
- Automatic optimization
- CDN delivery
- Video support
- Rich gallery widgets
- Upload and management APIs

### 2. Other Photo Service APIs
- **Flickr API** - Large photo community with comprehensive API
- **Unsplash API** - High-quality stock photography
- **Pexels API** - Free stock photos and videos
- **AWS S3 + CloudFront** - Custom photo storage solution
- **Firebase Storage** - Google's alternative storage solution

### 3. File-based Solutions
- **Local file uploads** with drag-and-drop
- **OneDrive API** - Microsoft's photo storage
- **Dropbox API** - File storage with gallery features
- **iCloud API** - Apple's photo storage (limited)

## Migration Guide

To modernize this application:

### Option A: Cloudinary Migration
1. Replace Google Photos API calls with Cloudinary SDK
2. Simplify state management (remove Redux complexity)
3. Use Cloudinary's built-in gallery components
4. Implement file upload workflows

### Option B: Generic Photo Gallery
1. Remove all Google Photos specific code
2. Create generic photo upload/display system
3. Use modern React patterns (Context API instead of Redux)
4. Implement your own storage backend

### Option C: Study the Architecture
Use this codebase to learn:
- Redux Toolkit patterns and best practices
- OAuth 2.0 implementation strategies
- API integration with error handling
- Complex React application architecture

## Repository Structure

```
├── components/           # React components
│   ├── GooglePhotoPicker.tsx
│   ├── PhotoGallery.tsx
│   └── ...
├── pages/
│   ├── api/             # Next.js API routes (deprecated)
│   │   ├── albums/
│   │   ├── mediaItems/
│   │   └── auth/
│   ├── albums.tsx       # Main gallery page
│   └── index.tsx
├── app/
│   ├── store.ts         # Redux store configuration
│   └── features/        # Redux slices
│       └── photoLibrarySlice.ts
├── utils/
│   └── GoogleApi.ts     # Google Photos API utilities (deprecated)
├── types/
│   └── google.ts        # TypeScript definitions
└── styles/
    └── globals.css      # Tailwind CSS
```

## Running the Legacy Code

**Note: This will not work due to API deprecation, but for educational purposes:**

1. **Clone the repository**
```bash
git clone [repository-url]
cd digital-nomad-photos-legacy
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup** (won't work but shows the structure)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

4. **Run development server**
```bash
npm run dev
```

## Learning Resources

This repository demonstrates several important concepts:

### Redux Patterns
- **createSlice** for reducer logic
- **createAsyncThunk** for API calls
- **RTK Query** for caching (partially implemented)
- **Normalized state management**

### API Integration
- **OAuth 2.0 flows** with refresh tokens
- **Rate limiting** and error handling
- **Pagination** for large datasets
- **Caching strategies**

### React Best Practices
- **TypeScript integration**
- **Custom hooks** for API calls
- **Error boundaries** for resilient UIs
- **Performance optimization** techniques

## Recommended Next Steps

1. **Study the Redux patterns** used in this application
2. **Explore the API integration** strategies for your own projects
3. **Migrate to Cloudinary** or another modern service
4. **Simplify state management** for new implementations

## Resources for Migration

- [Cloudinary React SDK Documentation](https://cloudinary.com/documentation/react_integration)
- [Google Photos API Migration Guide](https://developers.google.com/photos/support/updates)
- [Redux to Context API Migration](https://react.dev/reference/react/useContext)
- [Modern React Gallery Libraries](https://github.com/topics/react-gallery)

## Contributing

This repository is archived and no longer accepting contributions due to the underlying API deprecation. However, feel free to:

- **Fork the repository** for educational purposes
- **Use the patterns** in your own projects
- **Reference the architecture** for learning Redux

## License

MIT License - feel free to use this code for learning and reference.

---

**Disclaimer**: This code is provided as-is for educational purposes. The Google Photos API integration will not function due to Google's policy changes effective March 31, 2025. For production applications, please use alternative photo management services like Cloudinary, AWS S3, or other modern solutions.