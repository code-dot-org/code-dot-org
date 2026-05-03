import {expect, test} from '@playwright/test';

import {Pixelation} from './Pixelation';

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

test.describe('Pixelation — level 4 (encoding controls hidden, sliders visible)', () => {
  test('encoding controls are hidden; sliders are visible and editable', async ({
    page,
  }) => {
    const pix = new Pixelation(page);
    await pix.gotoLevel(4);

    await expect(pix.binRadio).toBeHidden();
    await expect(pix.hexRadio).toBeHidden();
    await expect(pix.widthRange).toBeVisible();
    await expect(pix.heightRange).toBeVisible();
    await expect(pix.widthInput).not.toHaveAttribute('readonly');
    await expect(pix.heightInput).not.toHaveAttribute('readonly');
  });
});

test.describe('Pixelation — level 5 (sliders hidden, encoding controls visible)', () => {
  test('sliders are hidden; encoding controls are visible; dimensions are read-only', async ({
    page,
  }) => {
    const pix = new Pixelation(page);
    await pix.gotoLevel(5);

    await expect(pix.binRadio).toBeVisible();
    await expect(pix.hexRadio).toBeVisible();
    await expect(pix.widthRange).toBeHidden();
    await expect(pix.heightRange).toBeHidden();
    await expect(pix.widthInput).toHaveAttribute('readonly', '');
    await expect(pix.heightInput).toHaveAttribute('readonly', '');
  });
});
