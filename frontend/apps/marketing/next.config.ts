import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@statsig/statsig-node-core',
    '@opentelemetry/auto-instrumentations-node',
    'pino',
  ],
  cacheHandler:
    process.env.NODE_ENV === 'production'
      ? require.resolve('./cache-handler.mjs')
      : undefined,
};

export default nextConfig;
