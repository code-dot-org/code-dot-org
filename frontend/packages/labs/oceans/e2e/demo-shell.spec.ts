import {expect, test} from 'playwright/test';

import {OceansPage} from './poms/OceansPage';

test.describe('DemoShell mode picker', () => {
  test('renders all five modes', async ({page}) => {
    await page.goto('/?guide=off');
    const labels = [
      'Fish vs Trash',
      'Fish Short',
      'Fish Long',
      'Creatures vs Trash',
      'Creatures Demo',
    ];
    for (const label of labels) {
      await expect(page.getByRole('radio', {name: label})).toBeVisible();
    }
  });

  test('FishVTrash is selected by default', async ({page}) => {
    await page.goto('/?guide=off');
    await expect(
      page.getByRole('radio', {name: 'Fish vs Trash'}),
    ).toBeChecked();
  });

  test('URL param ?mode=short selects Fish Short radio', async ({page}) => {
    await page.goto('/?guide=off&mode=short');
    await expect(page.getByRole('radio', {name: 'Fish Short'})).toBeChecked();
  });

  test('switching to Fish Short mode shows words scene', async ({page}) => {
    await page.goto('/?guide=off');
    await page.getByRole('radio', {name: 'Fish Short'}).click();
    const oceans = new OceansPage(page);
    await oceans.waitForWordsScene();
    await expect(oceans.wordButtons.first()).toBeVisible();
  });

  test('switching to Creatures Demo mode shows predict scene', async ({
    page,
  }) => {
    await page.goto('/?guide=off');
    const oceans = new OceansPage(page);
    // Wait for FishVTrash to fully initialize before switching — ensures the
    // TFJS model load completes so the mode switch triggers a single initAll.
    await oceans.waitForTrainingScene();
    await page.getByRole('radio', {name: 'Creatures Demo'}).click();
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
  });
});
