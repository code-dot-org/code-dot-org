import type {Page} from '@playwright/test';

/**
 * Await web fonts then a post-layout paint. An unsettled axe scan or
 * screenshot reports transient color-contrast/layout noise
 * (dequelabs/axe-core#1866) since the dev shell loads `@code-dot-org/fonts`.
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
