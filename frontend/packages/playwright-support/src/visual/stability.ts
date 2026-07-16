// This package targets the node lib; the callbacks below run in the browser
// via page.evaluate, so pull in DOM types for document/requestAnimationFrame.
/// <reference lib="dom" />
import type {Page} from 'playwright/test';

/**
 * Await web fonts then a post-layout paint, so a visual checkpoint never
 * captures fallback glyphs mid-swap. Mirrors e2e-tests' `settle`
 * (frontend/packages/e2e-tests/tests/shared/stability.ts).
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
