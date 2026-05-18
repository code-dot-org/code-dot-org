import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for Minecraft: Hero's Journey (Craft) — lesson 25 of
 * allthethingscourse.
 *
 * Craft uses the same #runButton/#resetButton interface as legacy CSF labs but
 * drives a Phaser.js game engine. waitForInitialLoad waits for both the run
 * button and for the Phaser game to report ready via Craft.phaserLoaded().
 */
export class Craft extends LegacyBlocklyLab {
  /**
   * "Finish" button shown in the Minecraft completion modal.
   * Appears after the level program runs to completion.
   */
  readonly finishButton: Locator;

  /**
   * "Publish to project gallery" button in the finish dialog.
   * Present only when the user is signed in.
   */
  readonly publishToProjectGalleryButton: Locator;

  /**
   * "Save to project gallery" button in the finish dialog.
   * Present only when the user is signed in.
   */
  readonly saveToProjectGalleryButton: Locator;

  /** Initial Minecraft choice dialog header — `#getting-started-header`. */
  readonly gettingStartedHeader: Locator;

  /** Close button used by the character-selection dialog — `#x-close`. */
  readonly characterSelectCloseButton: Locator;

  /** Close button used by the house-selection dialog — `#close-house-select`. */
  readonly houseSelectCloseButton: Locator;

  /** OK button on the post-choice instructions dialog. */
  readonly instructionsOkButton: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.getByRole('button', {name: 'Finish'});
    this.publishToProjectGalleryButton = page.locator(
      '#publish-to-project-gallery-button',
    );
    this.saveToProjectGalleryButton = page.locator(
      '#save-to-project-gallery-button',
    );
    this.gettingStartedHeader = page.locator('#getting-started-header');
    this.characterSelectCloseButton = page.locator('#x-close');
    this.houseSelectCloseButton = page.locator('#close-house-select');
    this.instructionsOkButton = page.getByRole('button', {name: 'OK'});
  }

  /** Lesson 25 of allthethingscourse — used by LegacyBlocklyLab.gotoLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(25, level);
  }

  /**
   * Wait for the run button and for the Phaser game engine to finish loading.
   * Mirrors `I wait until the Minecraft game is loaded`:
   *   wait.until { browser.execute_script('return Craft?.phaserLoaded();') }
   */
  protected override async waitForInitialLoad(): Promise<void> {
    await this.runButton.waitFor({state: 'visible'});
    await this.waitForMinecraftLoaded();
  }

  /**
   * Wait for Craft's Phaser game engine readiness signal.
   *
   * Mirrors Cucumber's `I wait until the Minecraft game is loaded`, whose
   * Selenium step polls `Craft?.phaserLoaded()`.
   */
  async waitForMinecraftLoaded(): Promise<void> {
    await this.page.waitForFunction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => !!(window as any).Craft?.phaserLoaded(),
      {timeout: 60000},
    );
  }

  /**
   * Wait for the Finish button and click it to open the completion dialog.
   * Mirrors `I click selector "button:contains(Finish)" once I see it`.
   */
  async finish(): Promise<void> {
    await this.finishButton.waitFor({state: 'visible'});
    await this.finishButton.click();
  }

  /**
   * Navigate to a Minecraft Hour of Code level that begins with a modal dialog.
   *
   * These levels intentionally show a character/house-selection dialog before
   * the normal run button flow, so this bypasses LegacyBlocklyLab.navigate().
   *
   * @param level - level number in /courses/mc/units/1/lessons/1
   */
  async gotoMinecraftHourOfCodeDialogLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(
      `/courses/mc/units/1/lessons/1/levels/${level}?noautoplay=true&customSlowMotion=0.1`,
    );
    await this.gettingStartedHeader.waitFor({state: 'visible'});
  }

  /**
   * Drag a visible Blockly flyout block onto a visible workspace block using
   * native Playwright pointer movement.
   *
   * @param sourceClass - CSS class for the source block in the flyout
   * @param targetClass - CSS class for the target block in the workspace
   * @param targetDx - additional x offset from target origin
   * @param targetDy - additional y offset from target origin
   */
  async dragFlyoutBlockToWorkspaceBlock(
    sourceClass: string,
    targetClass: string,
    options: {
      expectedWorkspaceText?: RegExp;
      targetDx?: number;
      targetDy?: number;
    } = {},
  ): Promise<void> {
    const {expectedWorkspaceText, targetDx, targetDy} = options;

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.dragFlyoutBlockToWorkspaceBlockOnce(
        sourceClass,
        targetClass,
        targetDx,
        targetDy,
      );

      if (!expectedWorkspaceText) return;

      const workspaceUpdated = await expect(
        this.page.getByText(expectedWorkspaceText),
      )
        .toBeVisible({timeout: 1_500})
        .then(() => true)
        .catch(() => false);
      if (workspaceUpdated) return;
    }

    throw new Error(
      `Blockly drag from ${sourceClass} to ${targetClass} did not reach expected workspace state`,
    );
  }

  /**
   * Perform one native pointer drag attempt from a flyout block to a workspace block.
   *
   * @param sourceClass - CSS class for the source block in the flyout
   * @param targetClass - CSS class for the target block in the workspace
   * @param targetDx - additional x offset from target origin
   * @param targetDy - additional y offset from target origin
   */
  private async dragFlyoutBlockToWorkspaceBlockOnce(
    sourceClass: string,
    targetClass: string,
    targetDx?: number,
    targetDy?: number,
  ): Promise<void> {
    const source = this.page.locator(`.blocklyFlyout .${sourceClass}`).first();
    const target = this.page
      .locator(
        `.blocklySvg > .blocklyWorkspace > .blocklyBlockCanvas .${targetClass}`,
      )
      .first();

    await source.waitFor({state: 'visible'});
    await target.waitFor({state: 'visible'});

    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();
    if (!sourceBox || !targetBox) {
      throw new Error(
        `Could not measure Blockly drag from ${sourceClass} to ${targetClass}`,
      );
    }

    await this.page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await this.page.mouse.down();
    await this.page.mouse.move(
      targetBox.x + (targetDx ?? targetBox.width / 2),
      targetBox.y + (targetDy ?? targetBox.height / 2),
      {steps: 10},
    );
    await this.page.mouse.up();
  }
}
