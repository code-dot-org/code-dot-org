import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';
import {
  expectCodeStudioHeaderReady,
  waitForStableVisualLayout,
} from '../../shared/visualReadiness';

/** Page Object for Play Lab levels in the playlab course. */
export class PlayLab extends LegacyBlocklyLab {
  /** Finish button shown after running a freeplay level. */
  readonly finishButton: Locator;

  /** The Play Lab stage and controls column. */
  readonly visualizationColumn: Locator;

  /** The labelled Blockly workspace region. */
  readonly workspace: Locator;

  /**
   * Create a Play Lab page object.
   *
   * @param page - Playwright page for a Play Lab level
   */
  constructor(page: Page) {
    super(page);
    this.finishButton = page.locator('#finishButton');
    this.visualizationColumn = page.locator('#visualizationColumn');
    this.workspace = page.getByLabel('Blockly Workspace');
  }

  /**
   * Build a playlab course level URL.
   *
   * @param level - level number within Play Lab lesson 1
   */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level, 'playlab');
  }

  /**
   * Wait for Play Lab's first-run instructions, stage, and Blockly workspace
   * to reach their post-overlay visual layout before taking a screenshot.
   */
  async expectInitialVisualReady(): Promise<void> {
    await expect(this.runButton).toBeVisible({timeout: 30_000});
    await expectCodeStudioHeaderReady(this.page);
    await expect(this.page.locator('#overlay')).toBeHidden({timeout: 30_000});
    await expect(
      this.page.getByRole('button', {name: 'Instructions'}),
    ).toBeVisible({timeout: 30_000});
    await expect(this.instructionsPanel).toContainText('Create your own game', {
      timeout: 30_000,
    });
    await expect(this.visualizationColumn).toBeVisible({timeout: 30_000});
    await expect(this.page.getByText('Workspace', {exact: true})).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.workspace).toBeVisible({timeout: 30_000});
    await expect(this.workspace.locator('.blocklyBlockCanvas')).toContainText(
      'when run',
      {timeout: 30_000},
    );

    await waitForStableVisualLayout(this.page, [
      '#visualizationColumn',
      '.csf-top-instructions',
      '.blocklySvg',
      '.blocklyBlockCanvas',
    ]);
  }

  /** Click the freeplay finish button. */
  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * Press and hold a keyboard key for the duration of the current assertion.
   *
   * @param key - Playwright key name, for example ArrowLeft
   */
  async holdKey(key: string): Promise<void> {
    await this.page.keyboard.down(key);
  }

  /**
   * Release a previously held keyboard key.
   *
   * @param key - Playwright key name matching the held key
   */
  async releaseKey(key: string): Promise<void> {
    await this.page.keyboard.up(key);
  }
}
