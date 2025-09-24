import builder from 'content-security-policy-builder';

import {isDevelopmentStage, Stage} from '@/config/stage';

function getFirstPartyCSPHeaders(stage: Stage) {
  const baseFirstPartyDirectives = {
    dsco: {
      styleSrc: ['https://dsco.code.org'],
      fontSrc: ['https://dsco.code.org'],
    },
    studio: {
      connectSrc: ['https://*.code.org'],
    },
  };

  if (isDevelopmentStage(stage)) {
    baseFirstPartyDirectives.studio.connectSrc.push(
      'https://localhost-studio.code.org:3000',
    );
  }

  return baseFirstPartyDirectives;
}

export const THIRD_PARTY_CSP = {
  // https://developers.google.com/tag-platform/security/guides/csp#google_analytics_4_google_analytics
  googleAnalytics: {
    scriptSrc: ['https://*.googletagmanager.com'],
    imgSrc: [
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
    ],
    connectSrc: [
      'https://*.google-analytics.com',
      'https://analytics.google.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
    ],
  },
  // OneTrust
  oneTrust: {
    scriptSrc: ['https://cdn.cookielaw.org'],
    imgSrc: ['https://cdn.cookielaw.org'],
    connectSrc: ['https://cdn.cookielaw.org', 'https://*.onetrust.com'],
  },
  // LocalizeJS
  localizeJS: {
    scriptSrc: ['https://global.localizecdn.com'],
    imgSrc: ['https://global.localizecdn.com'],
    connectSrc: ['https://global.localizecdn.com'],
  },
  // Statsig
  // https://docs.statsig.com/client/javascript-sdk/#recommended-csp-configuration
  statsig: {
    connectSrc: [
      'api.statsig.com',
      'featuregates.org',
      'statsigapi.net',
      'events.statsigapi.net',
      'api.statsigcdn.com',
      'featureassets.org',
      'assetsconfigcdn.org',
      'prodregistryv2.org',
      'cloudflare-dns.com',
      'beyondwickedmapping.org',
    ],
  },
  // YouTube
  youtube: {
    scriptSrc: ['https://www.youtube.com'],
    imgSrc: ['https://i.ytimg.com'],
  },
  // Double the donation
  doubleTheDonation: {
    scriptSrc: ['https://doublethedonation.com'],
    styleSrc: ['https://doublethedonation.com'],
    imgSrc: ['https://doublethedonation.com'],
    connectSrc: ['https://doublethedonation.com'],
  },
  // Contentful
  contentful: {
    imgSrc: ['https://contentful-images.code.org'],
    mediaSrc: ['https://contentful-videos.code.org'],
  },
  // New Relic
  // https://docs.newrelic.com/docs/browser/new-relic-browser/getting-started/compatibility-requirements-browser-monitoring/
  newrelic: {
    connectSrc: ['*.nr-data.net'],
  },
  // Map Box
  // https://docs.mapbox.com/mapbox-gl-js/guides/browsers/
  mapBox: {
    connectSrc: [
      'https://*.tiles.mapbox.com',
      'https://api.mapbox.com',
      'https://events.mapbox.com',
    ],
  },
};

export function getCSPHeader(stage: Stage) {
  const firstPartyHeaders = getFirstPartyCSPHeaders(stage);
  const thirdPartyHeaders = THIRD_PARTY_CSP;

  // Merge all directives into a single object
  const directives: Record<string, string[]> = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'blob:', 'data:'],
    fontSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'", 'https:'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    workerSrc: ['blob:'],
    childSrc: ['blob:'],
  };

  // Merge first-party directives
  function mergeDirectives(
    target: Record<string, string[]>,
    source: Record<string, string[]>,
  ) {
    for (const [directive, values] of Object.entries(source)) {
      if (!target[directive]) {
        target[directive] = [];
      }
      for (const value of values) {
        if (!target[directive].includes(value)) {
          target[directive].push(value);
        }
      }
    }
  }

  // Merge first-party directives
  Object.values(firstPartyHeaders).forEach(source => {
    mergeDirectives(directives, source);
  });

  // Merge third-party directives
  Object.values(thirdPartyHeaders).forEach(source => {
    mergeDirectives(directives, source);
  });

  // Build the CSP header string
  return builder({directives});
}
