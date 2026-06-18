import {type Page} from '@playwright/test';

/** Cookie name defined in Rack::CookieDCDO::KEY. */
const DCDO_COOKIE_NAME = 'DCDO';

/**
 * Set a DCDO override cookie so Rails reads a specific dynamic-config key as
 * the given value. Mirrors dashboard_helpers.rb mock_dcdo.
 *
 * The page must already be on the target host so the cookie domain is valid.
 * The cookie is set on the top-level domain (e.g. .code.org) so all
 * subdomains see it, matching the Rack middleware's expected scope.
 */
export async function mockDcdoKey(
  page: Page,
  key: string,
  value: string,
): Promise<void> {
  const url = new URL(page.url());
  // Extract top-level domain: "test-studio.code.org" → ".code.org"
  const parts = url.hostname.split('.');
  const topLevelDomain = '.' + parts.slice(-2).join('.');

  // Read any existing DCDO overrides and merge the new key in.
  const existing = await page.context().cookies();
  const dcdoCookie = existing.find(c => c.name === DCDO_COOKIE_NAME);
  const current: Record<string, string> = dcdoCookie
    ? (JSON.parse(dcdoCookie.value) as Record<string, string>)
    : {};

  await page.context().addCookies([
    {
      name: DCDO_COOKIE_NAME,
      value: JSON.stringify({...current, [key]: value}),
      domain: topLevelDomain,
      path: '/',
    },
  ]);
}
