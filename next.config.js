/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'amealio-careers.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Add webpack configuration for better chunk loading
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Add chunk loading error handling
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          default: {
            ...config.optimization.splitChunks.cacheGroups.default,
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }
    }
    
    // Add retry logic for chunk loading
    config.output.chunkLoadTimeout = 30000
    config.output.chunkLoadingGlobal = 'webpackChunkamealio_careers_portal'
    
    return config
  },
  // Add experimental features for better error handling
  experimental: {
    // optimizeCss: true, // Disabled due to critters module issue
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Add cache control headers for better chunk loading
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
