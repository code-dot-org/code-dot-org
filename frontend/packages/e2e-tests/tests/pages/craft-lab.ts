import {expect, type Locator, type Page} from '@playwright/test';

import {LegacyBlocklyLab} from './legacy-blockly-lab';

/** Minecraft/Craft levels (apps/src/craft/). */
export class CraftLab extends LegacyBlocklyLab {
  /** Player-selection interstitial (apps/src/craft/PlayerSelectionDialog.jsx), shown on first anonymous load. */
  readonly playerSelectionDialog: Locator;

  /**
   * The "choose" button under the Steve portrait. The dialog has no close
   * button; picking Steve is how it is dismissed, and Steve is the default
   * character the old close button fell back to (DEFAULT_CHARACTER in
   * apps/src/craft/agent/craft.js).
   *
   * Anchored on the portrait's id rather than on the button's label, because
   * the label is localized and these levels run in every locale.
   */
  readonly steveSelectButton: Locator;

  constructor(page: Page) {
    super(page);
    this.playerSelectionDialog = page.locator('#craft-popup-player-selection');
    this.steveSelectButton = this.playerSelectionDialog
      .locator('#choose-character-container > div')
      .filter({has: page.locator('#steve-portrait')})
      .getByRole('button');
  }

  protected override async dismissLabInterstitials(): Promise<void> {
    if (!(await this.playerSelectionDialog.isVisible())) {
      return;
    }
    await this.steveSelectButton.click();
    await expect(this.playerSelectionDialog).toBeHidden();
  }
}
