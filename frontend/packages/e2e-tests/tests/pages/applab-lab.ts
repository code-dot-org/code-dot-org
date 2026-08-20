import {type Locator, type Page} from '@playwright/test';

import {LegacyBlocklyLab} from './legacy-blockly-lab';

/**
 * Page object for a standalone App Lab project (/projects/applab/new) — not a
 * lesson/level. This port only navigates, dismisses the shared overlay, and
 * screenshots; it never drives the Code/Design/Data toolbar.
 */
export class ApplabLab extends LegacyBlocklyLab {
  /**
   * Autosave "Saved <time>" indicator in the project title bar; its
   * datetime attribute (though not its rendered "a few seconds ago" text) is
   * fresh on every load.
   */
  readonly savedTimestamp: Locator;

  constructor(page: Page) {
    super(page);
    this.savedTimestamp = page.locator('time');
  }

  /** Create a new App Lab project and wait for the lab to be interactive. */
  async gotoNewProject(): Promise<void> {
    await this.page.goto('/projects/applab/new', {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForReady();
  }
}
