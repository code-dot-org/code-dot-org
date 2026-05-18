import {type Page} from '@playwright/test';

/** Cookie name used by Rack::GeolocationOverride middleware. */
const GEOLOCATION_COOKIE = 'GeolocationOverride';

/**
 * Merges a key→value pair into the browser DCDO cookie.
 *
 * Mirrors the `mock_dcdo` Ruby helper in dashboard_helpers.rb: reads the
 * existing DCDO cookie, sets the given key, and writes it back.  The page
 * must already have an active navigation so a cookie domain can be derived.
 *
 * @param page - Playwright page with an established navigation
 * @param key - DCDO key to set
 * @param value - JSON-serialisable value to assign
 */
export async function mockDcdo(
  page: Page,
  key: string,
  value: unknown,
): Promise<void> {
  const all = await page.context().cookies();
  const existing = all.find(c => c.name === 'DCDO');
  const merged: Record<string, unknown> = existing
    ? (JSON.parse(existing.value) as Record<string, unknown>)
    : {};
  merged[key] = value;
  const {hostname} = new URL(page.url());
  await page.context().addCookies([
    {
      name: 'DCDO',
      value: JSON.stringify(merged),
      domain: hostname,
      path: '/',
    },
  ]);
}

/**
 * Sets the GeolocationOverride cookie so the server-side geolocation
 * middleware treats the session as coming from the given IP address.
 * Mirrors `I use a cookie to mock my IP address as "..."` in
 * geolocation_steps.rb.
 *
 * @param page - Playwright page with an established navigation
 * @param ip - IPv4 address to spoof (e.g. '150.214.39.255' for Spain/Europe)
 */
export async function mockGeolocation(page: Page, ip: string): Promise<void> {
  const {hostname} = new URL(page.url());
  await page.context().addCookies([
    {
      name: GEOLOCATION_COOKIE,
      value: ip,
      domain: hostname,
      path: '/',
    },
  ]);
}
