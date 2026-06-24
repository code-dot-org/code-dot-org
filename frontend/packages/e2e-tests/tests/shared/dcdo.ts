import type {Page} from '@playwright/test';

/** Cookie name used by Rack::CookieDCDO middleware. */
const DCDO_COOKIE_NAME = 'DCDO';

/** Any JSON-serialisable value — what a DCDO key may hold. */
export type DcdoJsonValue =
  | string
  | number
  | boolean
  | null
  | DcdoJsonValue[]
  | {[key: string]: DcdoJsonValue};

/**
 * Derive the registrable domain (last two labels) from a hostname so the DCDO
 * cookie is shared across subdomains — e.g. "test-studio.code.org" and
 * "studio.code.org" both scope to ".code.org". Does not handle multi-label
 * public suffixes (ccTLDs like ".co.uk"), which the target hosts don't use.
 */
export function cookieDomain(hostname: string): string {
  const parts = hostname.split('.');
  // Take the last two labels as the registrable domain.
  const registrable = parts.slice(-2).join('.');
  return `.${registrable}`;
}

/** Parse the DCDO cookie into a key→value map; {} if absent, empty, or invalid. */
function parseDcdoCookie(
  raw: string | undefined,
): Record<string, DcdoJsonValue> {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, DcdoJsonValue>;
    }
  } catch {
    // unparseable — fall through to warn and reset
  }
  console.warn(
    `Ignoring invalid DCDO cookie ${JSON.stringify(raw)}, starting fresh`,
  );
  return {};
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
  value: DcdoJsonValue,
): Promise<void> {
  const context = page.context();
  const cookie = (await context.cookies()).find(
    c => c.name === DCDO_COOKIE_NAME,
  );
  const dcdoValue = parseDcdoCookie(cookie?.value);
  dcdoValue[key] = value;

  await context.addCookies([
    {
      name: DCDO_COOKIE_NAME,
      value: JSON.stringify(dcdoValue),
      path: '/',
      domain: cookieDomain(new URL(page.url()).hostname),
    },
  ]);
}

/** Remove the DCDO cookie from the browser context. No-op if absent. */
export async function clearDcdoCookie(page: Page): Promise<void> {
  await page.context().clearCookies({name: DCDO_COOKIE_NAME});
}
