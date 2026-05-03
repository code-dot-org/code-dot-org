import {expect, test, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Pixelation widget — UI control visibility/editability.
 *
 * Source: dashboard/test/ui/features/star_labs/pixelation.feature
 * Scenarios 5 & 6 (the only non-@as_student scenarios):
 *   Level 4 — encoding controls hidden, dimension sliders visible, editable
 *   Level 5 — encoding controls visible, dimension sliders hidden, read-only
 *
 * The pixelation widget lives at lesson 17 of allthethingscourse.
 */

/** Navigate to a pixelation level, dismiss the instructions dialog, and wait for data. */
async function gotoPixelationLevel(page: Page, level: number): Promise<void> {
  await page.goto('/reset_session');
  await page.goto(labLevelUrl(17, level));
  const closeBtn = page.locator('#x-close');
  await closeBtn.waitFor({state: 'visible'});
  await closeBtn.click();
  await page.locator('.modal-body').waitFor({state: 'hidden'});
  // Mirror "wait until pixelation data loads" — poll until #pixel_data is non-empty.
  await page.waitForFunction(() => {
    const el = document.querySelector('#pixel_data') as HTMLInputElement | null;
    return el !== null && el.value !== '';
  });
}

test.describe('Pixelation — level 4 (encoding controls hidden, sliders visible)', () => {
  test('encoding controls are hidden; sliders are visible and editable', async ({
    page,
  }) => {
    await gotoPixelationLevel(page, 4);

    await expect(
      page.locator('input[name="binHex"][value="bin"]'),
    ).toBeHidden();
    await expect(
      page.locator('input[name="binHex"][value="hex"]'),
    ).toBeHidden();
    await expect(page.locator('#widthRange')).toBeVisible();
    await expect(page.locator('#heightRange')).toBeVisible();
    await expect(page.locator('#width')).not.toHaveAttribute('readonly');
    await expect(page.locator('#height')).not.toHaveAttribute('readonly');
  });
});

test.describe('Pixelation — level 5 (sliders hidden, encoding controls visible)', () => {
  test('sliders are hidden; encoding controls are visible; dimensions are read-only', async ({
    page,
  }) => {
    await gotoPixelationLevel(page, 5);

    await expect(
      page.locator('input[name="binHex"][value="bin"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[name="binHex"][value="hex"]'),
    ).toBeVisible();
    await expect(page.locator('#widthRange')).toBeHidden();
    await expect(page.locator('#heightRange')).toBeHidden();
    await expect(page.locator('#width')).toHaveAttribute('readonly', '');
    await expect(page.locator('#height')).toHaveAttribute('readonly', '');
  });
});
