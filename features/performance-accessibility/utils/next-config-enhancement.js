/**
 * Next.js configuration enhancement for optimal performance
 */

// Performance budget configuration
const PERFORMANCE_BUDGET = {
  // Core Web Vitals budgets
  largestContentfulPaint: 2500, // 2.5 seconds
  firstInputDelay: 100, // 100 milliseconds
  cumulativeLayoutShift: 0.1, // 0.1 score
  
  // Bundle size budgets
  javascript: {
    initial: 170, // 170 KB
    total: 500, // 500 KB
  },
  css: {
    initial: 50, // 50 KB
    total: 100, // 100 KB
  },
  images: {
    maxSize: 100, // 100 KB per image
    maxDimensions: {
      width: 1920,
      height: 1080,
    },
  },
  
  // Request budgets
  maxRequests: 30,
  maxDomains: 10,
};

// Image optimization configuration
const IMAGE_OPTIMIZATION = {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  quality: 75,
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
};

// Font optimization configuration
const FONT_OPTIMIZATION = {
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: true,
};

// Security headers for performance
const SECURITY_HEADERS = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

// Cache headers for static assets
const CACHE_HEADERS = [
  {
    source: '/_next/static/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
  {
    source: '/static/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
  {
    source: '/favicon.ico',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=86400',
      },
    ],
  },
  {
    source: '/(.*).(jpg|jpeg|png|gif|webp|avif|ico|svg)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=86400',
      },
    ],
  },
  {
    source: '/(.*).(css|js)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000',
      },
    ],
  },
];

// Performance monitoring configuration
const PERFORMANCE_MONITORING = {
  // Web Vitals reporting
  reportWebVitals: true,
  
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
  },
  
  // Performance monitoring endpoints
  endpoints: {
    webVitals: '/api/web-vitals',
    performance: '/api/performance',
  },
};

// Code splitting configuration
const CODE_SPLITTING = {
  // Chunk size optimization
  maxChunkSize: 244 * 1024, // 244 KB
  
  // Min chunk size
  minChunkSize: 20 * 1024, // 20 KB
  
  // Automatic vendor splitting
  automaticVendorSplitting: true,
  
  // Runtime chunk
  runtimeChunk: 'single',
};

// Compression configuration
const COMPRESSION = {
  gzip: true,
  brotli: true,
  compressionLevel: 6,
};

// Next.js configuration enhancement
module.exports = {
  // Performance budgets
  performanceBudget: PERFORMANCE_BUDGET,
  
  // Image optimization
  imageOptimization: IMAGE_OPTIMIZATION,
  
  // Font optimization
  fontOptimization: FONT_OPTIMIZATION,
  
  // Security headers
  securityHeaders: SECURITY_HEADERS,
  
  // Cache headers
  cacheHeaders: CACHE_HEADERS,
  
  // Performance monitoring
  performanceMonitoring: PERFORMANCE_MONITORING,
  
  // Code splitting
  codeSplitting: CODE_SPLITTING,
  
  // Compression
  compression: COMPRESSION,
  
  // Helper function to apply configuration to Next.js config
  applyToNextConfig: function(nextConfig = {}) {
    return {
      ...nextConfig,
      
      // Image optimization
      images: {
        ...nextConfig.images,
        formats: IMAGE_OPTIMIZATION.formats,
        deviceSizes: IMAGE_OPTIMIZATION.deviceSizes,
        imageSizes: IMAGE_OPTIMIZATION.imageSizes,
        minimumCacheTTL: IMAGE_OPTIMIZATION.minimumCacheTTL,
      },
      
      // Compression
      compress: COMPRESSION.gzip,
      
      // Headers
      async headers() {
        const headers = [];
        
        // Add security headers
        headers.push(...SECURITY_HEADERS);
        
        // Add cache headers
        headers.push(...CACHE_HEADERS);
        
        // Merge with existing headers
        const existingHeaders = nextConfig.headers ? await nextConfig.headers() : [];
        return [...headers, ...existingHeaders];
      },
      
      // Webpack configuration
      webpack: (config, { isServer }) => {
        // Apply code splitting configuration
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization.splitChunks,
            chunks: 'all',
            maxSize: CODE_SPLITTING.maxChunkSize,
            minSize: CODE_SPLITTING.minChunkSize,
            automaticNameDelimiter: '~',
            cacheGroups: {
              ...config.optimization.splitChunks.cacheGroups,
              vendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true,
              },
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
            },
          },
          runtimeChunk: CODE_SPLITTING.runtimeChunk,
        };
        
        // Apply compression
        if (!isServer) {
          config.plugins.push(
            new (require('compression-webpack-plugin'))({
              algorithm: 'gzip',
              test: /\.(js|css|html|json|ico|svg|eot|otf|ttf|map)$/,
              threshold: 10240,
              minRatio: 0.8,
            })
          );
          
          if (COMPRESSION.brotli) {
            config.plugins.push(
              new (require('compression-webpack-plugin'))({
                algorithm: 'brotliCompress',
                test: /\.(js|css|html|json|ico|svg|eot|otf|ttf|map)$/,
                compressionOptions: {
                  level: COMPRESSION.compressionLevel,
                },
                threshold: 10240,
                minRatio: 0.8,
              })
            );
          }
        }
        
        // Call existing webpack config if present
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, { isServer });
        }
        
        return config;
      },
    };
  },
  
  // Helper function to generate performance report
  generatePerformanceReport: function(metrics) {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      budget: PERFORMANCE_BUDGET,
      violations: [],
    };
    
    // Check for violations
    if (metrics.largestContentfulPaint > PERFORMANCE_BUDGET.largestContentfulPaint) {
      report.violations.push({
        metric: 'LCP',
        value: metrics.largestContentfulPaint,
        budget: PERFORMANCE_BUDGET.largestContentfulPaint,
        severity: 'high',
      });
    }
    
    if (metrics.firstInputDelay > PERFORMANCE_BUDGET.firstInputDelay) {
      report.violations.push({
        metric: 'FID',
        value: metrics.firstInputDelay,
        budget: PERFORMANCE_BUDGET.firstInputDelay,
        severity: 'high',
      });
    }
    
    if (metrics.cumulativeLayoutShift > PERFORMANCE_BUDGET.cumulativeLayoutShift) {
      report.violations.push({
        metric: 'CLS',
        value: metrics.cumulativeLayoutShift,
        budget: PERFORMANCE_BUDGET.cumulativeLayoutShift,
        severity: 'medium',
      });
    }
    
    return report;
  },
  
  // Helper function to optimize images
  optimizeImage: function(src, options = {}) {
    const { width, height, quality = IMAGE_OPTIMIZATION.quality, format = 'webp' } = options;
    
    // In a real implementation, this would generate optimized image URLs
    // For now, return the original src with query parameters
    const params = new URLSearchParams();
    
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    if (quality) params.set('q', quality);
    if (format) params.set('fm', format);
    
    return params.toString() ? `${src}?${params.toString()}` : src;
  },
  
  // Helper function to preload resources
  generatePreloadTags: function(resources) {
    return resources.map(resource => {
      const { href, as, type, crossorigin } = resource;
      
      return {
        rel: 'preload',
        href,
        as,
        type,
        crossorigin: crossorigin ? 'anonymous' : undefined,
      };
    });
  },
};
