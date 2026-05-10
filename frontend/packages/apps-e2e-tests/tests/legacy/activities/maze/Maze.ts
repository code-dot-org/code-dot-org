import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/** Page Object for the Maze lab — lesson 2 of allthethingscourse. */
export class Maze extends LegacyBlocklyLab {
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(2, level);
  }

  async runUntilInlineFeedback(): Promise<void> {
    await this.run();
    await this.waitForRunToFinishWith(
      '.uitest-topInstructions-inline-feedback',
    );
  }

  async runUntilCongrats(): Promise<void> {
    await this.run();
    await this.waitForRunToFinishWith(this.congratsSelector);
  }

  private async waitForRunToFinishWith(selector: string): Promise<void> {
    await this.page.waitForFunction((feedbackSelector: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maze = (window as any).Maze;
      const feedbackElement = document.querySelector(feedbackSelector);
      return (
        maze?.waitingForReport === false &&
        maze?.animating_ === false &&
        feedbackElement instanceof HTMLElement &&
        feedbackElement.offsetParent !== null &&
        feedbackElement.textContent?.trim()
      );
    }, selector);
  }
}
