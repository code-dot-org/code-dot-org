import {type Page} from '@playwright/test';

/** Spain IP used by geolocation_steps.rb "I am in Europe". */
const SPAIN_IP = '150.214.39.255';

/** Rack::GeolocationOverride::KEY from the Rails middleware. */
const GEO_OVERRIDE_COOKIE = 'GeolocationOverride';

/**
 * Set the geolocation-override cookie to a Spanish IP so OneTrust treats
 * the session as European. Mirrors geolocation_steps.rb "I am in Europe".
 *
 * The page must already be on the target host (studio.code.org or
 * test-studio.code.org) so the cookie domain is set correctly.
 */
export async function setEuropeanIpCookie(page: Page): Promise<void> {
  const url = new URL(page.url());
  await page.context().addCookies([
    {
      name: GEO_OVERRIDE_COOKIE,
      value: SPAIN_IP,
      domain: url.hostname,
      path: '/',
    },
  ]);
}
