import {expect, type Locator, type Page} from '@playwright/test';

import {LegacyBlocklyLab} from './legacy-blockly-lab';

/** Minecraft/Craft levels (apps/src/craft/). */
export class CraftLab extends LegacyBlocklyLab {
  /** Player-selection interstitial (apps/src/craft/PlayerSelectionDialog.jsx), shown on first anonymous load. */
  readonly playerSelectionDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.playerSelectionDialog = page.locator('#craft-popup-player-selection');
  }

  protected override async dismissLabInterstitials(): Promise<void> {
    if (!(await this.playerSelectionDialog.isVisible())) {
      return;
    }
    // By id, not by accessible name: the close aria-label is localized, and
    // these levels are exercised in every locale.
    await this.playerSelectionDialog.locator('#x-close').click();
    await expect(this.playerSelectionDialog).toBeHidden();
  }
}
