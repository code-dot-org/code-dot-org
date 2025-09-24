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
  transpilePackages: [
    '@contentful/experiences-sdk-react',
    '@contentful/experiences-components-react',
    '@contentful/experiences-core',
    'lodash-es',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'contentful-images.code.org',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
