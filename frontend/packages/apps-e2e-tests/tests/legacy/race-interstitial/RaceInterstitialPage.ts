import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the forced race interstitial on dashboard home.
 */
export class RaceInterstitialPage {
  private readonly page: Page;
  readonly modal: Locator;

  /**
   * @param page - Playwright page authenticated as a student
   */
  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('#race-modal');
  }

  /**
   * Opens dashboard home with the race interstitial forced on and waits for
   * the visible modal.
   */
  async gotoForcedInterstitial(): Promise<void> {
    await this.page.goto('/home?forceRaceInterstitial=true');
    await expect(this.modal).toBeVisible({timeout: 30_000});
  }

  /**
   * Dismisses the interstitial through the visible "later" link.
   */
  async dismissLater(): Promise<void> {
    await this.page.locator('#later-link').click();
    await expect(this.modal).not.toBeVisible({timeout: 15_000});
  }
}
