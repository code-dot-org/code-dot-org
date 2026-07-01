import {expect, test} from 'playwright/test';

import {FishShortPage} from './poms/FishShortPage';
import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/*
 * FishVTrash — Training scene keyboard
 */

test.describe('FishVTrash — Training scene keyboard', () => {
  test('classifies via keyboard and advances to Predict', async ({page}) => {
    const fishVTrash = await FishVTrashPage.load(page);

    await fishVTrash.classifyOne({answer: 'yes', via: 'key'});
    await fishVTrash.classifyOne({answer: 'no', via: 'key'});
    await expect(fishVTrash.trainCount).toHaveText('2');

    await fishVTrash.pressEnter(fishVTrash.trainingContinueButton);
    await fishVTrash.waitForPredictScene();
  });
});

/*
 * FishVTrash — Predict scene keyboard
 */

test.describe('FishVTrash — Predict scene keyboard', () => {
  test('runs prediction via keyboard and advances to Pond', async ({page}) => {
    // The train → predict → pond chain can run long when the predict
    // scene's RAF loop stalls under 32-worker Firefox CPU contention.
    test.slow();
    const fishVTrash = await FishVTrashPage.load(page);
    await fishVTrash.train({yesCount: 1, noCount: 1});
    await fishVTrash.advanceToPredictScene();

    await fishVTrash.pressEnter(fishVTrash.runButton);
    await fishVTrash.waitForPredictComplete();

    await fishVTrash.pressEnter(fishVTrash.predictContinueButton);
    await fishVTrash.waitForPondScene();
    await fishVTrash.trainMoreButton.waitFor({state: 'visible'});
  });
});

/*
 * FishShort — Words scene keyboard
 */

test.describe('FishShort — Words scene keyboard', () => {
  test('selects word via keyboard and advances to Training', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();

    // Words are randomised; capture the text to key the yes/no locators.
    const firstWord = oceans.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await oceans.pressEnter(firstWord);

    const fishShort = new FishShortPage(page, wordText);
    await fishShort.waitForTrainingScene();
  });
});

/*
 * FishShort — Training scene keyboard
 */

test.describe('FishShort — Training scene keyboard', () => {
  test('classifies via keyboard and advances to Predict', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();

    // Click to select word — word selection is covered by the Words keyboard test.
    const firstWord = oceans.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await firstWord.click();

    const fishShort = new FishShortPage(page, wordText);
    await fishShort.waitForTrainingScene();

    await fishShort.classifyOne({answer: 'yes', via: 'key'});
    await fishShort.classifyOne({answer: 'no', via: 'key'});
    await expect(fishShort.trainCount).toHaveText('2');

    await fishShort.pressEnter(fishShort.trainingContinueButton);
    await fishShort.waitForPredictScene();
  });
});

/*
 * FishShort — Predict scene keyboard
 */

test.describe('FishShort — Predict scene keyboard', () => {
  test('runs prediction via keyboard and advances to Pond', async ({page}) => {
    // The word → train → predict → pond chain can run long when the
    // predict scene's RAF loop stalls under 32-worker Firefox CPU contention.
    test.slow();
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();

    // Clicks for scene navigation — keyboard is tested from Predict onwards.
    const firstWord = oceans.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await firstWord.click();

    const fishShort = new FishShortPage(page, wordText);
    await fishShort.waitForTrainingScene();
    await fishShort.train({yesCount: 1, noCount: 1});
    await fishShort.advanceToPredictScene();

    await fishShort.pressEnter(fishShort.runButton);
    await fishShort.waitForPredictComplete();

    await fishShort.pressEnter(fishShort.predictContinueButton);
    await fishShort.waitForPondScene();
    await fishShort.infoButton.waitFor({state: 'visible'});
    await expect(fishShort.infoButton).toHaveAttribute(
      'aria-pressed',
      /^(true|false)$/,
    );
  });
});
