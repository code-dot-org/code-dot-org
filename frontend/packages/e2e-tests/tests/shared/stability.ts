import {expect, type Locator} from '@playwright/test';

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
