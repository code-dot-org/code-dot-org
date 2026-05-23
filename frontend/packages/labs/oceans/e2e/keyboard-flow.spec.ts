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
// FishVTrash — keyboard-only scene completion
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — keyboard-only flow', () => {
  test('completes Training → Predict → Pond using only keyboard', async ({
    page,
  }) => {
    test.setTimeout(120_000); // 4-scene flow; prediction animation ~30 s on CI
    const p = await FishVTrashPage.load(page);

    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    await pressEnter(p.trainingContinueButton);
    await p.waitForPredictScene();

    await pressEnter(p.runButton);
    await p.waitForPredictComplete();

    await pressEnter(p.predictContinueButton);
    await p.waitForPondScene();
    await p.trainMoreButton.waitFor({state: 'visible'});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — keyboard-only scene completion (includes word selection)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — keyboard-only flow', () => {
  test('completes Words → Training → Predict → Pond using only keyboard', async ({
    page,
  }) => {
    test.setTimeout(120_000); // 5-scene flow; prediction animation ~30 s on CI
    // goto() directly — FishShortPage.load() auto-clicks the word, bypassing
    // the keyboard-selection path this test exists to exercise.
    const base = new OceansPage(page);
    await base.goto(AppMode.FishShort);
    await base.waitForWordsScene();

    // Words are randomised; capture the text to key the yes/no locators.
    const firstWord = base.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await pressEnter(firstWord);

    const p = new FishShortPage(page, wordText);
    await p.waitForTrainingScene();

    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    await pressEnter(p.trainingContinueButton);
    await p.waitForPredictScene();

    await pressEnter(p.runButton);
    await p.waitForPredictComplete();

    await pressEnter(p.predictContinueButton);
    await p.waitForPondScene();
    await p.infoButton.waitFor({state: 'visible'});
    await expect(p.infoButton).toHaveAttribute('aria-pressed');
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
