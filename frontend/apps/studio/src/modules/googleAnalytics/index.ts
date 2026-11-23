// Port of the legacy pages' reporter (apps/src/metrics/GoogleAnalyticsReporter.js
// and apps/src/sites/studio/pages/layouts/_google_analytics.js), so Studio
// sends what studio.code.org sends. The Rails shell stamps the measurement id
// and window.userAnalyticsDimensions.

// Synced with apps/src/sites/studio/pages/layouts/_google_analytics.js.
const GOOGLE_TAG_MANAGER_ID = 'GTM-TZZBRK5';

declare global {
  interface Window {
    dataLayer?: unknown[];
    userAnalyticsDimensions?: Record<string, string>;
    trackEvent?: typeof trackEvent;
  }
}

const gtag: (...args: unknown[]) => void = function () {
  // gtag.js ignores plain arrays; it reads the arguments object itself.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer?.push(arguments);
};

function trackEvent(
  categoryValue: string,
  actionName: string,
  parameters?: Record<string, unknown>,
) {
  gtag('event', actionName, {eventCategory: categoryValue, ...parameters});
}

function loadGoogleTagManager() {
  window.dataLayer?.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_MANAGER_ID}`;
  document.head.appendChild(script);
}

export function initializeGoogleAnalytics() {
  const stamp = document.querySelector<HTMLElement>(
    'script[data-googlemeasurement]',
  );
  // Absent wherever Rails does not render the shell, such as the mobile build.
  if (!stamp?.dataset.googlemeasurement) return;
  const {id} = JSON.parse(stamp.dataset.googlemeasurement) as {id: string};

  window.dataLayer = window.dataLayer ?? [];
  gtag('js', new Date());
  gtag('config', id, window.userAnalyticsDimensions);
  window.trackEvent = trackEvent;
  loadGoogleTagManager();
}
