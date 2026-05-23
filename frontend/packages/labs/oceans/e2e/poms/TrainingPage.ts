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
   * @param isYes - `true` for Yes, `false` for No.
   * @param via - Activation method: mouse click (default) or keyboard Enter.
   */
  async classifyOne(
    isYes: boolean,
    via: 'click' | 'key' = 'click',
  ): Promise<void> {
    const currentText = (await this.trainCount.textContent()) ?? '0';
    const count = parseInt(currentText.trim(), 10);
    const next = Math.min(999, count + 1);
    const button = isYes ? this.yesButton : this.noButton;

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
   * @param yesCount - Number of Yes classifications to submit.
   * @param noCount  - Number of No classifications to submit.
   */
  async train(yesCount: number, noCount: number): Promise<void> {
    for (let i = 0; i < yesCount; i++) {
      await this.classifyOne(true);
    }
    for (let i = 0; i < noCount; i++) {
      await this.classifyOne(false);
    }
  }

  /**
   * Complete the Training → Predicting → Pond flow.
   *
   * Trains `yesCount` yes + `noCount` no examples (default: 0 each), then
   * runs prediction and advances to the Pond scene.
   *
   * @param yesCount - Yes classifications to submit before advancing.
   * @param noCount  - No classifications to submit before advancing.
   */
  async fullFlow(yesCount = 0, noCount = 0): Promise<void> {
    await this.train(yesCount, noCount);
    await this.advanceToPredictScene();
    await this.runPrediction();
    await this.predictContinueButton.click();
    await this.waitForPondScene();
  }
}
