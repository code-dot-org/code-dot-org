import {expect, type Page} from '@playwright/test';

/**
 * Waits for dashboard course-level header chrome to finish rendering.
 *
 * Cucumber's shared lab readiness waited for `#runButton`, `.header_user`, and
 * then closed instructions. Visual ports also need the level header and progress
 * bubbles because React can populate them after the lab controls are usable.
 *
 * @param page - Playwright page on a dashboard level
 */
export async function expectCodeStudioHeaderReady(page: Page): Promise<void> {
  await expect(page.locator('.header_user').first()).toBeVisible({
    timeout: 30_000,
  });

  const header = page.locator('.header_level').first();
  await expect(header).toBeVisible({timeout: 30_000});

  const headerMiddle = page.locator('#header_middle_content');
  await expect(headerMiddle).toBeVisible({timeout: 30_000});
  await expect(headerMiddle).toHaveCSS('opacity', '1', {timeout: 30_000});

  const progressContainer = page.locator('#lesson_progress_container').first();
  await expect(progressContainer).toBeVisible({timeout: 30_000});
  await expect(
    page.locator('.header_level .progress-bubble').first(),
  ).toBeVisible({timeout: 30_000});

  await waitForStableVisualLayout(page, [
    '.header_level',
    '#header_middle_content',
    '#lesson_progress_container',
  ]);
}

/**
 * Waits for visible layout and text to hold steady across animation frames.
 *
 * This is a visual readiness signal: the user-visible boxes and text have
 * stopped changing. It deliberately does not wait on a fixed delay or on
 * network internals.
 *
 * @param page - Playwright page under test
 * @param selectors - visible regions that must be stable
 */
export async function waitForStableVisualLayout(
  page: Page,
  selectors: string[],
): Promise<void> {
  await page.waitForFunction(
    stableSelectors =>
      new Promise<boolean>(resolve => {
        let previous = '';
        let stableFrames = 0;
        const signature = () =>
          stableSelectors
            .flatMap(selector =>
              Array.from(document.querySelectorAll(selector)),
            )
            .map(element => {
              const box = element.getBoundingClientRect();
              return [
                Math.round(box.x),
                Math.round(box.y),
                Math.round(box.width),
                Math.round(box.height),
                Math.round(element.scrollHeight),
                element.className,
                element.textContent?.trim(),
              ].join(':');
            })
            .join('|');

        const check = () => {
          const current = signature();
          stableFrames = current === previous ? stableFrames + 1 : 0;
          previous = current;
          if (stableFrames >= 15) {
            resolve(true);
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      }),
    selectors,
    {timeout: 30_000},
  );
}
