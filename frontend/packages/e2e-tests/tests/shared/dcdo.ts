import type {Page} from '@playwright/test';

/** Cookie name used by Rack::CookieDCDO middleware. */
const DCDO_COOKIE_NAME = 'DCDO';

/**
 * Derive the top-level registrable domain from a URL hostname so the DCDO
 * cookie is scoped to ".code.org" (accessible on both studio.code.org and
 * code.org), matching the Ruby mock_dcdo helper in dashboard_helpers.rb.
 *
 * Handles simple two-part domains (e.g. "code.org") and three-part hostnames
 * (e.g. "test-studio.code.org", "studio.code.org") but not ccTLDs — sufficient
 * for Code.org's domain set.
 */
function cookieDomain(hostname: string): string {
  const parts = hostname.split('.');
  // Take the last two labels as the registrable domain.
  const registrable = parts.slice(-2).join('.');
  return `.${registrable}`;
}

/**
 * Mock a single DCDO key by writing (or updating) the DCDO cookie.
 *
 * Must be called AFTER at least one page.goto so the browser context has a
 * URL from which to derive the cookie domain, matching the Ruby helper's note:
 * "Navigating to the tested page before mocking DCDO is necessary."
 *
 * @param page - Playwright page
 * @param key  - DCDO feature-flag key
 * @param value - Any JSON-serialisable value; strings are stored as-is
 */
export async function mockDcdo(
  page: Page,
  key: string,
  value: unknown,
): Promise<void> {
  const context = page.context();
  const hostname = new URL(page.url()).hostname;
  const domain = cookieDomain(hostname);

  // Read existing DCDO cookie value (may be absent on first call).
  const existing = await context.cookies();
  const dcdoCookie = existing.find(c => c.name === DCDO_COOKIE_NAME);
  let dcdoValue: Record<string, unknown> = {};
  if (dcdoCookie?.value) {
    try {
      dcdoValue = JSON.parse(dcdoCookie.value) as Record<string, unknown>;
    } catch {
      // Corrupt cookie — start fresh.
    }
  }

  dcdoValue[key] = value;

  await context.addCookies([
    {
      name: DCDO_COOKIE_NAME,
      value: JSON.stringify(dcdoValue),
      path: '/',
      domain,
    },
  ]);
}

/**
 * Remove the DCDO cookie from the browser context.
 * No-op if the cookie is absent (mirrors Cucumber's conditional delete).
 */
export async function clearDcdoCookie(page: Page): Promise<void> {
  await page.context().clearCookies({name: DCDO_COOKIE_NAME});
}
