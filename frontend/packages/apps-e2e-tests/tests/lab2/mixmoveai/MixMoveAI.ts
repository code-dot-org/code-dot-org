import {expect, type Locator, type Page} from '@playwright/test';

/** Timeout for AI generation calls — each can take up to 60 s. */
const AI_TIMEOUT = 60_000;

/**
 * Page Object for the Mix & Move with AI course.
 *
 * The course lives at /courses/mix-move-ai-2025/units/1/lessons/1/levels/{N}.
 * Uses the lab2 framework — level navigation via the progress header, AI
 * generation dialogs, and #instructions-continue-button to advance.
 *
 * Note: URL does NOT include ?noautoplay=true — the course auto-starts.
 */
export class MixMoveAI {
  /** Underlying Playwright page. */
  readonly page: Page;

  // --- Phase 1: Dancer ---

  /** Creature species dropdown — `#creature`. */
  readonly creature: Locator;

  /** Generate Dancer button — `#generate-dancer-button`. */
  readonly generateDancerButton: Locator;

  // --- Phase 2: Music ---

  /** Mood dropdown — `#mood`. */
  readonly mood: Locator;

  /** Generate Code button (music phase) — `#generate-code-button`. */
  readonly generateCodeButton: Locator;

  /** Pack dialog first entry — `.pack-dialog-entry` (first). */
  readonly packDialogFirstEntry: Locator;

  /** Confirm selection in the pack dialog — `#pack-dialog-select-button`. */
  readonly packDialogSelectButton: Locator;

  /** Sounds panel — `#sounds-panel`. */
  readonly soundsPanel: Locator;

  // --- Phase 3: Dance ---

  /** Complexity dropdown — `#complexity`. */
  readonly complexity: Locator;

  /** Generate Dance button — `#generate-dance-button`. */
  readonly generateDanceButton: Locator;

  // --- Shared AI controls ---

  /** Back to prompt button (shown after generation) — `#back-to-prompt-button`. */
  readonly backToPromptButton: Locator;

  /** Regenerate button — `#regenerate-button`. */
  readonly regenerateButton: Locator;

  /** Use Code button (shown after music/dance generation) — `#use-code-button`. */
  readonly useCodeButton: Locator;

  /** Continue button — `#instructions-continue-button`. */
  readonly continueButton: Locator;

  /** Share dialog overlay — `#project-share-dialog [role="presentation"]`. */
  readonly shareDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.creature = page.locator('#creature');
    this.generateDancerButton = page.locator('#generate-dancer-button');
    this.mood = page.locator('#mood');
    this.generateCodeButton = page.locator('#generate-code-button');
    this.packDialogFirstEntry = page.locator('.pack-dialog-entry').first();
    this.packDialogSelectButton = page.locator('#pack-dialog-select-button');
    this.soundsPanel = page.locator('#sounds-panel');
    this.complexity = page.locator('#complexity');
    this.generateDanceButton = page.locator('#generate-dance-button');
    this.backToPromptButton = page.locator('#back-to-prompt-button');
    this.regenerateButton = page.locator('#regenerate-button');
    this.useCodeButton = page.locator('#use-code-button');
    this.continueButton = page.locator('#instructions-continue-button');
    this.shareDialog = page.locator(
      '#project-share-dialog [role="presentation"]',
    );
  }

  /** Build the relative URL for a lesson 1 level in mix-move-ai-2025. */
  levelUrl(level: number): string {
    return `/courses/mix-move-ai-2025/units/1/lessons/1/levels/${level}`;
  }

  /** Navigate to a level (full navigation, resets session). */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(this.levelUrl(level));
  }

  /**
   * Click the progress-header level bubble to navigate to a specific level.
   *
   * @param level - level number to navigate to
   * @param lessonName - lesson name as it appears in the bubble title
   */
  async clickHeaderLevel(level: number, lessonName: string): Promise<void> {
    const title = `Level ${level} Lesson ${lessonName}`;
    await this.page.locator(`[title="${title}"]`).click();
  }

  /** Press the lab2 continue button to advance to the next level. */
  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Select an option by label in a <select> dropdown.
   *
   * @param dropdownId - the `id` attribute of the <select> element
   * @param label - visible option text to select
   */
  async selectOption(dropdownId: string, label: string): Promise<void> {
    await this.page.selectOption(`#${dropdownId}`, {label});
  }

  /**
   * Dispatch pointerdown + pointerup on a Blockly editable field.
   *
   * @param selector - CSS selector for the .blocklyEditableField element
   */
  async clickBlockField(selector: string): Promise<void> {
    const field = this.page.locator(selector).first();
    await field.dispatchEvent('pointerdown', {bubbles: true});
    await field.dispatchEvent('pointerup', {bubbles: true});
  }

  /**
   * Click the last block inside a given parent block selector.
   *
   * @param parentSelector - CSS selector for the parent block container
   */
  async clickLastBlockIn(parentSelector: string): Promise<void> {
    await this.page.locator(`${parentSelector} .blocklyBlock`).last().click();
  }

  // --- AI generation helpers ---

  /**
   * Wait for the Back to Prompt button to appear (post-generation).
   * AI calls can take up to 60 s — uses AI_TIMEOUT.
   */
  async waitForBackToPrompt(): Promise<void> {
    await this.backToPromptButton.waitFor({
      state: 'visible',
      timeout: AI_TIMEOUT,
    });
  }

  /**
   * Click Back to Prompt to return to the generation form.
   * Waits for the button to appear before clicking.
   */
  async goBack(): Promise<void> {
    await this.waitForBackToPrompt();
    await this.backToPromptButton.click();
  }

  /**
   * Click Regenerate. Waits for the button to appear (AI_TIMEOUT).
   */
  async regenerate(): Promise<void> {
    await this.regenerateButton.waitFor({
      state: 'visible',
      timeout: AI_TIMEOUT,
    });
    await this.regenerateButton.click();
  }

  /**
   * Click Use Code. Waits for the button to appear (AI_TIMEOUT).
   */
  async useCode(): Promise<void> {
    await this.useCodeButton.waitFor({state: 'visible', timeout: AI_TIMEOUT});
    await this.useCodeButton.click();
  }

  /**
   * Wait for the continue button to appear (AI_TIMEOUT).
   */
  async waitForContinueButton(): Promise<void> {
    await this.continueButton.waitFor({state: 'visible', timeout: AI_TIMEOUT});
  }

  /**
   * Select the first music pack from the pack selection dialog and confirm.
   */
  async selectFirstPack(): Promise<void> {
    await this.packDialogFirstEntry.waitFor({state: 'visible'});
    await this.packDialogFirstEntry.click();
    await this.packDialogSelectButton.click();
  }

  /**
   * Locator for a sounds panel folder row by index.
   *
   * @param index - zero-based row index
   */
  soundsFolderRow(index: number): Locator {
    return this.page
      .locator('#sounds-panel .sounds-panel-folder-row')
      .nth(index);
  }

  /**
   * Locator for a sounds panel sound row by index.
   *
   * @param index - zero-based row index
   */
  soundsSoundRow(index: number): Locator {
    return this.page
      .locator('#sounds-panel .sounds-panel-sound-row')
      .nth(index);
  }

  /**
   * Press Escape to dismiss the sounds panel and wait for it to be hidden.
   */
  async dismissSoundsPanel(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.soundsPanel).toBeHidden();
  }

  /** Click the Dancer phase tab. */
  async clickDancerTab(): Promise<void> {
    await this.page.locator('#tab-button-Dancer').click();
  }

  /** Click the Music phase tab. */
  async clickMusicTab(): Promise<void> {
    await this.page.locator('#tab-button-Music').click();
  }

  /** Click the Dance phase tab. */
  async clickDanceTab(): Promise<void> {
    await this.page.locator('#tab-button-Dance').click();
  }

  /**
   * Wait for the share dialog to appear after the final continue on the last level.
   */
  async waitForShareDialog(): Promise<void> {
    await this.shareDialog.waitFor({state: 'visible', timeout: 30_000});
  }
}
