import {type Page} from '@playwright/test';

/**
 * Set a standard landscape viewport. The Cucumber equivalent ("I rotate to
 * landscape") was a no-op outside BrowserStack (guarded by BS_ROTATABLE).
 * In Playwright we use a consistent 1280x800 landscape size.
 */
export async function rotateLandscape(page: Page): Promise<void> {
  await page.setViewportSize({width: 1280, height: 800});
}
