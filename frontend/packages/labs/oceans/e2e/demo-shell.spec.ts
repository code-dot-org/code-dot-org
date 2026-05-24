import {expect, test} from 'playwright/test';

import {OceansPage} from './poms/OceansPage';

test.describe('DemoShell mode picker', () => {
  test('switching to Fish Short mode shows words scene', async ({page}) => {
    await page.goto('/?guide=off');
    const oceans = new OceansPage(page);
    // Wait for the default FishVTrash mode to finish its TFJS model load before
    // switching.  Clicking the radio mid-initialization races with initAll: the
    // new mode's component mounts while the previous model load is still in
    // flight, which can delay the word-button render well past 30 s on a loaded
    // CI worker.  The Erase button is the established sentinel that FishVTrash
    // is fully ready — same guard the Creatures Demo test uses.
    await oceans.waitForTrainingScene();
    await page.getByRole('radio', {name: 'Fish Short'}).click();
    await oceans.waitForWordsScene();
    // waitForWordsScene already waited for the first word button; the explicit
    // toBeVisible confirms it remained attached after the mode switch settled.
    await expect(oceans.wordButtons.first()).toBeVisible();
  });

  test('switching to Creatures Demo mode shows predict scene', async ({
    page,
  }) => {
    // Start from FishShort, which does not load the mobilenet TFJS model.
    // FishVTrash DOES load mobilenet, so switching from it to CreaturesVTrashDemo
    // (which also needs mobilenet) causes WebKit to hold two TFJS sessions in
    // memory simultaneously — enough memory pressure to crash the renderer.
    // Starting from FishShort means only one mobilenet load ever occurs.
    await page.goto('/?mode=short&guide=off');
    const oceans = new OceansPage(page);
    // Wait for FishShort's Words scene — confirms the SVM model and fish images
    // are fully loaded before we trigger the mode switch.
    await oceans.waitForWordsScene();
    await page.getByRole('radio', {name: 'Creatures Demo'}).click();
    // waitForPredictScene waits for the Run button, which only appears after
    // CreaturesVTrashDemo's mobilenet and image assets finish loading.
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
  });
});
