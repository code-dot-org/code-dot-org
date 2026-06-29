import type {Page} from '@playwright/test';

import {cookieDomain} from './dcdo';

/** Cookie name used by Rack::GeolocationOverride middleware. */
const GEO_COOKIE_NAME = 'GeolocationOverride';

/** Set the GeolocationOverride cookie to an ISO 3166-1 alpha-2 country code. */
export async function setCountryOverride(
  page: Page,
  {countryCode}: {countryCode: string},
): Promise<void> {
  const domain = cookieDomain(new URL(page.url()).hostname);
  await page
    .context()
    .addCookies([
      {name: GEO_COOKIE_NAME, value: countryCode, path: '/', domain},
    ]);
}
