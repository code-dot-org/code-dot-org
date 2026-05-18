import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the legacy AI for Oceans Hour of Code levels.
 */
export class OceansMlHocPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens one Oceans level with the guide disabled.
   *
   * @param level - level number in courses/oceans/units/1/lessons/1
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto(
      `/courses/oceans/units/1/lessons/1/levels/${level}?guide=off&lang=en-US`,
      {waitUntil: 'commit'},
    );
    await expect(this.page.getByRole('button').first()).toBeVisible({
      timeout: 60_000,
    });
  }

  /**
   * Labels training examples.
   *
   * @param positiveLabel - positive class button label
   * @param negativeLabel - negative class button label
   */
  async train(positiveLabel: string, negativeLabel: string): Promise<void> {
    await expect(this.button(positiveLabel).first()).toBeVisible({
      timeout: 30_000,
    });
    for (let i = 0; i < 5; i++) {
      await this.button(positiveLabel).first().click();
    }
    for (let i = 0; i < 5; i++) {
      await this.button(negativeLabel).click();
    }
    await this.continueButton.click();
  }

  /**
   * Selects an initial category, then trains the level.
   *
   * @param category - category button label
   * @param negativeLabel - negative class button label
   */
  async chooseCategoryAndTrain(
    category: string,
    negativeLabel: string,
  ): Promise<void> {
    await this.button(category).click();
    await this.train(category, negativeLabel);
  }

  /**
   * Runs the sorting screen and advances when the UI exposes Continue.
   */
  async runSortingAndContinue(): Promise<void> {
    const runButton = this.button('Run');
    await expect(async () => {
      if (await runButton.isVisible({timeout: 2_000}).catch(() => false)) {
        await runButton.click();
      }
      await expect(this.continueButton).toBeVisible({timeout: 15_000});
    }).toPass({timeout: 90_000, intervals: [500, 1000, 2000]});
    await expect(this.continueButton).toBeVisible({timeout: 90_000});
    await this.continueButton.click();
  }

  /**
   * Asserts the final pond screen reached its visible action button.
   *
   * @param buttonLabel - final visible button label
   */
  async expectPondAction(buttonLabel: 'Continue' | 'Finish'): Promise<void> {
    await expect(this.button(buttonLabel)).toBeVisible({timeout: 60_000});
  }

  /**
   * Returns a button by accessible name.
   *
   * @param name - button name
   */
  button(name: string): Locator {
    return this.page.getByRole('button', {name});
  }

  private get continueButton(): Locator {
    return this.button('Continue');
  }
}
