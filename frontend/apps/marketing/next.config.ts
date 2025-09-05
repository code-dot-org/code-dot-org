import type {NextConfig} from 'next';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.cookielaw.org https://global.localizecdn.com https://*.googletagmanager.com https://www.youtube.com https://doublethedonation.com;
    style-src 'self' 'unsafe-inline' https://dsco.code.org https://doublethedonation.com;
    img-src 'self' blob: data: https://contentful-images.code.org https://global.localizecdn.com https://cdn.cookielaw.org https://*.google-analytics.com https://*.googletagmanager.com https://i.ytimg.com https://doublethedonation.com;
    font-src 'self' data: https://dsco.code.org;
    connect-src 'self' http://localhost-studio.code.org:3000 https://*.code.org https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://global.localizecdn.com https://cdn.cookielaw.org https://*.onetrust.com *.nr-data.net https://doublethedonation.com https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com;
    media-src 'self' https://contentful-videos.code.org;
    frame-src 'self' https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    worker-src blob:;
    child-src blob:;
    frame-ancestors https://donate.code.org;
    upgrade-insecure-requests;
`;

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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
