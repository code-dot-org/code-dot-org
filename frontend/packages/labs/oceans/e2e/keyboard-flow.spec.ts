import {type Locator, expect, test} from 'playwright/test';

import {FishShortPage} from './poms/FishShortPage';
import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/**
 * Focus `locator`, assert focus landed, then activate with Enter.
 *
 * Dispatches at the page level after focus — the same path AT (screen
 * readers, switch access) takes, and avoids locator.press()'s second
 * stability check after focus that delays the key event.
 */
async function pressEnter(locator: Locator): Promise<void> {
  await locator.focus();
  await expect(locator).toBeFocused();
  await locator.page().keyboard.press('Enter');
}

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Training scene keyboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — Training scene keyboard', () => {
  test('classifies via keyboard and advances to Predict', async ({page}) => {
    const p = await FishVTrashPage.load(page);

    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    await pressEnter(p.trainingContinueButton);
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

    await pressEnter(p.runButton);
    await p.waitForPredictComplete(60_000);

    await pressEnter(p.predictContinueButton);
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
    await pressEnter(firstWord);

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

    await pressEnter(p.trainingContinueButton);
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

    await pressEnter(p.runButton);
    await p.waitForPredictComplete(60_000);

    await pressEnter(p.predictContinueButton);
    await p.waitForPondScene();
    await p.infoButton.waitFor({state: 'visible'});
    await expect(p.infoButton).toHaveAttribute(
      'aria-pressed',
      /^(true|false)$/,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Training scene — Tab order
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Training scene — Tab order', () => {
  test('Tab cycles Not Fish → Fish → Continue → Erase', async ({page}) => {
    const p = await FishVTrashPage.load(page);
    await p.noButton.focus();
    await page.keyboard.press('Tab');
    await expect(p.yesButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(p.trainingContinueButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(p.eraseButton).toBeFocused();
  });

  test('Shift+Tab from Fish goes to Not Fish', async ({page}) => {
    const p = await FishVTrashPage.load(page);
    await p.yesButton.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(p.noButton).toBeFocused();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Erase confirmation dialog — keyboard interactions
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Erase confirmation dialog — keyboard', () => {
  test('opens via keyboard and cancels via keyboard', async ({page}) => {
    const p = await FishVTrashPage.load(page);
    await p.classifyOne(true);
    await expect(p.trainCount).toHaveText('1');

    await pressEnter(p.eraseButton);
    await expect(p.confirmationDialog).toBeVisible();
    await expect(p.confirmationHeader).toBeVisible();

    await pressEnter(p.confirmationCancelButton);
    await expect(p.trainCount).toHaveText('1');
    await expect(p.confirmationDialog).not.toBeVisible();
  });

  test('opens via keyboard and confirms erase via keyboard', async ({page}) => {
    const p = await FishVTrashPage.load(page);
    await p.classifyOne(true);
    await expect(p.trainCount).toHaveText('1');

    await pressEnter(p.eraseButton);
    await expect(p.confirmationDialog).toBeVisible();

    await pressEnter(p.confirmationEraseButton);
    await expect(p.trainCount).toHaveText('0');
    await expect(p.confirmationDialog).not.toBeVisible();
  });
});
