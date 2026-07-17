import type {Page} from 'playwright/test';

/**
 * Await web fonts then a post-layout paint, so a visual checkpoint never
 * captures fallback glyphs mid-swap.
 */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.evaluate(
    () =>
      new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
