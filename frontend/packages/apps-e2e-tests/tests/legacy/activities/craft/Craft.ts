import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for Minecraft: Hero's Journey (Craft) — lesson 25 of
 * allthethingscourse.
 *
 * Craft uses the same #runButton/#resetButton interface as legacy CSF labs but
 * drives a Phaser.js game engine. waitForInitialLoad waits for both the run
 * button and for the Phaser game to report ready via Craft.phaserLoaded().
 */
export class Craft extends LegacyBlocklyLab {
  /**
   * "Finish" button shown in the Minecraft completion modal.
   * Appears after the level program runs to completion.
   */
  readonly finishButton: Locator;

  /**
   * "Publish to project gallery" button in the finish dialog.
   * Present only when the user is signed in.
   */
  readonly publishToProjectGalleryButton: Locator;

  /**
   * "Save to project gallery" button in the finish dialog.
   * Present only when the user is signed in.
   */
  readonly saveToProjectGalleryButton: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.getByRole('button', {name: 'Finish'});
    this.publishToProjectGalleryButton = page.locator(
      '#publish-to-project-gallery-button',
    );
    this.saveToProjectGalleryButton = page.locator(
      '#save-to-project-gallery-button',
    );
  }

  /** Lesson 25 of allthethingscourse — used by LegacyBlocklyLab.gotoLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(25, level);
  }

  /**
   * Wait for the run button and for the Phaser game engine to finish loading.
   * Mirrors `I wait until the Minecraft game is loaded`:
   *   wait.until { browser.execute_script('return Craft?.phaserLoaded();') }
   */
  protected override async waitForInitialLoad(): Promise<void> {
    await this.runButton.waitFor({state: 'visible'});
    await this.page.waitForFunction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => !!(window as any).Craft?.phaserLoaded(),
      {timeout: 60000},
    );
  }

  /**
   * Wait for the Finish button and click it to open the completion dialog.
   * Mirrors `I click selector "button:contains(Finish)" once I see it`.
   */
  async finish(): Promise<void> {
    await this.finishButton.waitFor({state: 'visible'});
    await this.finishButton.click();
  }
}
