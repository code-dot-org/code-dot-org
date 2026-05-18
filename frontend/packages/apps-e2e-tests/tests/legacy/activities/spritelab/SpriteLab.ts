import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';
import {waitForStableVisualLayout} from '../../shared/visualReadiness';

/**
 * Page Object for Sprite Lab — p5.js + Blockly CSF activity.
 *
 * Uses allthethingscourse lesson 36.
 * Extends LegacyBlocklyLab for the shared run/reset/congrats interface.
 * Adds the p5 loading barrier, Blockly grid dropdown helpers, and the
 * Modal Function Editor interaction surface.
 */
export class SpriteLab extends LegacyBlocklyLab {
  /** Avatar sprite image shown on level load — `img[src*="spritelab/avatar"]`. */
  readonly spriteAvatarImage: Locator;

  /** Blockly field dropdown div — appears when a field editor is opened. */
  readonly dropdown: Locator;

  /** Modal function editor overlay — `#modalFunctionEditor`. */
  readonly modalFunctionEditor: Locator;

  /** Finish button — #finishButton — shown on free-play levels. */
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.spriteAvatarImage = page.locator('img[src*="spritelab/avatar"]');
    this.dropdown = page.locator('.blocklyDropDownDiv');
    this.modalFunctionEditor = page.locator('#modalFunctionEditor');
    this.finishButton = page.locator('#finishButton');
  }

  /** Lesson 36 of allthethingscourse — used by LegacyBlocklyLab.gotoLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(36, level);
  }

  /**
   * Wait for the run button and for the p5 canvas loading barrier to clear.
   * SpriteLab mounts the Blockly workspace before p5 finishes; #p5_loading
   * disappears once the p5 canvas is ready to accept interaction.
   */
  protected override async waitForInitialLoad(): Promise<void> {
    await this.runButton.waitFor({state: 'visible'});
    await this.page.locator('#p5_loading').waitFor({state: 'hidden'});
  }

  /**
   * Dispatch pointerdown + pointerup on the nth element matching selector.
   * Mirrors `I click block field "selector" number N` from blockly.rb:
   *   $("selector")[N].dispatchEvent(new PointerEvent('pointerdown', ...))
   * Opens Blockly field editors (color pickers, grid dropdowns, etc.)
   * on the targeted editable field.
   *
   * Uses locator.dispatchEvent() rather than evaluate() so that WebKit
   * receives correctly-formed PointerEvents via Playwright's event dispatch path.
   *
   * @param selector - CSS selector for the editable field elements
   * @param index - zero-based index into the NodeList of matching elements
   */
  async clickBlockFieldAt(selector: string, index: number): Promise<void> {
    const locator = this.page.locator(selector).nth(index);
    await locator.dispatchEvent('pointerdown', {bubbles: true});
    await locator.dispatchEvent('pointerup', {bubbles: true});
  }

  /**
   * Select the nth costume option on the `gamelab_makeNewSpriteAnon` block
   * via the Blockly JS API, bypassing the FieldGridDropdown UI.
   *
   * The FieldGridDropdown open animation briefly detaches and reattaches
   * grid items; Playwright's stability check turns those detach events into
   * retry signals and times out in some browsers. Direct field mutation is
   * equivalent to the Cucumber step "I select item N from the dropdown"
   * (which performs a Selenium WebDriver click on .blocklyFieldGridItem[N]).
   *
   * Waits for the block and its options to be present before setting the
   * value, since the animation library populates asynchronously on first load.
   *
   * @param index - zero-based index into the field's getOptions() list
   */
  async selectDropdownItem(index: number): Promise<void> {
    // Wait until the block exists and the costume field has real options.
    // Block: gamelab_createNewSprite id="make-new-sprite", field: COSTUME.
    // The fallback when animationList is empty is [['sprites missing','null']].
    await this.page.waitForFunction(
      ({blockId, fieldName, idx}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Blockly = (window as any).Blockly;
        if (!Blockly?.mainBlockSpace) return false;
        const block = Blockly.mainBlockSpace.getBlockById(blockId);
        if (!block) return false;
        const field = block.getField(fieldName);
        if (!field) return false;
        const options = field.getOptions(false);
        return (
          Array.isArray(options) &&
          options.length > idx &&
          options[idx][1] !== 'null'
        );
      },
      {blockId: 'make-new-sprite', fieldName: 'COSTUME', idx: index},
    );

    await this.page.evaluate(
      ({blockId, fieldName, idx}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Blockly = (window as any).Blockly;
        const block = Blockly.mainBlockSpace.getBlockById(blockId);
        const field = block.getField(fieldName);
        const options = field.getOptions(false);
        block.setFieldValue(options[idx][1], fieldName);
      },
      {blockId: 'make-new-sprite', fieldName: 'COSTUME', idx: index},
    );
  }

  // --- Modal Function Editor ---

  /**
   * Count of function blocks in the toolbox flyout.
   * Reads `Blockly.mainBlockSpace.getFlyout().getWorkspace().getTopBlocks().length`.
   */
  async getFlyoutFunctionCount(): Promise<number> {
    return this.page.evaluate(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.mainBlockSpace
          .getFlyout()
          .getWorkspace()
          .getTopBlocks().length as number,
    );
  }

  /**
   * Click the "+" flyout button to create a new function and open the editor.
   * Mirrors `I click the new function button`.
   */
  async openFunctionFromFlyoutButton(): Promise<void> {
    await this.page.locator('.blocklyFlyoutButton').click();
    await expect(this.modalFunctionEditor).toBeVisible();
  }

  /**
   * Open the modal function editor by clicking the edit field on a block.
   * Mirrors `I click block edit button` (fieldRow[1].onClick()).
   *
   * @param blockIndex - zero-based index into Blockly.mainBlockSpace.getAllBlocks()
   */
  async openFunctionEditorFromBlock(blockIndex: number): Promise<void> {
    await this.page.evaluate(idx => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blocks = (window as any).Blockly.mainBlockSpace.getAllBlocks();
      blocks[idx].inputList[0].fieldRow[1].onClick();
    }, blockIndex);
    await expect(this.modalFunctionEditor).toBeVisible();
  }

  /**
   * Close the modal function editor and wait for it to be hidden.
   * Mirrors `I close the modal function editor`.
   */
  async closeFunctionEditor(): Promise<void> {
    await this.page.locator('#closeModalFunctionEditor').click();
    await expect(this.modalFunctionEditor).toBeHidden();
  }

  /**
   * Open a toolbox category inside the modal function editor.
   *
   * @param name - ARIA treeitem label (e.g. 'Sprites')
   */
  async openFunctionEditorCategory(name: string): Promise<void> {
    await this.modalFunctionEditor
      .getByRole('treeitem', {name})
      .first()
      .click();
  }

  /**
   * Locator for the nth draggable block in the modal function editor flyout.
   *
   * @param index - zero-based index
   */
  functionEditorFlyoutBlock(index: number): Locator {
    return this.modalFunctionEditor
      .locator('.blocklyFlyout .blocklyDraggable')
      .nth(index);
  }

  /**
   * Count of blocks in the function editor workspace.
   * Reads `Blockly.getFunctionEditorWorkspace().getAllBlocks().length`.
   */
  async getFunctionEditorBlockCount(): Promise<number> {
    return this.page.evaluate(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.getFunctionEditorWorkspace().getAllBlocks()
          .length as number,
    );
  }

  /**
   * Wait for the modal function editor to stop rendering selected Blockly
   * fields before a visual checkpoint.
   */
  async expectFunctionEditorVisualReady(): Promise<void> {
    await expect(this.modalFunctionEditor).toBeVisible();
    expect(await this.getFunctionEditorBlockCount()).toBe(4);
    await this.page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Blockly = (window as any).Blockly;
      Blockly?.hideChaff?.();
      Blockly?.WidgetDiv?.hide?.();
      Blockly?.DropDownDiv?.hideWithoutAnimation?.();
      Blockly?.common?.getSelected?.()?.unselect?.();
      Blockly?.selected?.unselect?.();
      Blockly?.getFunctionEditorWorkspace?.()?.hideChaff?.();
    });
    const editorBox = await this.modalFunctionEditor.boundingBox();
    if (editorBox) {
      await this.page.mouse.click(
        editorBox.x + editorBox.width - 40,
        editorBox.y + editorBox.height - 40,
      );
    }
    await waitForStableVisualLayout(this.page, ['#modalFunctionEditor']);
  }

  /**
   * Dynamic Blockly editable field in the newly dragged sprite block.
   *
   * The field text is deterministic, but its SVG editing surface can render
   * one frame apart after the drag gesture. The scenario asserts the block
   * exists before masking this narrow field for the visual checkpoint.
   */
  functionEditorLocationFieldVisualIgnoreRegions(): Locator[] {
    return [
      this.modalFunctionEditor
        .locator('.blocklyEditableText')
        .filter({hasText: '(200, 200)'}),
    ];
  }
}
