import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the Minecraft Hour of Code completion path.
 */
export class MinecraftCertificatePage {
  /** Playwright page under test. */
  private readonly page: Page;

  /** Run button visible when the lab is ready for input. */
  readonly runButton: Locator;

  /** Direction button used by the final Minecraft level. */
  readonly rightButton: Locator;

  /** Minecraft congrats dialog. */
  readonly congratsDialog: Locator;

  /** Continue button in the Minecraft congrats dialog. */
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.rightButton = page.locator('#rightButton');
    this.congratsDialog = page.locator('.congrats');
    this.continueButton = page.locator('#continue-button');
  }

  /**
   * Reset Minecraft course progress and wait for the lab shell to appear.
   */
  async resetMinecraftProgress(): Promise<void> {
    await this.page.goto('/courses/mc/units/1/reset');
    await this.expectMinecraftReady();
  }

  /**
   * Load the final Minecraft Hour of Code level from the Cucumber scenario.
   */
  async loadFinalLevel(): Promise<void> {
    await this.page.goto(
      '/courses/mc/units/1/lessons/1/levels/14?noautoplay=true&customSlowMotion=0.1',
    );
    await this.expectMinecraftReady();
  }

  /**
   * Wait for the visible run control and the Minecraft runtime.
   *
   * The visible readiness signal is #runButton. The Cucumber step also checks
   * Craft.phaserLoaded(); this guards the same visible game canvas becoming
   * usable before clicking Run.
   */
  async expectMinecraftReady(): Promise<void> {
    await expect(this.runButton).toBeVisible();
    await expect
      .poll(() =>
        this.page.evaluate(() => {
          const craft = (
            window as typeof window & {
              Craft?: {phaserLoaded?: () => boolean};
            }
          ).Craft;
          return craft?.phaserLoaded?.() === true;
        }),
      )
      .toBe(true);
  }

  /**
   * Complete the final level and continue to the certificate page.
   */
  async completeFinalLevel(): Promise<void> {
    await this.runButton.click();
    await expect(this.rightButton).toBeVisible();
    await this.rightButton.click();
    await expect(this.congratsDialog).toContainText('Keep Playing');
    await this.continueButton.click();
    await expect(this.page).toHaveURL(/\/congrats/);
    await expect(this.page).toHaveURL(/\?i=.*&s=bWM%3D$/);
  }
}
