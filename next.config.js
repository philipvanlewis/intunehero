/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile CopilotKit packages
  transpilePackages: [
    '@copilotkit/react-core',
    '@copilotkit/react-ui',
    '@copilotkit/runtime',
  ],

  // Webpack config to handle CopilotKit
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Use SWC for faster builds
  swcMinify: true,

  // Ensure proper module resolution
  experimental: {
    optimizePackageImports: ['@copilotkit/react-core', '@copilotkit/react-ui'],
  },
};

module.exports = nextConfig;
