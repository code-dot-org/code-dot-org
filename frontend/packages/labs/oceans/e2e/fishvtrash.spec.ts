import {expect, test} from 'playwright/test';

import {FishVTrashPage, OceansPage} from './OceansPage';

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Training scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — training scene', () => {
  test('loads with training scene and counter at zero', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.trainCount).toHaveText('0');
    await expect(oceans.yesButton).toBeVisible();
    await expect(oceans.noButton).toBeVisible();
    await expect(oceans.eraseButton).toBeVisible();
  });

  test('yes button label is "Fish" in fishvtrash mode', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.yesButton).toContainText('Fish');
  });

  test('no button label is "Not Fish" in fishvtrash mode', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.noButton).toContainText('Not Fish');
  });

  test('yes click increments training count', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.classifyOne(true);
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('no click increments training count', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.classifyOne(false);
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('mixed training updates count correctly', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.classifyOne(true);
    await oceans.classifyOne(false);
    await expect(oceans.trainCount).toHaveText('2');
  });

  test('training question contains "fish"', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.page.getByText(/fish/i).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Erase confirmation dialog
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — erase confirmation dialog', () => {
  test('erase button opens confirmation dialog', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationHeader).toBeVisible();
  });

  test('cancel dismisses dialog without resetting count', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.classifyOne(true);
    await oceans.eraseButton.click();
    await oceans.confirmationCancelButton.click();
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('confirm erase resets training count to zero', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.classifyOne(true);
    await oceans.eraseButton.click();
    await oceans.confirmationEraseButton.click();
    await expect(oceans.trainCount).toHaveText('0');
  });

  test('erase dialog shows warning text', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.page.getByText(/permanently delete/i)).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Predict scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — predict scene', () => {
  test('continue from training shows run button', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await expect(oceans.runButton).toBeVisible();
  });

  test('run reveals media controls', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();
  });

  test('play/pause button starts as Pause after run', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.playPauseButton).toHaveAttribute('aria-label', 'Pause');
  });

  test('play/pause button toggles to Play on click', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await oceans.playPauseButton.click();
    await expect(oceans.playPauseButton).toHaveAttribute('aria-label', 'Play');
  });

  test('continue button appears after prediction runs', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runPrediction();
    await expect(oceans.predictContinueButton).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Pond scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — pond scene', () => {
  test('full flow reaches pond with toggle buttons', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.fullFlow();
    await expect(oceans.toggleMatchingButton).toBeVisible();
    await expect(oceans.toggleNonMatchingButton).toBeVisible();
  });

  test('pond surface has role=button and aria-label', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.fullFlow();
    await expect(oceans.pondSurface).toHaveAttribute('role', 'button');
    await expect(oceans.pondSurface).toHaveAttribute('aria-label', 'Fish pond');
  });

  test('train more button navigates back to training', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.fullFlow();
    await expect(oceans.trainMoreButton).toBeVisible({timeout: 10_000});
    await oceans.trainMoreButton.click();
    await oceans.waitForTrainingScene();
    await expect(oceans.yesButton).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CreaturesVTrashDemo — starts in Predict
// ─────────────────────────────────────────────────────────────────────────────

test.describe('CreaturesVTrashDemo mode', () => {
  test('loads directly in predict scene with run button', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto('creaturesvtrashdemo');
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
    // No training scene — erase button should not be present
    await expect(oceans.eraseButton).not.toBeVisible();
  });
});
