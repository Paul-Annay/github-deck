import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Run ESLint separately via `npm run lint` (avoids deprecated next lint)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: '**.github.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  // TypeScript config
  typescript: {
    // Exclude test config files from type checking during build
    ignoreBuildErrors: false,
  },
  // Stub optional peer deps from @standard-community/standard-json
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      effect: false,
      sury: false,
      "@valibot/to-json-schema": false,
    };
    
    // Fix for face-api.js and other packages that try to use Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        encoding: false,
      };
    }
    
    // Exclude test config files from build
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /vitest\.config\.ts$/,
      use: 'null-loader',
    });
    
    return config;
  },
};

export default nextConfig;
