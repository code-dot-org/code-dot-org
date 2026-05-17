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
   * Outer instructions container (.csf-top-instructions).
   * Authored hint text is appended here; use toContainText rather than
   * the narrower `instructions` locator (.csf-top-instructions p).
   */
  readonly instructionsPanel: Locator;

  /**
   * Authored-hints lightbulb toggle button.
   * Not present on levels without authored hints — use not.toBeAttached()
   * for the negative assertion.
   */
  readonly lightbulb: Locator;

  /**
   * Hint count badge shown next to the lightbulb.
   * Removed from the DOM after the last hint is viewed.
   */
  readonly hintCount: Locator;

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
    this.instructionsPanel = page.locator('.csf-top-instructions');
    this.lightbulb = page.locator('#lightbulb');
    this.hintCount = page.locator('#hintCount');
  }

  /**
   * Click the 'Yes' confirm button on the authored-hint prompt.
   * Uses exact:true because the lightbulb div[role=button] also contains
   * "yes" in its aria-label, which would otherwise cause a strict-mode
   * violation on partial match.
   */
  async acceptHint(): Promise<void> {
    await this.page.getByRole('button', {name: 'Yes', exact: true}).click();
  }

  /**
   * Navigate to a level via reset_session, then wait for full load and dismiss
   * any sign-in overlay. Use for the first visit to a level in a test.
   */
  async gotoLevel(level: number): Promise<void> {
    await this.navigate(this.buildLevelUrl(level));
  }

  /**
   * Wait until the page has rendered enough to reliably check for optional
   * overlays. Called from navigate() before dismissOptionalOverlays().
   *
   * Override in subclasses where #runButton is absent or hidden on mount
   * (e.g. Jigsaw waits for .blocklyWorkspace instead).
   */
  protected async waitForInitialLoad(): Promise<void> {
    await expect(this.runButton).toBeVisible();
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
   * Load a Blockly workspace from a serialisation object.
   * Mirrors load_json_blocks() from blockly_helpers.rb:
   *   Blockly.serialization.workspaces.load(obj, Blockly.getMainWorkspace())
   *
   * @param blocksJson - plain workspace object (same shape as startSources.blocks
   *   in level configs — `blocks` key required, `variables` optional).
   */
  async loadBlocks(blocksJson: object): Promise<void> {
    await this.page.evaluate(json => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blockly = (window as any).Blockly;
      blockly.serialization.workspaces.load(json, blockly.getMainWorkspace());
    }, blocksJson);
  }

  /**
   * Returns a locator for a Blockly block's top-level SVG element.
   * Use for class assertions (toHaveClass) and presence checks (toBeAttached).
   *
   * @param blockId - value of the element's data-id attribute
   */
  blockLocator(blockId: string): Locator {
    return this.page.locator(`.blocklySvg g[data-id="${blockId}"]`).first();
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
   * Connect one block's previousConnection to another's nextConnection via JS.
   * Mirrors connect_block() from blockly_helpers.rb.
   *
   * @param fromId - data-id of the block to move
   * @param toId   - data-id of the target block (its nextConnection receives fromId)
   */
  async connectBlock(fromId: string, toId: string): Promise<void> {
    await this.page.evaluate(
      ({from, to}: {from: string; to: string}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workspace = (window as any).Blockly.getMainWorkspace();
        const blockToMove = workspace.getBlockById(from);
        const targetBlock = workspace.getBlockById(to);
        targetBlock.nextConnection.connect(blockToMove.previousConnection);
      },
      {from: fromId, to: toId},
    );
  }

  /**
   * Remove a block from the workspace via the Blockly JS API.
   * Mirrors delete_block() from blockly_helpers.rb.
   *
   * @param blockId - data-id of the block to remove
   */
  async disposeBlock(blockId: string): Promise<void> {
    await this.page.evaluate((id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (window as any).Blockly.getMainWorkspace();
      workspace.getBlockById(id)?.dispose();
    }, blockId);
  }

  /**
   * Post-navigation wait: initial load + optional overlays + ready.
   * Equivalent to the steps performed by navigate() but without the session
   * reset and page.goto() — call this after a direct page.goto() in a test.
   * Subclass overrides to waitForInitialLoad() and dismissOptionalOverlays()
   * are honoured automatically.
   */
  async waitForLabPage(): Promise<void> {
    await this.waitForInitialLoad();
    await this.dismissOptionalOverlays();
    await this.waitForReady();
  }

  /**
   * Wait for the run button to be visible and the sign-in callout to be gone.
   * Use after navigateDirect() or any navigation that bypasses navigate().
   */
  async waitForReady(): Promise<void> {
    await expect(this.runButton).toBeVisible();
    await this.waitForCodeStudioHeaderReady();
    await expect(this.page.locator('.uitest-signincallout')).toBeHidden();
  }

  /**
   * Waits for dashboard's level header to finish rendering when the level uses
   * the Code Studio course chrome. Standalone project pages do not always have
   * this header, so absence is a ready state for this POM.
   */
  protected async waitForCodeStudioHeaderReady(): Promise<void> {
    const header = this.page.locator('.header_level').first();
    if (!(await header.isVisible({timeout: 1_000}).catch(() => false))) {
      return;
    }

    await expect(this.page.locator('#header_middle_content')).toBeVisible({
      timeout: 30_000,
    });

    const progressContainer = this.page
      .locator('#lesson_progress_container')
      .first();
    if (
      !(await progressContainer.isVisible({timeout: 1_000}).catch(() => false))
    ) {
      return;
    }

    await expect(
      this.page.locator('.header_level .progress-bubble').first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Full navigation: reset session, load URL, dismiss optional overlays, then
   * confirm the lab is ready. Use for the first visit to a level or when a
   * subclass needs an alternate URL scheme (e.g. Dance course vs allthethings).
   */
  protected async navigate(url: string): Promise<void> {
    await this.page.goto('/reset_session', {waitUntil: 'commit'});
    await this.page.goto(url, {waitUntil: 'commit'});
    await this.waitForInitialLoad();
    await this.dismissOptionalOverlays();
    await this.waitForReady();
  }

  /**
   * Direct navigation without session reset: load URL then confirm ready.
   * Used by reloadLevel() for mid-test same-session navigation.
   */
  private async navigateDirect(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'commit'});
    await this.waitForReady();
  }

  /**
   * Click away any one-time overlays that appear on first visit.
   * Called after the page has loaded (runButton visible) so isVisible() is stable.
   */
  protected async dismissOptionalOverlays(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      // JS click mirrors Cucumber's $(selector)[0].click() — bypasses browser
      // hit-testing so a modal-backdrop on top (e.g. challenge-level dialog) does
      // not intercept the event or steal focus from the overlay.
      await this.page.evaluate(() =>
        (document.querySelector('#overlay') as HTMLElement)?.click(),
      );
    }

    const closeBtn = this.page.locator('[aria-label="Close"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }
}
