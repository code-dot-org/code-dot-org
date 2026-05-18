import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Page Object for the Public Key Cryptography widget — lesson 31 of allthethingscourse.
 *
 * PKC is a standalone CSP widget (not a Blockly lab). The mount point
 * `#public-key-cryptography-mount` is visible once the React component mounts.
 */
export class PKC {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** React mount point for the PKC widget — `#public-key-cryptography-mount`. */
  readonly mount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mount = page.locator('#public-key-cryptography-mount');
  }

  /**
   * Navigate to a PKC level and wait for the widget to mount.
   *
   * @param level - level number within lesson 31
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(labLevelUrl(31, level));
    await this.mount.waitFor({state: 'visible'});
  }

  /**
   * Click the last Continue button in the PKC widget.
   * PKC renders multiple Continue buttons for multi-step panels; the last
   * one advances to the next level.
   * Mirrors `I click the last "Continue" button` from continue_button.feature.
   */
  async clickLastContinueButton(): Promise<void> {
    await this.page.getByRole('button', {name: 'Continue'}).last().click();
  }
}
