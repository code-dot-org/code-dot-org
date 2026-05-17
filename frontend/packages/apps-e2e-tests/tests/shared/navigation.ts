import {expect, type Page} from '@playwright/test';

/**
 * Clears the dashboard session without waiting for incidental assets. The
 * reset endpoint renders a plain OK response; that visible text is the user
 * observable readiness signal that the session reset completed.
 *
 * @param page - Playwright page whose browser context should be reset
 */
export async function resetSession(page: Page): Promise<void> {
  await page.goto('/reset_session', {waitUntil: 'commit'});
  await expect(page.getByText('OK', {exact: true})).toBeVisible({
    timeout: 30_000,
  });
}
