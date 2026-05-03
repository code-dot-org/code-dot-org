import {type Locator, type Page} from '@playwright/test';

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

  /**
   * The `when_run_simple2` block in the workspace, identified by the
   * explicit `id="when-run-block"` set in the level startSources.
   */
  readonly whenRunBlock: Locator;

  constructor(page: Page) {
    super(page);
    this.runButton = page.locator('#run-button');
    this.timelineElement = page.locator('.timeline-element').first();
    this.whenRunBlock = page.locator("[data-id='when-run-block']");
    this.timeline = page.locator('#timeline');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(46, level) + '&library=intro2024';
  }

  /**
   * Music Lab is ready when the `when_run_simple2` block is visible in the
   * workspace. That block is assigned `id="when-run-block"` in the level
   * startSources, which Blockly surfaces as `data-id` on the SVG element.
   *
   * Note: Music Lab's flyout toolbox has no `.blocklyTreeRow` elements, so
   * `[data-id='when-run-block']` is the correct single ready signal.
   */
  protected async waitForReady(): Promise<void> {
    await this.whenRunBlock.waitFor({state: 'visible'});
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

  /** Clicks the run/stop button. */
  async run(): Promise<void> {
    await this.runButton.click();
  }
}
