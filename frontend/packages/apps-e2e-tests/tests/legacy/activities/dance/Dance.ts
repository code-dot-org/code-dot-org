import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for Dance Party — legacy Blockly + p5.js runtime.
 *
 * Two URL schemes in use:
 *   allthethingscourse lesson 37 — levels 1-4 (used by gotoLevel)
 *   dance/units/1/lessons/1 — levels 8, 12, 13 (used by gotoDanceCourseLevel)
 *
 * Extends LegacyBlocklyLab for the shared run/reset/congrats interface.
 * Adds the p5 loading barrier, age-gate dialog, AI modal block helpers,
 * and free-play project-save utilities.
 */
export class Dance extends LegacyBlocklyLab {
  /** Song-selector dropdown — `#song_selector`. */
  readonly songSelector: Locator;

  /** Finish button shown in free-play mode — `#finishButton`. */
  readonly finishButton: Locator;

  /** Reset/clear puzzle header button — `#clear-puzzle-header`. */
  readonly clearPuzzleHeader: Locator;

  /** Project share button — `.project_share`. */
  readonly projectShareButton: Locator;

  /** Saved-state indicator — `.project_updated_at`. */
  readonly projectUpdatedAt: Locator;

  /** AI modal header area — present while the AI modal is open. */
  readonly aiModalHeader: Locator;

  /** Use-effects button inside the AI modal. Visible once effects are generated. */
  readonly aiUseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.songSelector = page.locator('#song_selector');
    this.finishButton = page.locator('#finishButton');
    this.clearPuzzleHeader = page.locator('#clear-puzzle-header');
    this.projectShareButton = page.locator('.project_share');
    this.projectUpdatedAt = page.locator('.project_updated_at');
    this.aiModalHeader = page.locator('#ai-modal-header-area');
    this.aiUseButton = page.locator('#use-button');
  }

  /** Lesson 37 of allthethingscourse — used by LegacyBlocklyLab.gotoLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(37, level);
  }

  /**
   * Navigate to a standalone dance course level (dance/units/1/lessons/1).
   * Uses the protected navigate() hook from LegacyBlocklyLab.
   */
  async gotoDanceCourseLevel(level: number): Promise<void> {
    await this.navigate(labLevelUrl(1, level, 'dance'));
  }

  /**
   * Wait for the run button and for the p5 canvas loading barrier to clear.
   * Dance Party mounts the Blockly workspace before p5 finishes; #p5_loading
   * disappears once the p5 canvas is ready to accept interaction.
   */
  protected override async waitForInitialLoad(): Promise<void> {
    await this.runButton.waitFor({state: 'visible'});
    await this.page.locator('#p5_loading').waitFor({state: 'hidden'});
  }

  /**
   * Bypass the age-gate dialog then close the instructions overlay.
   * bypassAgeDialog() is a no-op when the dialog is absent.
   */
  protected override async dismissOptionalOverlays(): Promise<void> {
    await this.bypassAgeDialog();
    await super.dismissOptionalOverlays();
  }

  /**
   * Select the given age and submit the age-gate dialog.
   * Waits for the selector to be visible before interacting.
   * Mirrors `I select age N in the age dialog`.
   *
   * @param age - numeric age to select (e.g. 10, 13)
   */
  async selectAgeInDialog(age: number): Promise<void> {
    const ageSelector = this.page.locator('#uitest-age-selector');
    await ageSelector.waitFor({state: 'visible'});
    await ageSelector.selectOption(String(age));
    await this.page.locator('#uitest-submit-age').click();
  }

  /**
   * Select age 10 and submit the age-gate dialog, if present.
   * Mirrors `I bypass the age dialog` / `I select age 10 in the age dialog`.
   */
  async bypassAgeDialog(): Promise<void> {
    const ageSelector = this.page.locator('#uitest-age-selector');
    if (await ageSelector.isVisible()) {
      await ageSelector.selectOption('10');
      await this.page.locator('#uitest-submit-age').click();
    }
  }

  /**
   * Navigate to a Dance level as an anonymous user, leaving the age-gate
   * dialog visible for the caller to interact with. Closes the instructions
   * overlay but does NOT dismiss the age dialog.
   * Use in tests that need to assert on age-dialog behaviour.
   *
   * @param level - allthethingscourse lesson-37 level number
   */
  async gotoLevelAnonymous(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(this.buildLevelUrl(level));
    await this.waitForInitialLoad();
    // Dismiss instructions overlay only — age dialog stays for caller.
    await super.dismissOptionalOverlays();
  }

  /**
   * Close the instructions overlay (#overlay or [aria-label="Close"]).
   * Call after selectAgeInDialog() when the instructions overlay appears
   * after the age dialog is dismissed.
   */
  async dismissInstructions(): Promise<void> {
    await super.dismissOptionalOverlays();
  }

  /**
   * Assert both known PG-13 song option values are absent from #song_selector.
   * Values checked: `synthesize` (local) and `badhabit_stevelacy` (test-studio).
   * Mirrors `I do not see "X" option in the dropdown "#song_selector"`.
   */
  async expectPg13SongsFiltered(): Promise<void> {
    await expect(
      this.page.locator('#song_selector option[value="synthesize"]'),
    ).not.toBeAttached();
    await expect(
      this.page.locator('#song_selector option[value="badhabit_stevelacy"]'),
    ).not.toBeAttached();
  }

  /**
   * Assert at least one PG-13 song option value is present in #song_selector.
   * Mirrors `I see option "Synthesize" or "Steve Lacy - Bad Habit" in the dropdown`.
   */
  async expectPg13SongsAvailable(): Promise<void> {
    await expect(
      this.page
        .locator('#song_selector option[value="synthesize"]')
        .or(
          this.page.locator(
            '#song_selector option[value="badhabit_stevelacy"]',
          ),
        ),
    ).toBeAttached();
  }

  /**
   * Wait for Dance Party to be interactive after mid-test navigation.
   * Use after page.goto() within a test (e.g. lang switch) instead of gotoLevel.
   * Mirrors the waitForInitialLoad → dismissOptionalOverlays → waitForReady
   * sequence of navigate(), but without the session reset and URL goto that
   * the caller already performed.
   */
  async waitForDancePage(): Promise<void> {
    await this.waitForInitialLoad();
    await this.dismissOptionalOverlays();
    await this.waitForReady();
  }

  // --- Blockly workspace helpers ---

  /**
   * Append a block by type and id to the main Blockly workspace.
   * Mirrors `I add a "X" block with id "Y" to workspace` from blockly.rb.
   */
  async appendBlock(type: string, id: string): Promise<void> {
    await this.page.evaluate(
      ({type, id}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockly = (window as any).Blockly;
        blockly.serialization.blocks.append(
          {type, id},
          blockly.getMainWorkspace(),
        );
      },
      {type, id},
    );
  }

  /**
   * Connect block `fromId` into the statement input of block `toId`.
   * Mirrors `I connect block "X" inside block "Y"` (connect_block_statement):
   *   targetBlock.inputList[1].connection.connect(blockToMove.previousConnection)
   *
   * Index 1 is the statement-input slot on Dancelab_whenSetup and
   * Dancelab_atTimestamp — if the block type changes, verify this index.
   */
  async connectBlockInside(fromId: string, toId: string): Promise<void> {
    await this.page.evaluate(
      ({fromId, toId}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workspace = (window as any).Blockly.getMainWorkspace();
        const blockToMove = workspace.getBlockById(fromId);
        const targetBlock = workspace.getBlockById(toId);
        targetBlock.inputList[1].connection.connect(
          blockToMove.previousConnection,
        );
      },
      {fromId, toId},
    );
  }

  /**
   * Dispatch pointerdown + pointerup on the first element matching `selector`.
   * Mirrors `I click block field "selector"` — dispatches pointer events on
   * Blockly SVG editable fields to open their associated editor.
   */
  async clickBlockField(selector: string): Promise<void> {
    await this.page.evaluate(sel => {
      const el = document.querySelector(sel);
      el?.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
      el?.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
    }, selector);
  }

  /**
   * Wait until the song selector has a non-empty value.
   * Mirrors `I wait for the song selector to load` from dance.rb.
   */
  async waitForSongSelector(): Promise<void> {
    await this.page.waitForFunction(
      () =>
        !!(document.querySelector('#song_selector') as HTMLSelectElement)
          ?.value,
    );
  }

  /**
   * Return the current workspace block XML via __TestInterface.
   * Mirrors `current_block_xml` helper from blockly.rb.
   */
  async getBlockXML(): Promise<string> {
    return this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).__TestInterface.getBlockXML(),
    );
  }

  /**
   * Dispose a block from the workspace by its data-id.
   * Used in free-play save tests to create a non-default code state.
   * Mirrors `I drag block "X" to offset "-2000, 0"` (off-screen deletion).
   */
  async disposeBlock(blockId: string): Promise<void> {
    await this.page.evaluate(id => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.getMainWorkspace().getBlockById(id)?.dispose();
    }, blockId);
  }

  /**
   * Dismiss the "Are you sure?" confirmation dialog that appears after
   * clicking #clear-puzzle-header (Start Over). Clicks #confirm-button.
   */
  async confirmStartOver(): Promise<void> {
    await this.page.locator('#confirm-button').click();
  }

  /**
   * Wait for a project save triggered by Share button click.
   * The Share save is asynchronous with no DOM completion signal; a brief
   * settled wait is required before reloading to avoid a stale-state read.
   * TODO: replace once the save API exposes a reliable DOM indicator.
   */
  async waitForProjectSave(): Promise<void> {
    await this.page.waitForTimeout(500);
  }

  // --- AI modal interaction methods ---

  /**
   * Open the Dance AI modal by dispatching pointer events on the Dancelab_ai
   * editable field inside the setup block. This is the canonical entry point
   * used by all Dance AI tests.
   */
  async openAiModal(): Promise<void> {
    await this.clickBlockField(
      "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableField",
    );
  }

  /**
   * Click one or more emoji buttons in the AI modal picker.
   * Direct Playwright clicks are required — React 17 uses root-container event
   * delegation, so jQuery synthetic events do not reach portal listeners.
   *
   * @param emojis - emoji characters matching the buttons' aria-label attributes
   */
  async selectAiEmojis(...emojis: string[]): Promise<void> {
    for (const emoji of emojis) {
      await this.page.locator(`[aria-label="${emoji}"]`).click();
    }
  }

  /**
   * Click Generate and wait for the Use button to confirm effects are ready.
   * Mirrors `I click the generate button` + `I see the use button`.
   */
  async generateAiEffects(): Promise<void> {
    await this.page.locator('#generate-button').click();
    await expect(this.aiUseButton).toBeVisible();
  }

  /**
   * Click Use to apply generated effects and wait for the modal to close.
   * Mirrors `I click the use button`.
   */
  async useAiEffects(): Promise<void> {
    await this.aiUseButton.click();
    await expect(this.aiModalHeader).not.toBeVisible();
  }

  /**
   * Click Regenerate and wait for the Use button to confirm new effects are ready.
   * Mirrors `I click the regenerate button`.
   */
  async regenerateAiEffects(): Promise<void> {
    await this.page.locator('#regenerate-button').click();
    await expect(this.aiUseButton).toBeVisible();
  }

  /**
   * Click Start Over to clear the current AI effect selection.
   * Mirrors `I click the start over button`.
   */
  async startOverAi(): Promise<void> {
    await this.page.locator('#start-over-button').click();
  }

  /**
   * Toggle the AI modal from effects view to code view.
   * Mirrors `I click the toggle code button`.
   */
  async toggleAiCodeView(): Promise<void> {
    await this.page.locator('#toggle-code-button').click();
  }

  /**
   * Toggle the AI modal from code view back to effects view.
   * Mirrors `I click the toggle effect button`.
   */
  async toggleAiEffectView(): Promise<void> {
    await this.page.locator('#toggle-effect-button').click();
  }

  /**
   * Open the AI explanation panel and wait for it to become visible.
   * Mirrors `I click the explanation button`.
   */
  async openAiExplanation(): Promise<void> {
    await this.page.locator('#explanation-button').click();
    await expect(this.page.locator('#explanation-area')).toBeVisible();
  }

  /**
   * Close the AI explanation panel and wait for it to be hidden.
   * Mirrors `I click the leave explanation button`.
   */
  async closeAiExplanation(): Promise<void> {
    await this.page.locator('#leave-explanation-button').click();
    await expect(this.page.locator('#explanation-area')).not.toBeVisible();
  }

  /**
   * Convert AI-generated effects to blocks and wait for the modal to close.
   * Mirrors `I click the convert button`.
   */
  async convertAiToBlocks(): Promise<void> {
    await this.page.locator('#convert-button').click();
    await expect(this.aiModalHeader).not.toBeVisible();
  }
}
