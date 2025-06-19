import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default nextConfig;
