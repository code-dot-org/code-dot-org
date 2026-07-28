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

/**
 * Wait for embedded read-only Blockly workspaces in markdown instructions
 * (see convertXmlToBlockly() in apps/src/templates/instructions/utils.js) to
 * render and settle. Their creation is gated on a real
 * GET /user_preference/theme round-trip and is never awaited by its caller,
 * so a container can sit at 0x0 well past document.fonts.ready; FieldImage
 * blocks inside (e.g. K1 harvester blocks) can also resize once their icon
 * loads. No-op if the level's instructions have no embedded blocks.
 */
export async function waitForEmbeddedBlocklyStable(page: Page): Promise<void> {
  const containers = page.locator('.readonly-block-space-container');
  const count = await containers.count();
  for (let i = 0; i < count; i++) {
    const container = containers.nth(i);
    await expect(async () => {
      const box = await container.boundingBox();
      expect(
        box?.width,
        'embedded Blockly workspace has not rendered yet',
      ).toBeGreaterThan(0);
    }).toPass({intervals: [120], timeout: 15_000});
    await waitUntilStable(container);
  }
}
