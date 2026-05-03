import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for the Bounce lab — lesson 1 of the events course.
 * Extends LegacyBlocklyLab with keyboard helpers and the freeplay finish button.
 */
export class BounceLab extends LegacyBlocklyLab {
  /** Finish button shown in freeplay mode after pressing Run. */
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.locator('#finishButton');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level, 'events');
  }

  /**
   * Press and hold a keyboard key for the duration of the current assertion.
   * Call releaseKey() with the same name when done.
   *
   * @param key - Playwright key name (e.g. 'ArrowLeft', 'ArrowUp')
   */
  async holdKey(key: string): Promise<void> {
    await this.page.keyboard.down(key);
  }

  /**
   * Release a previously held keyboard key.
   *
   * @param key - Playwright key name matching the one passed to holdKey()
   */
  async releaseKey(key: string): Promise<void> {
    await this.page.keyboard.up(key);
  }
}
