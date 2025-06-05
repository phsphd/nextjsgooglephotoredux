/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Add any experimental features you need here
  },
  // Remove i18n config - not supported in App Router
  // For App Router internationalization, use next-intl or similar libraries
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com', 
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'picsum.photos' // Add picsum.photos for mock images
    ],
    unoptimized: false, // Allow Next.js optimization
  },
  reactStrictMode: true
};

module.exports = nextConfig;