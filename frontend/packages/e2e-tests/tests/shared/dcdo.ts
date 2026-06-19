import type {Page} from '@playwright/test';

/** Cookie name used by Rack::CookieDCDO middleware. */
const DCDO_COOKIE_NAME = 'DCDO';

/**
 * Derive the registrable domain (last two labels) from a hostname so the DCDO
 * cookie is shared across subdomains — e.g. "test-studio.code.org" and
 * "studio.code.org" both scope to ".code.org". Does not handle multi-label
 * public suffixes (ccTLDs like ".co.uk"), which the target hosts don't use.
 */
function cookieDomain(hostname: string): string {
  const parts = hostname.split('.');
  // Take the last two labels as the registrable domain.
  const registrable = parts.slice(-2).join('.');
  return `.${registrable}`;
}

/**
 * Mock a single DCDO key by writing (or updating) the DCDO cookie. Must be
 * called AFTER at least one page.goto: the cookie domain is derived from the
 * current URL, so the page must already be on the target host. Values are
 * stored verbatim as JSON.
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
    } catch (error) {
      console.warn(
        `Ignoring unparseable DCDO cookie ${JSON.stringify(dcdoCookie.value)}, starting fresh: ${String(error)}`,
      );
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

/** Remove the DCDO cookie from the browser context. No-op if absent. */
export async function clearDcdoCookie(page: Page): Promise<void> {
  await page.context().clearCookies({name: DCDO_COOKIE_NAME});
}
