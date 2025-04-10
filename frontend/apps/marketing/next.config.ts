import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@statsig/statsig-node-core'],
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default nextConfig;
