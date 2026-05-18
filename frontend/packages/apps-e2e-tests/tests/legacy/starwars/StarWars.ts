import {expect, type Locator, type Page} from '@playwright/test';

type ProgressStatus = 'perfect' | 'not_tried';

const PROGRESS_COLORS: Record<
  ProgressStatus,
  {background: string; border: string}
> = {
  perfect: {
    background: 'rgb(14, 190, 14)',
    border: 'rgb(14, 190, 14)',
  },
  not_tried: {
    background: 'rgb(254, 254, 254)',
    border: 'rgb(198, 202, 205)',
  },
};

/**
 * Page object for the Star Wars Hour of Code Droplet levels.
 */
export class StarWars {
  private readonly page: Page;
  private readonly runButton: Locator;
  private readonly startOverButton: Locator;
  private readonly confirmButton: Locator;
  private readonly completionModal: Locator;
  private readonly continueButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.startOverButton = page.locator('#clear-puzzle-header');
    this.confirmButton = page.locator('#confirm-button');
    this.completionModal = page.locator('.modal');
    this.continueButton = page.locator('#continue-button');
  }

  /**
   * Resets the browser session, clears Star Wars course progress, and loads a level.
   *
   * @param level - Star Wars lesson level number
   */
  public async resetAndGotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto('/courses/starwars/units/1/reset');
    await this.page.evaluate(() => window.localStorage.clear());
    await this.gotoLevel(level);
  }

  /**
   * Loads a Star Wars level and waits for visible lab readiness signals.
   *
   * @param level - Star Wars lesson level number
   */
  public async gotoLevel(level: number): Promise<void> {
    await this.page.goto(this.levelUrl(level));
    await this.waitForReady();
  }

  /**
   * Waits for the user-visible controls Agent Browser found on the Star Wars level.
   */
  public async waitForReady(): Promise<void> {
    await expect(this.runButton).toBeVisible({timeout: 60_000});
    await expect(
      this.page.getByRole('button', {name: /Show (Text|Blocks)/}),
    ).toBeVisible({timeout: 15_000});
    await expect(this.startOverButton).toBeVisible({timeout: 15_000});
    await expect(this.page.locator('.droplet-main-canvas')).toBeAttached({
      timeout: 15_000,
    });
    await this.dismissInstructionsOverlay();
  }

  /**
   * Sets Droplet source to the exact program text created by the Cucumber steps.
   *
   * @param code - full Droplet JavaScript source
   */
  public async setProgram(code: string): Promise<void> {
    await this.page.evaluate(source => {
      const testInterface = (
        window as Window & {
          __TestInterface?: {
            getDroplet?: () => {setValue: (value: string) => void};
          };
        }
      ).__TestInterface;
      const droplet = testInterface?.getDroplet?.();
      if (!droplet) throw new Error('Droplet test interface was not ready');
      droplet.setValue(source);
    }, code);
    await this.expectProgram(code);
  }

  /**
   * Appends Droplet source, matching the Cucumber "append text to droplet" step.
   *
   * @param code - Droplet JavaScript source to append
   */
  public async appendProgram(code: string): Promise<void> {
    const nextProgram = `${await this.getProgram()}${code}`;
    await this.setProgram(nextProgram);
  }

  /**
   * Runs the current program and waits for the completion dialog.
   */
  public async runAndExpectCompletion(): Promise<void> {
    await this.dismissInstructionsOverlay();
    await this.runButton.click();
    await expect(this.completionModal).toBeVisible({timeout: 20_000});
    await expect(this.continueButton).toBeVisible();
  }

  /**
   * Runs the current program and asserts no completion dialog appears.
   */
  public async runAndExpectNoCompletion(): Promise<void> {
    await this.dismissInstructionsOverlay();
    await this.runButton.click();
    await expect(this.page.locator('#resetButton')).toBeVisible({
      timeout: 10_000,
    });
    await expect(this.completionModal).not.toBeVisible();
    await expect(this.continueButton).not.toBeVisible();
  }

  /**
   * Clicks Continue and waits for the next Star Wars level.
   *
   * @param level - expected destination level
   */
  public async continueToLevel(level: number): Promise<void> {
    await this.continueButton.click();
    await this.page.waitForURL(`**${this.levelPath(level)}`, {timeout: 30_000});
    await this.waitForReady();
  }

  /**
   * Uses Start Over and confirms the reset modal.
   */
  public async startOver(): Promise<void> {
    await this.startOverButton.evaluate(element =>
      (element as HTMLElement).click(),
    );
    await expect(this.completionModal).toBeVisible({timeout: 10_000});
    await this.confirmButton.click();
    await expect(this.completionModal).toBeHidden({timeout: 10_000});
  }

  /**
   * Polls Droplet until its source matches expected text.
   *
   * @param expected - expected Droplet JavaScript source
   */
  public async expectProgram(expected: string): Promise<void> {
    await expect
      .poll(() => this.getProgram(), {timeout: 10_000})
      .toBe(expected);
  }

  /**
   * Asserts a header progress bubble status by matching the legacy colors.
   *
   * @param level - 1-based level number
   * @param status - expected progress status
   */
  public async expectHeaderProgress(
    level: number,
    status: ProgressStatus,
  ): Promise<void> {
    const expected = PROGRESS_COLORS[status];
    const bubble = this.page
      .locator('.header_level .react_stage a')
      .nth(level - 1)
      .locator('.progress-bubble');
    await expect(bubble).toBeVisible({timeout: 30_000});
    await expect
      .poll(
        async () =>
          bubble.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              background: style.backgroundColor,
              border: style.borderTopColor,
            };
          }),
        {timeout: 30_000},
      )
      .toEqual(expected);
  }

  /**
   * Reads the current Droplet JavaScript source through the test interface.
   */
  private async getProgram(): Promise<string> {
    return this.page.evaluate(() => {
      const testInterface = (
        window as Window & {
          __TestInterface?: {getDropletContents?: () => string};
        }
      ).__TestInterface;
      const source = testInterface?.getDropletContents?.();
      if (source === undefined) {
        throw new Error('Droplet contents were not ready');
      }
      return source;
    });
  }

  /**
   * Closes the first-run instructions prompt that visibly blocks lab controls.
   */
  private async dismissInstructionsOverlay(): Promise<void> {
    const okButton = this.page.getByRole('button', {name: 'OK'}).first();
    if (await okButton.isVisible()) {
      await okButton.evaluate(element => (element as HTMLElement).click());
      await expect(okButton).toBeHidden({timeout: 10_000});
      await expect(this.page.locator('#overlay')).toBeHidden({timeout: 10_000});
    }
  }

  /**
   * Builds a Star Wars level URL with video autoplay disabled.
   *
   * @param level - Star Wars lesson level number
   */
  private levelUrl(level: number): string {
    return `${this.levelPath(level)}?noautoplay=true`;
  }

  /**
   * Builds a Star Wars level path.
   *
   * @param level - Star Wars lesson level number
   */
  private levelPath(level: number): string {
    return `/courses/starwars/units/1/lessons/1/levels/${level}`;
  }
}
