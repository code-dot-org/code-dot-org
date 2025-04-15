import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@statsig/statsig-node-core'],
};

export default nextConfig;
