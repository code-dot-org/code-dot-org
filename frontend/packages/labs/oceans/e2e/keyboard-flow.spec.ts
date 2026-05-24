import {expect, test} from 'playwright/test';

import {FishShortPage} from './poms/FishShortPage';
import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Training scene keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — Training scene keyboard', () => {
  test('classifies via keyboard and advances to Predict', async ({page}) => {
    const p = await FishVTrashPage.load(page);

    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    await p.pressEnter(p.trainingContinueButton);
    await p.waitForPredictScene();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Predict scene keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — Predict scene keyboard', () => {
  test('runs prediction via keyboard and advances to Pond', async ({page}) => {
    // TF.js inference is slow in Firefox/WebKit on CI; 120 s covers it.
    test.setTimeout(120_000);

    const p = await FishVTrashPage.load(page);
    await p.train(1, 1);
    await p.advanceToPredictScene();

    await p.pressEnter(p.runButton);
    await p.waitForPredictComplete(60_000);

    await p.pressEnter(p.predictContinueButton);
    await p.waitForPondScene();
    await p.trainMoreButton.waitFor({state: 'visible'});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Words scene keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — Words scene keyboard', () => {
  test('selects word via keyboard and advances to Training', async ({page}) => {
    const base = new OceansPage(page);
    await base.goto(AppMode.FishShort);
    await base.waitForWordsScene();

    // Words are randomised; capture the text to key the yes/no locators.
    const firstWord = base.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await base.pressEnter(firstWord);

    const p = new FishShortPage(page, wordText);
    await p.waitForTrainingScene();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Training scene keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — Training scene keyboard', () => {
  test('classifies via keyboard and advances to Predict', async ({page}) => {
    const base = new OceansPage(page);
    await base.goto(AppMode.FishShort);
    await base.waitForWordsScene();

    // Click to select word — word selection is covered by the Words keyboard test.
    const firstWord = base.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await firstWord.click();

    const p = new FishShortPage(page, wordText);
    await p.waitForTrainingScene();

    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    await p.pressEnter(p.trainingContinueButton);
    await p.waitForPredictScene();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Predict scene keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — Predict scene keyboard', () => {
  test('runs prediction via keyboard and advances to Pond', async ({page}) => {
    // TF.js inference is slow in Firefox/WebKit on CI; 120 s covers it.
    test.setTimeout(120_000);

    const base = new OceansPage(page);
    await base.goto(AppMode.FishShort);
    await base.waitForWordsScene();

    // Clicks for scene navigation — keyboard is tested from Predict onwards.
    const firstWord = base.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await firstWord.click();

    const p = new FishShortPage(page, wordText);
    await p.waitForTrainingScene();
    await p.train(1, 1);
    await p.advanceToPredictScene();

    await p.pressEnter(p.runButton);
    await p.waitForPredictComplete(60_000);

    await p.pressEnter(p.predictContinueButton);
    await p.waitForPondScene();
    await p.infoButton.waitFor({state: 'visible'});
    await expect(p.infoButton).toHaveAttribute(
      'aria-pressed',
      /^(true|false)$/,
    );
  });
});
