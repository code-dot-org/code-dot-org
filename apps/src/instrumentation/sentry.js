import {CodeStudioConfig, getDashboardApiUrl} from '@code-dot-org/core';
import * as Sentry from '@sentry/react';

function getAllowedTracingUrls() {
  const environment = CodeStudioConfig.environment;

  switch (environment) {
    case 'adhoc':
      return /^https:\/\/.*\.cdn-code\.org/;
    default:
      return getDashboardApiUrl(environment);
  }
}

Sentry.init({
  dsn: 'https://5ce549366bdb764b2f05dd2e7f603f7f@o4510795595317248.ingest.us.sentry.io/4510874249920512',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: false,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [getAllowedTracingUrls()],
});
