import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for PlayLab (studio) — lesson 22 of allthethingscourse.
 *
 * Extends LegacyBlocklyLab for run/reset/congrats. Adds the sprite-layer
 * locator used to verify sprite dimensions before and after a program run.
 */
export class Studio extends LegacyBlocklyLab {
  /** All sprite images on the stage canvas — `#spriteLayer image`. */
  readonly sprites: Locator;

  constructor(page: Page) {
    super(page);
    this.sprites = page.locator('#spriteLayer image');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(22, level);
  }
}
