import {expect, test} from '@playwright/test';

import {SpriteLab} from '../activities/spritelab/SpriteLab';

/**
 * Modal Function Editor — Blockly function creation/editing in SpriteLab.
 *
 * Source: dashboard/test/ui/features/code_tools/blockly/modal_function_editor.feature
 * Background: SpriteLab lesson 36 level 3 (allthethingscourse, noautoplay).
 *
 * Three scenarios:
 *   1. Can create a function — flyout block count increases from 1 to 2.
 *   2. Can edit a function — drag a sprite block into the editor; workspace has 4 blocks.
 *   3. (@chrome only) Can close the editor using the ESC key.
 *
 * Toolbox category IDs (blockly-1, blockly-a, etc.) are Blockly hex-counters that
 * vary per environment; use ARIA role selectors instead of IDs.
 */
test.describe('Modal Function Editor', () => {
  let lab: SpriteLab;

  test.beforeEach(async ({page}) => {
    lab = new SpriteLab(page);
    await lab.gotoLevel(3);
    // SpriteLab's p5 init can finish after runButton appears; wait for the
    // Blockly toolbox to render before proceeding.  Mirrors "I wait for 3 seconds"
    // in the Cucumber background.
    await page
      .getByRole('treeitem', {name: 'Functions'})
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
  });

  test('can create a function', async ({page}) => {
    const functionsCategory = page
      .getByRole('treeitem', {name: 'Functions'})
      .first();
    await expect(functionsCategory).toBeVisible();
    await expect(page.locator('#modalFunctionEditor')).toBeHidden();

    await functionsCategory.click();

    // Flyout starts with 1 function block.
    const flyoutCount: number = await page.evaluate(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.mainBlockSpace
          .getFlyout()
          .getWorkspace()
          .getTopBlocks().length as number,
    );
    expect(flyoutCount).toBe(1);

    // Click the "+" button in the flyout to open the modal function editor.
    await page.locator('.blocklyFlyoutButton').click();
    await page.locator('#modalFunctionEditor').waitFor({state: 'visible'});

    await page.locator('#closeModalFunctionEditor').click();

    // The new function is now in the toolbox alongside the original.
    await functionsCategory.click();
    const flyoutCountAfter: number = await page.evaluate(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.mainBlockSpace
          .getFlyout()
          .getWorkspace()
          .getTopBlocks().length as number,
    );
    expect(flyoutCountAfter).toBe(2);
  });

  test('can edit a function', async ({page}) => {
    // Click the edit button on block index 1 (2nd block), field row index 1.
    // Mirrors: Blockly.mainBlockSpace.getAllBlocks()[1].inputList[0].fieldRow[1].onClick()
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.mainBlockSpace
        .getAllBlocks()[1]
        .inputList[0].fieldRow[1].onClick();
    });
    await page.locator('#modalFunctionEditor').waitFor({state: 'visible'});

    // Open the Sprites flyout inside the modal function editor.
    await page
      .locator('#modalFunctionEditor')
      .getByRole('treeitem', {name: 'Sprites'})
      .first()
      .click();

    // Drag the first sprite block in the flyout by (40, 100) into the function workspace.
    const flyoutBlock = page
      .locator('#modalFunctionEditor .blocklyFlyout .blocklyDraggable')
      .first();
    await flyoutBlock.waitFor({state: 'visible'});
    const box = await flyoutBlock.boundingBox();
    if (!box) throw new Error('flyout block not found');
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 40, startY + 100, {steps: 10});
    await page.mouse.up();

    await page.locator('#closeModalFunctionEditor').click();
    await page.locator('#modalFunctionEditor').waitFor({state: 'hidden'});

    // Re-open the function editor.
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.mainBlockSpace
        .getAllBlocks()[1]
        .inputList[0].fieldRow[1].onClick();
    });
    await page.locator('#modalFunctionEditor').waitFor({state: 'visible'});

    // Function workspace should now have 4 blocks:
    // procedure definition, set-background, new sprite, and the location block.
    const editorBlockCount: number = await page.evaluate(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.getFunctionEditorWorkspace().getAllBlocks()
          .length as number,
    );
    expect(editorBlockCount).toBe(4);
  });

  test('can close the editor using the ESC key', async ({
    page,
    browserName,
  }) => {
    // @chrome only in the Cucumber suite.
    test.skip(
      browserName !== 'chromium',
      '@chrome — ESC key handler tested on Chromium only',
    );

    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.mainBlockSpace
        .getAllBlocks()[1]
        .inputList[0].fieldRow[1].onClick();
    });
    await page.locator('#modalFunctionEditor').waitFor({state: 'visible'});

    await page.keyboard.press('Escape');
    await page.locator('#modalFunctionEditor').waitFor({state: 'hidden'});
    await expect(page.locator('#modalFunctionEditor')).toBeHidden();
  });
});
