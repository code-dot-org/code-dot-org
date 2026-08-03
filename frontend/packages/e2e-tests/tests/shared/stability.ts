import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Await web fonts then a post-layout paint. An unsettled axe scan reports
 * transient color-contrast (dequelabs/axe-core#1866).
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

/**
 * Resolve once the locator's box stops moving. Playwright's built-in 2-frame
 * stability is too brief to outlast a longer scroll/reflow that splits clicks.
 */
export async function waitUntilStable(locator: Locator): Promise<void> {
  let previous = '';
  await expect(async () => {
    const box = await locator.boundingBox();
    // Whole box at integer pixels: a resizing element moves its click center,
    // and sub-pixel jitter on a settled element must not count as motion.
    const current = box
      ? `${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.width)},${Math.round(box.height)}`
      : '';
    const settled = current !== '' && current === previous;
    previous = current;
    expect(settled, 'element still moving or not laid out').toBe(true);
  }).toPass({intervals: [120], timeout: 5_000});
}

/** Settle fonts and paint, then optionally await layout stability on a locator. */
export async function waitForVisualStability(
  page: Page,
  locator?: Locator,
): Promise<void> {
  await settle(page);
  if (locator) {
    await waitUntilStable(locator);
  }
}
