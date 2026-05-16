import {expect, type Locator} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/** Page Object for the Maze lab — lesson 2 of allthethingscourse. */
export class Maze extends LegacyBlocklyLab {
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(2, level);
  }

  async runUntilInlineFeedback(): Promise<void> {
    await this.setExecutionSpeedToFast();
    await this.run();
    await this.waitForVisibleFeedback(
      this.page.locator('.uitest-topInstructions-inline-feedback'),
    );
  }

  /** Run the workspace and wait for the Cucumber-visible congrats dialog. */
  async runUntilCongrats(): Promise<void> {
    await this.setExecutionSpeedToFast();
    await this.run();
    await this.waitForVisibleFeedback(this.congratsMessage);
  }

  /**
   * Use the same speed control exposed by Cucumber's "set slider speed to fast"
   * step.  Under full-suite load the default Maze animation can take long
   * enough to make the visible feedback wait flaky.
   */
  private async setExecutionSpeedToFast(): Promise<void> {
    await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__TestInterface?.setSpeedSliderValue?.(1);
    });
  }

  /**
   * Wait for feedback the user can see.  The Cucumber scenarios assert only the
   * visible feedback surfaces, not Maze's internal animation/report flags.
   */
  private async waitForVisibleFeedback(feedback: Locator): Promise<void> {
    await expect(feedback).toBeVisible({timeout: 60_000});
    await expect(feedback).not.toHaveText(/^\s*$/);
  }
}
