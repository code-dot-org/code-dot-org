import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page Object base for legacy CSF labs built on the Blockly workspace.
 *
 * Covers Maze, Farmer, Bee, Artist, Bounce, Flappy, and any future lab that
 * shares the same control IDs and feedback selectors. The Blockly workspace
 * lives in the main window; no iframe switching required.
 *
 * Subclass contract:
 *   — implement buildLevelUrl(level) to own the URL scheme
 *   — override instructionsSelector getter if not using .csf-top-instructions p
 *   — override congratsSelector getter if not using .congrats
 *   — add lab-specific locators and game-event methods in the subclass
 */
export abstract class LegacyBlocklyLab {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Runs the current workspace program. */
  readonly runButton: Locator;

  /** Resets the lab to its initial state after a run. */
  readonly resetButton: Locator;

  /** Advances to the next level after a successful run. */
  readonly continueButton: Locator;

  /** Returns to the current level after the congratulations dialog. */
  readonly againButton: Locator;

  /** Congratulations overlay shown on puzzle completion. */
  readonly congratsMessage: Locator;

  /** Inline feedback rendered in the top-instructions panel after a failed run. */
  readonly inlineFeedback: Locator;

  /** Static puzzle instructions shown at the top of the level. */
  readonly instructions: Locator;

  /**
   * Returns the relative URL for the given level number.
   * Each lab owns its own URL scheme — allthethingscourse path, events course,
   * standalone /flappy/ route, etc.
   */
  protected abstract buildLevelUrl(level: number): string;

  /**
   * CSS selector for the level's instruction text.
   * Override in subclasses that use a different instructions component
   * (e.g. Farmer uses .instructions-markdown p).
   */
  protected get instructionsSelector(): string {
    return '.csf-top-instructions p';
  }

  /**
   * CSS selector for the congratulations overlay.
   * Override in subclasses where the overlay is nested differently
   * (e.g. Flappy uses .modal .congrats).
   */
  protected get congratsSelector(): string {
    return '.congrats';
  }

  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.resetButton = page.locator('#resetButton');
    this.continueButton = page.locator('#continue-button');
    this.againButton = page.locator('#again-button');
    this.congratsMessage = page.locator(this.congratsSelector);
    this.inlineFeedback = page.locator(
      '.uitest-topInstructions-inline-feedback',
    );
    this.instructions = page.locator(this.instructionsSelector);
  }

  /**
   * Navigate to a level via reset_session, then wait for full load and dismiss
   * any sign-in overlay. Use for the first visit to a level in a test.
   */
  async gotoLevel(level: number): Promise<void> {
    await this.navigate(this.buildLevelUrl(level));
  }

  /**
   * Navigate directly to a level without session reset.
   * Use for mid-test navigation within the same session.
   */
  async reloadLevel(level: number): Promise<void> {
    await this.navigateDirect(this.buildLevelUrl(level));
  }

  /**
   * Wait for the URL to match the given level.
   * Use after nextLevel() to confirm the browser reached the expected level.
   */
  async waitForLevel(level: number): Promise<void> {
    const path = this.buildLevelUrl(level).split('?')[0];
    await this.page.waitForURL(`**${path}`);
  }

  /**
   * Load a Blockly workspace from a JSON string.
   * Mirrors load_json_blocks() from blockly_helpers.rb:
   *   Blockly.serialization.workspaces.load(JSON, Blockly.getMainWorkspace())
   */
  async loadBlocks(blocksJson: string): Promise<void> {
    await this.page.evaluate(json => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blockly = (window as any).Blockly;
      blockly.serialization.workspaces.load(
        JSON.parse(json),
        blockly.getMainWorkspace(),
      );
    }, blocksJson);
  }

  async run(): Promise<void> {
    await this.runButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }

  async nextLevel(): Promise<void> {
    await this.continueButton.click();
  }

  async tryAgain(): Promise<void> {
    await this.againButton.click();
  }

  /**
   * Wait for the run button to be visible and the sign-in callout to be gone.
   * Use after navigateDirect() or any navigation that bypasses navigate().
   */
  async waitForReady(): Promise<void> {
    await expect(this.runButton).toBeVisible();
    await expect(this.page.locator('.uitest-signincallout')).toBeHidden();
  }

  /**
   * Full navigation: reset session, load URL, dismiss optional overlays, then
   * confirm the lab is ready. Use for the first visit to a level.
   */
  private async navigate(url: string): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(url);
    await expect(this.runButton).toBeVisible();
    await this.dismissOptionalOverlays();
    await this.waitForReady();
  }

  /**
   * Direct navigation without session reset: load URL then confirm ready.
   * Used by reloadLevel() for mid-test same-session navigation.
   */
  private async navigateDirect(url: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForReady();
  }

  /**
   * Click away any one-time overlays that appear on first visit.
   * Called after the page has loaded (runButton visible) so isVisible() is stable.
   */
  private async dismissOptionalOverlays(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      await overlay.click();
    }

    const closeBtn = this.page.locator('[aria-label="Close"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }
}
