import {expect, type Locator, type Page} from '@playwright/test';

import {Maze} from '../activities/maze/Maze';

/**
 * Page Object for challenge levels — a Maze subtype with an extra dialog layer.
 *
 * Challenge levels load on top of a standard Maze level and present a
 * two-stage dialog: an initial prompt, a "You did it!" passing-solution panel,
 * and a "Challenge Complete!" perfect-solution panel. A skip button provides
 * an escape hatch.
 *
 * All standard Maze methods (connectBlock, run, reset, disposeBlock, etc.)
 * are available via inheritance.
 */
export class ChallengeLevel extends Maze {
  /** Challenge dialog heading — `#uitest-challenge-title`. */
  readonly challengeTitle: Locator;

  /** Primary action button in the challenge dialog — `#challengePrimaryButton`. */
  readonly challengePrimaryButton: Locator;

  /** Cancel/dismiss button in the challenge dialog — `#challengeCancelButton`. */
  readonly challengeCancelButton: Locator;

  /** Modal body — `.modal-body`. Hidden state confirms dialog dismissal. */
  readonly modalBody: Locator;

  constructor(page: Page) {
    super(page);
    this.challengeTitle = page.locator('#uitest-challenge-title');
    this.challengePrimaryButton = page.locator('#challengePrimaryButton');
    this.challengeCancelButton = page.locator('#challengeCancelButton');
    this.modalBody = page.locator('.modal-body');
  }

  /**
   * Click the skip button via JS to bypass hit-testing.
   * WebKit: `#visualization` overlaps `#skipButton` in the challenge dialog —
   * a direct Playwright click is intercepted by the visualization layer.
   */
  async clickSkipButton(): Promise<void> {
    await this.page.evaluate(() =>
      (document.querySelector('#skipButton') as HTMLElement)?.click(),
    );
  }

  /**
   * Wait for the challenge title to match the expected text.
   *
   * @param text - expected heading text
   */
  async expectChallengeTitle(text: string): Promise<void> {
    await this.challengeTitle.waitFor({state: 'visible'});
    await expect(this.challengeTitle).toHaveText(text);
  }
}
