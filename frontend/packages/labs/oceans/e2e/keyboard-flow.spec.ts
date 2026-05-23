import {type Locator, expect, test} from 'playwright/test';

import {FishShortPage} from './poms/FishShortPage';
import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/**
 * Focus `locator` then activate it with Enter, asserting focus lands first.
 *
 * Verifies the element is reachable by keyboard — the same path a user
 * relying solely on a keyboard (or screen-reader virtual cursor) would take.
 */
async function pressEnter(locator: Locator): Promise<void> {
  await locator.focus();
  await expect(locator).toBeFocused();
  await locator.press('Enter');
}

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — keyboard-only scene completion
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — keyboard-only flow', () => {
  test('completes Training → Predict → Pond using only keyboard', async ({
    page,
  }) => {
    const p = await FishVTrashPage.load(page);

    // Classify two fish via keyboard Enter on the yes/no buttons.
    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    // Continue Training → Predict via keyboard.
    await pressEnter(p.trainingContinueButton);
    await p.waitForPredictScene();

    // Start prediction via keyboard.
    await pressEnter(p.runButton);
    await p.predictContinueButton.waitFor({state: 'visible', timeout: 30_000});

    // Continue Predict → Pond via keyboard.
    await pressEnter(p.predictContinueButton);
    await p.waitForPondScene();

    await expect(p.pondSurface).toBeVisible();
    await expect(p.trainMoreButton).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — keyboard-only scene completion (includes word selection)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — keyboard-only flow', () => {
  test('completes Words → Training → Predict → Pond using only keyboard', async ({
    page,
  }) => {
    // Navigate directly rather than via FishShortPage.load() because load()
    // auto-clicks the word, bypassing the keyboard-selection path we want
    // to exercise.
    const base = new OceansPage(page);
    await base.goto(AppMode.FishShort);
    await base.waitForWordsScene();

    // Select the first word via keyboard.  Words are randomised on each load;
    // capture the text so we can construct the correct yes/no button locators.
    const firstWord = base.wordButtons.first();
    const wordText = (await firstWord.textContent())!.trim();
    await firstWord.focus();
    await expect(firstWord).toBeFocused();
    await firstWord.press('Enter');

    // Reuse FishShortPage for yes/no button locators keyed on the chosen word.
    const p = new FishShortPage(page, wordText);
    await p.waitForTrainingScene();

    // Classify via keyboard.
    await p.classifyOne(true, 'key');
    await p.classifyOne(false, 'key');
    await expect(p.trainCount).toHaveText('2');

    // Continue Training → Predict via keyboard.
    await pressEnter(p.trainingContinueButton);
    await p.waitForPredictScene();

    // Start prediction via keyboard.
    await pressEnter(p.runButton);
    await p.predictContinueButton.waitFor({state: 'visible', timeout: 30_000});

    // Continue Predict → Pond via keyboard.
    await pressEnter(p.predictContinueButton);
    await p.waitForPondScene();

    await expect(p.pondSurface).toBeVisible();
    // Info button is an ARIA toggle — verify it's present and has aria-pressed.
    await expect(p.infoButton).toBeVisible();
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

    // Open dialog via keyboard — dialog has role="dialog" with a heading.
    await pressEnter(p.eraseButton);
    await expect(p.confirmationDialog).toBeVisible();
    await expect(p.confirmationHeader).toBeVisible();

    // Cancel via keyboard — count must be unchanged.
    await pressEnter(p.confirmationCancelButton);
    await expect(p.trainCount).toHaveText('1');
    await expect(p.confirmationDialog).not.toBeVisible();
  });

  test('opens via keyboard and confirms erase via keyboard', async ({page}) => {
    const p = await FishVTrashPage.load(page);
    await p.classifyOne(true);
    await expect(p.trainCount).toHaveText('1');

    // Open dialog via keyboard.
    await pressEnter(p.eraseButton);
    await expect(p.confirmationDialog).toBeVisible();

    // Confirm erase via keyboard — count resets to zero.
    await pressEnter(p.confirmationEraseButton);
    await expect(p.trainCount).toHaveText('0');
    await expect(p.confirmationDialog).not.toBeVisible();
  });
});
