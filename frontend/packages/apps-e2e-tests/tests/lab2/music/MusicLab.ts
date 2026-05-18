import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {Lab2Lab} from '../shared/Lab2Lab';

/**
 * Page Object for the Music Lab (lab2 architecture) — lesson 46 of
 * allthethingscourse. Appends `&library=intro2024` to avoid the pack-selection
 * dialog that blocks unauthenticated users.
 */
export class MusicLab extends Lab2Lab {
  /** Play/stop button — `#run-button` (note: not `#runButton` as in legacy). */
  readonly runButton: Locator;

  /**
   * Any `.timeline-element` node. Appears as soon as a sound block is
   * connected and the workspace auto-previews; disappears when workspace
   * is cleared to only the when-run block.
   */
  readonly timelineElement: Locator;

  /** The `#timeline` container — keyboard entry point for timeline navigation. */
  readonly timeline: Locator;

  /** Sounds picker panel opened from a play-sound Blockly field. */
  readonly soundsPanel: Locator;

  /**
   * The `when_run_simple2` block in the workspace, identified by the
   * explicit `id="when-run-block"` set in the level startSources.
   */
  readonly whenRunBlock: Locator;

  /** User-visible slow-load message shown while the lab shell is waiting. */
  readonly slowLoadMessage: Locator;

  /** Optional track picker shown on new Music projects before editing. */
  readonly trackPickerHeading: Locator;

  /** Button that dismisses the optional new-project track picker. */
  readonly skipTrackPickerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.runButton = page.locator('#run-button');
    this.timelineElement = page.locator('.timeline-element').first();
    this.whenRunBlock = page.locator("[data-id='when-run-block']");
    this.timeline = page.locator('#timeline');
    this.soundsPanel = page.locator('#sounds-panel');
    this.slowLoadMessage = page.getByText('This is taking longer than usual');
    this.trackPickerHeading = page.getByRole('heading', {
      name: 'Select a track',
    });
    this.skipTrackPickerButton = page.getByRole('button', {name: 'Skip'});
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(46, level) + '&library=intro2024';
  }

  /** Navigate to a new Music Lab project with the unrestricted intro library. */
  async gotoNewProject(): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto('/projects/music/new?library=intro2024');
    await this.dismissTrackPickerIfPresent();
    await this.waitForReady();
  }

  /**
   * Dismisses the optional new-project track picker.
   *
   * The picker and the Run button are mutually exclusive user-visible states:
   * either the project is ready to edit, or the modal must be skipped first.
   */
  async dismissTrackPickerIfPresent(): Promise<void> {
    await expect(
      this.trackPickerHeading.or(this.runButton).first(),
    ).toBeVisible({timeout: 120_000});

    if (await this.trackPickerHeading.isVisible()) {
      await expect(this.skipTrackPickerButton).toBeVisible({timeout: 30_000});
      await this.skipTrackPickerButton.click();
      await expect(this.trackPickerHeading).toBeHidden();
    }
  }

  /**
   * Music Lab is ready when the slow-load shell has cleared and the user can
   * see the run button and `when_run_simple2` block. The block is assigned
   * `id="when-run-block"` in the level startSources, which Blockly surfaces
   * as `data-id` on the SVG element.
   *
   * Note: Music Lab's flyout toolbox has no `.blocklyTreeRow` elements, so
   * `[data-id='when-run-block']` is the final Blockly-specific ready signal.
   */
  protected async waitForReady(): Promise<void> {
    await expect(this.slowLoadMessage).toBeHidden({timeout: 120_000});
    await expect(this.runButton).toBeVisible({timeout: 120_000});
    await this.whenRunBlock.waitFor({state: 'visible', timeout: 120_000});
  }

  /**
   * Loads a Blockly workspace state object into the Music Lab workspace via
   * the global `Blockly.serialization.workspaces.load()` API. This fires a
   * FINISHED_LOADING event that MusicView listens to, triggering `compileSong`
   * and the auto-preview timeline update.
   *
   * @param json Blockly workspace serialization object (with `blocks` and
   *   optionally `variables` keys — same format as `startSources.blocks` in
   *   the level config).
   */
  async loadBlocks(json: object): Promise<void> {
    await this.page.evaluate(blocksJson => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.serialization.workspaces.load(
        blocksJson,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.getMainWorkspace(),
      );
    }, json);
  }

  /**
   * Dispatch pointer events on a Blockly editable field.
   *
   * @param selector - CSS selector for the editable field
   */
  async clickBlockField(selector: string): Promise<void> {
    const field = this.page.locator(selector).first();
    await field.dispatchEvent('pointerdown', {bubbles: true});
    await field.dispatchEvent('pointerup', {bubbles: true});
  }

  /**
   * Select a sound from the open sounds panel by folder and sound row index.
   *
   * @param folderIndex - zero-based folder row index
   * @param soundIndex - zero-based sound row index
   */
  async selectSound(folderIndex: number, soundIndex: number): Promise<void> {
    await this.soundsPanel.waitFor({state: 'visible'});
    await this.page
      .locator('#sounds-panel .sounds-panel-folder-row')
      .nth(folderIndex)
      .click();
    await this.page
      .locator('#sounds-panel .sounds-panel-sound-row')
      .nth(soundIndex)
      .click();
  }

  /** Press Escape and wait for the sounds panel to close. */
  async dismissSoundsPanel(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.soundsPanel.waitFor({state: 'hidden'});
  }

  /** Clicks the run/stop button. */
  async run(): Promise<void> {
    await this.runButton.click();
  }
}
