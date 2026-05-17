import {expect, type Locator} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/** Page Object for the Maze lab — lesson 2 of allthethingscourse. */
export class Maze extends LegacyBlocklyLab {
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(2, level);
  }

  /** Wait until Blockly shows the loaded five-block solution. */
  async waitForFiveBlockWorkspace(): Promise<void> {
    await expect(this.page.getByText('Workspace: 5 / 5 blocks')).toBeVisible({
      timeout: 15_000,
    });
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
    await this.run();
    await this.waitForVisibleFeedback(this.congratsMessage);
  }

  /**
   * Keep invalid-loop feedback quick. Passing Maze scenarios keep the same
   * animation path as Cucumber and wait on the visible feedback surface.
   */
  private async setExecutionSpeedToFast(): Promise<void> {
    await this.page.evaluate(() => {
      const maze = (
        window as Window & {
          Maze?: {
            shouldSpeedUpInfiniteLoops: boolean;
            scale: {stepSpeed: number};
          };
        }
      ).Maze;
      if (!maze) {
        throw new Error('Maze test interface was not ready');
      }
      maze.shouldSpeedUpInfiniteLoops = true;
      maze.scale.stepSpeed = 1;
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
