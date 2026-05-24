import {type Locator, expect} from 'playwright/test';

import {OceansPage} from './OceansPage';

/**
 * Base for modes that include the Training scene.
 *
 * Subclasses supply the mode-specific yes/no button locators; this class
 * provides `classifyOne`, `train`, and `fullFlow` built on top of them.
 */
export abstract class TrainingPage extends OceansPage {
  /** Positive-answer training button (label depends on mode / selected word). */
  abstract get yesButton(): Locator;

  /** Negative-answer training button (label depends on mode / selected word). */
  abstract get noButton(): Locator;

  /**
   * Classify one fish and wait until the training counter increments.
   *
   * Retries because `onClassifyFish` no-ops while `state.isRunning` is true
   * (~1 s fish-eat animation), so a single click/keypress that lands during
   * that window is silently ignored.
   *
   * @param opts - Classification options.
   * @param opts.yes - `true` to press Yes, `false` to press No.
   * @param opts.via - Activation method: `'click'` (default) or `'key'` (Enter).
   */
  async classifyOne(opts: {
    yes: boolean;
    via?: 'click' | 'key';
  }): Promise<void> {
    const {yes, via = 'click'} = opts;
    const currentText = (await this.trainCount.textContent()) ?? '0';
    const count = parseInt(currentText.trim(), 10);
    const next = Math.min(999, count + 1);
    const button = yes ? this.yesButton : this.noButton;

    await expect(async () => {
      if (via === 'key') {
        // page.keyboard fires immediately after focus; locator.press() adds a
        // second stability gate that delays the key into the ~1 s isRunning
        // window where onClassifyFish no-ops.
        await button.focus();
        await button.page().keyboard.press('Enter');
      } else {
        await button.click();
      }
      // 1 500 ms > ~1 s animation; a dropped press never succeeds, fail fast.
      await expect(this.trainCount).toHaveText(String(next), {timeout: 1_500});
    }).toPass({timeout: 15_000});
  }

  /**
   * Perform a training sequence of yes-clicks followed by no-clicks.
   *
   * @param opts - Training counts.
   * @param opts.yes - Number of Yes classifications to submit.
   * @param opts.no  - Number of No classifications to submit.
   */
  async train(opts: {yes: number; no: number}): Promise<void> {
    for (let i = 0; i < opts.yes; i++) {
      await this.classifyOne({yes: true});
    }
    for (let i = 0; i < opts.no; i++) {
      await this.classifyOne({yes: false});
    }
  }

  /**
   * Complete the Training → Predicting → Pond flow.
   *
   * Trains the given yes/no examples (default: 0 each), then runs prediction
   * and advances to the Pond scene.
   *
   * @param opts - Optional training counts.
   * @param opts.yes - Yes classifications to submit before advancing.
   * @param opts.no  - No classifications to submit before advancing.
   */
  async fullFlow(opts: {yes?: number; no?: number} = {}): Promise<void> {
    await this.train({yes: opts.yes ?? 0, no: opts.no ?? 0});
    await this.advanceToPredictScene();
    await this.runPrediction();
    await this.predictContinueButton.click();
    await this.waitForPondScene();
  }
}
