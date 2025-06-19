import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default nextConfig;
