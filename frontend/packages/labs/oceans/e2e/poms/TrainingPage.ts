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
   * Click Yes (or No) once and wait until the training counter increments.
   *
   * `onClassifyFish` increments the count synchronously but also sets
   * `isRunning: true`. While `isRunning` is true (~1 s fish-eat animation)
   * subsequent clicks are silently ignored. This method retries the click until
   * the counter advances, so callers never need to manage animation timing.
   *
   * @param isYes - `true` to click Yes, `false` to click No.
   */
  async classifyOne(isYes: boolean): Promise<void> {
    const currentText = (await this.trainCount.textContent()) ?? '0';
    const count = parseInt(currentText.trim(), 10);
    const next = Math.min(999, count + 1);

    await expect(async () => {
      if (isYes) {
        await this.yesButton.click();
      } else {
        await this.noButton.click();
      }
      await expect(this.trainCount).toHaveText(String(next), {timeout: 1_200});
    }).toPass({timeout: 5_000});
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
