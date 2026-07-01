import {expect, test} from './fixtures/visual';
import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/*
 * FishVTrash — Predict scene
 */

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
    await oceans.runButton.click();
    await oceans.waitForPredictComplete();
  });
});

/*
 * FishVTrash — Pond scene
 */

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

/*
 * CreaturesVTrashDemo — starts in Predict
 */

test.describe('CreaturesVTrashDemo mode', () => {
  test('loads directly in predict scene with run button', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.CreaturesVTrashDemo);
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
    // No training scene — erase button should not be present
    await expect(oceans.eraseButton).not.toBeVisible();
  });
});

/*
 * Visual regression
 */

test.describe('@visual', () => {
  test('FishVTrash initial training scene', async ({page, visualCheck}) => {
    const oceans = await FishVTrashPage.load(page, {freeze: true});
    await expect(oceans.trainCount).toHaveText('0');
    await visualCheck('fishvtrash-initial');
  });

  test('CreaturesVTrashDemo prediction scene', async ({page, visualCheck}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.CreaturesVTrashDemo, {freeze: true});
    await oceans.waitForPredictScene();
    // Mask media controls — their Pause/Play label flips with state.
    await visualCheck('creaturesvtrashdemo-predict', {
      mask: [page.getByRole('group', {name: 'Playback controls'})],
    });
  });
});
