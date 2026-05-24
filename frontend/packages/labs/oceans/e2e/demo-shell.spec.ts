import {expect, test} from 'playwright/test';

import {OceansPage} from './poms/OceansPage';

test.describe('DemoShell mode picker', () => {
  test('switching to Fish Short mode shows words scene', async ({page}) => {
    await page.goto('/?guide=off');
    const oceans = new OceansPage(page);
    // Let FishVTrash finish loading before switching; otherwise initAll races.
    await oceans.waitForTrainingScene();
    await page.getByRole('radio', {name: 'Fish Short'}).click();
    await oceans.waitForWordsScene();
    await expect(oceans.wordButtons.first()).toBeVisible();
  });

  test('switching to Creatures Demo mode shows predict scene', async ({
    page,
  }) => {
    // Start from FishShort (no mobilenet); switching from FishVTrash holds
    // two mobilenet sessions and OOMs WebKit.
    await page.goto('/?mode=short&guide=off');
    const oceans = new OceansPage(page);
    await oceans.waitForWordsScene();
    await page.getByRole('radio', {name: 'Creatures Demo'}).click();
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
  });
});
