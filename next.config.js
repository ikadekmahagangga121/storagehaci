/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce memory usage
  experimental: {
    // optimizeCss: true, // Disabled due to build issues
    optimizePackageImports: ['lucide-react'],
  },
  
  // Optimize images
  images: {
    domains: ['localhost', 'your-project.supabase.co', 'qryukdexbipdkygzlrwd.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Reduce image memory usage
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Reduce bundle size
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // Reduce memory usage during build
  swcMinify: true,
  
  // Compress static files
  compress: true,
  
  // Reduce memory usage for development
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: false,
  }),

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
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 