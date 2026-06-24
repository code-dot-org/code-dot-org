import type {Page} from '@playwright/test';

/** Cookie name used by Rack::GeolocationOverride middleware. */
const GEO_COOKIE_NAME = 'GeolocationOverride';

/** Spain — a valid EU IP address. Mirrors geolocation_steps.rb. */
const EU_IP = '150.214.39.255';

/**
 * Set the GeolocationOverride cookie to an EU IP address. Must be called
 * after the page is on the target host so the cookie domain is correct.
 * Mirrors "I am in Europe" in geolocation_steps.rb.
 */
export async function setEuropeanIp(page: Page): Promise<void> {
  const url = new URL(page.url());
  const domain = url.hostname;
  await page
    .context()
    .addCookies([{name: GEO_COOKIE_NAME, value: EU_IP, path: '/', domain}]);
}
