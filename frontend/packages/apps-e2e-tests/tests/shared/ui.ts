import {type Page} from '@playwright/test';

/**
 * Dismiss the sign-in reminder banner if it is present.
 * Mirrors `I dismiss the login reminder` from steps.rb:
 *   click [aria-label='Close'] if present → wait for .uitest-signincallout to disappear.
 *
 * @param page - Playwright page
 */
export async function dismissLoginReminder(page: Page): Promise<void> {
  const closeBtn = page.locator('.uitest-signincallout [aria-label="Close"]');
  if (await closeBtn.isVisible()) await closeBtn.click();
  await page
    .locator('.uitest-signincallout')
    .waitFor({state: 'detached'})
    .catch(() => {
      // Not present — nothing to dismiss.
    });
}

/**
 * Collapse the teacher panel by clicking its hide-handle chevron.
 * Mirrors `I dismiss the teacher panel` from steps.rb:
 *   click .teacher-panel > .hide-handle > .fa-chevron-right →
 *   wait for .teacher-panel > .show-handle > .fa-chevron-left.
 *
 * The hide-handle element is zero-dimension and position:fixed, so a raw JS
 * click is used to bypass Playwright's actionability checks.
 *
 * @param page - Playwright page with teacher panel visible
 */
export async function dismissTeacherPanel(page: Page): Promise<void> {
  await page
    .locator('.teacher-panel > .hide-handle > .fa-chevron-right')
    .evaluate((el: HTMLElement) => el.click());
  await page
    .locator('.teacher-panel > .show-handle > .fa-chevron-left')
    .waitFor({state: 'visible'});
}
