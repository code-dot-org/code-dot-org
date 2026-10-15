import {type Locator, type Page} from '@playwright/test';

/**
 * The race/ethnicity interstitial (#race-modal), rendered only by home/index and
 * scripts/show — not part of the global layout. Carries no role="dialog" or
 * accessible name, hence ids rather than getByRole.
 */
export class RaceInterstitialModalComponent {
  readonly modal: Locator;

  /** Bootstrap pins `.modal` to inset 0, so stability waits must anchor here. */
  readonly dialog: Locator;

  /** By id: the label is translated (race_interstitial.decline). */
  readonly declineLink: Locator;

  constructor(page: Page) {
    this.modal = page.locator('#race-modal');
    this.dialog = this.modal.locator('.modal-dialog');
    this.declineLink = this.modal.locator('#later-link');
  }

  /** Persists `races=closed_dialog` via an un-awaited POST, then hides. */
  async decline(): Promise<void> {
    await this.declineLink.click();
  }
}
