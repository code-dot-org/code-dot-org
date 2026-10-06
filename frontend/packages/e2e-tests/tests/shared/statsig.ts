import {expect, type Page} from '@playwright/test';

/** lib/cdo/shared_constants.rb STATSIG_STABLE_ID_KEY. */
export const STATSIG_STABLE_ID_COOKIE = 'statsig_stable_id';

/** Cdo::AnonUserId::FORMAT: a v4 UUID. */
export const STABLE_ID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Navigate to /api/statsig/stable_id and return the plain-text body: the ID
 * the server has bound to this session. Navigating, rather than fetching, keeps
 * the request identical to a real page load's cookie handling.
 */
export async function fetchStableId(page: Page): Promise<string> {
  const response = await page.goto('/api/statsig/stable_id');
  expect(response?.ok(), 'GET /api/statsig/stable_id').toBe(true);
  return (await page.locator('body').innerText()).trim();
}

/** The statsig_stable_id cookie value, or undefined if unset. */
export async function stableIdCookie(page: Page): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find(c => c.name === STATSIG_STABLE_ID_COOKIE)?.value;
}

/** Remove the statsig_stable_id cookie from the browser context. */
export async function deleteStableIdCookie(page: Page): Promise<void> {
  await page.context().clearCookies({name: STATSIG_STABLE_ID_COOKIE});
}
