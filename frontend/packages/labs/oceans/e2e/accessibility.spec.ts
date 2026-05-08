import {expect, test} from 'playwright/test';

import {FishVTrashPage} from './FishVTrashPage';

test.describe('Accessibility', () => {
  test('erase button has descriptive aria-label', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    // I18n.t('erase') = "Erase" (capital E per oceans.json)
    await expect(oceans.eraseButton).toHaveAttribute('aria-label', 'Erase');
  });

  test('pond toggle buttons have descriptive aria-labels', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.fullFlow();
    await expect(oceans.toggleMatchingButton).toHaveAttribute(
      'aria-label',
      'Switch to Matching Items',
    );
    await expect(oceans.toggleNonMatchingButton).toHaveAttribute(
      'aria-label',
      'Switch to Non-Matching Items',
    );
  });

  test('yes and no buttons are keyboard-focusable', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    // Programmatic focus (the DemoShell mode-picker sits above the lab in
    // tab order, so Tab alone would hit a radio first).
    await oceans.yesButton.focus();
    await expect(oceans.yesButton).toBeFocused();
    await expect(oceans.yesButton).toHaveAttribute('type', 'button');

    await oceans.noButton.focus();
    await expect(oceans.noButton).toBeFocused();
    await expect(oceans.noButton).toHaveAttribute('type', 'button');
  });

  test('yes button is activatable by keyboard Enter', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.yesButton.focus();
    await page.keyboard.press('Enter');
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('erase button has type=button (no accidental form submit)', async ({
    page,
  }) => {
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.eraseButton).toHaveAttribute('type', 'button');
  });

  test('media control buttons have explicit aria-labels', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();
    await expect(oceans.rewindButton).toHaveAttribute('aria-label', 'Rewind');
    await expect(oceans.fastForwardButton).toHaveAttribute(
      'aria-label',
      'Fast forward',
    );
  });

  test('FontAwesome icons are hidden from screen readers', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    // Verify SVGs inside the training yes/no buttons carry aria-hidden
    const svgCount =
      (await oceans.yesButton.locator('svg').count()) +
      (await oceans.noButton.locator('svg').count());
    const hiddenCount =
      (await oceans.yesButton.locator('svg[aria-hidden]').count()) +
      (await oceans.noButton.locator('svg[aria-hidden]').count());
    expect(hiddenCount).toBe(svgCount);
  });
});
