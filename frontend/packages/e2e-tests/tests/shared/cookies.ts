import type {Page} from '@playwright/test';

/**
 * Derive the registrable domain (last two labels) from a hostname so a cookie
 * is shared across subdomains — e.g. "test-studio.code.org" and
 * "studio.code.org" both scope to ".code.org". Does not handle multi-label
 * public suffixes (ccTLDs like ".co.uk"), which the target hosts don't use.
 */
export function cookieDomain(hostname: string): string {
  const parts = hostname.split('.');
  const registrable = parts.slice(-2).join('.');
  return `.${registrable}`;
}

/**
 * Set an arbitrary cookie on the browser context, scoped to the registrable
 * domain of the current page. Must be called after a page.goto so the host —
 * and therefore the cookie domain — is known.
 */
export async function setCookie(
  page: Page,
  name: string,
  value: string,
): Promise<void> {
  await page.context().addCookies([
    {
      name,
      value,
      domain: cookieDomain(new URL(page.url()).hostname),
      path: '/',
    },
  ]);
}
