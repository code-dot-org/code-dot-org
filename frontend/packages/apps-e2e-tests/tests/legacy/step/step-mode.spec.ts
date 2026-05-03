import {expect, test} from '@playwright/test';

import {COMPLETE_STEP_BLOCKS, TWO_MOVE_FORWARD_BLOCKS} from './blocks';
import {StepModeLab} from './StepModeLab';

test.describe('Step Mode — level 1 (step only)', () => {
  let step: StepModeLab;

  test.beforeEach(async ({page}) => {
    step = new StepModeLab(page);
    await step.gotoLevel(1);
    await expect(step.runButton).toBeHidden();
    await expect(step.resetButton).toBeHidden();
    await expect(step.stepButton).toBeVisible();
    await expect(step.stepButton).toBeEnabled();
  });

  test('sequential steps advance highlighted block; second step disables step button', async () => {
    await step.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);

    // First step: startBlock becomes active, step button re-enables.
    await step.step();
    await expect(step.stepButton).toBeEnabled();
    await expect(step.resetButton).toBeVisible();
    await expect(step.blockLocator('startBlock')).toHaveClass(
      /blocklySelected/,
    );
    await expect(step.blockLocator('moveForward')).not.toHaveClass(
      /blocklySelected/,
    );

    // Second step: moveForward becomes active, step button disabled (no more blocks).
    await step.step();
    await expect(step.blockLocator('moveForward')).toHaveClass(
      /blocklySelected/,
    );
    await expect(step.blockLocator('startBlock')).not.toHaveClass(
      /blocklySelected/,
    );
    await expect(step.stepButton).toBeDisabled();
    await expect(step.resetButton).toBeVisible();

    // Reset: buttons return to initial state.
    await step.reset();
    await expect(step.runButton).toBeHidden();
    await expect(step.resetButton).toBeHidden();
    await expect(step.stepButton).toBeEnabled();
  });

  test('three steps complete the puzzle', async () => {
    await step.loadBlocks(COMPLETE_STEP_BLOCKS);

    await step.step();
    await expect(step.stepButton).toBeEnabled();
    await step.step();
    await expect(step.stepButton).toBeEnabled();
    await step.step();

    await expect(step.congratsMessage).toBeVisible();
    await expect(step.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 1.',
    );
  });

  test('reset after first step restores initial button state', async () => {
    await step.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);

    await step.step();
    await expect(step.stepButton).toBeEnabled();
    await expect(step.resetButton).toBeVisible();

    await step.reset();

    await expect(step.runButton).toBeHidden();
    await expect(step.resetButton).toBeHidden();
    await expect(step.stepButton).toBeEnabled();
  });
});

test.describe('Step Mode — level 2 (step and run)', () => {
  let step: StepModeLab;

  test.beforeEach(async ({page}) => {
    step = new StepModeLab(page);
    await step.gotoLevel(2);
    await expect(step.runButton).toBeVisible();
    await expect(step.resetButton).toBeHidden();
    await expect(step.stepButton).toBeVisible();
    await expect(step.stepButton).toBeEnabled();
  });

  test('step advances execution and hides run button; reset restores run button', async () => {
    await step.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);

    await step.step();
    await expect(step.stepButton).toBeEnabled();

    await expect(step.blockLocator('startBlock')).toHaveClass(
      /blocklySelected/,
    );
    await expect(step.blockLocator('moveForward')).not.toHaveClass(
      /blocklySelected/,
    );
    await expect(step.runButton).toBeHidden();
    await expect(step.resetButton).toBeVisible();

    await step.reset();

    await expect(step.runButton).toBeVisible();
    await expect(step.resetButton).toBeHidden();
  });

  test('run disables step button', async () => {
    await step.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);

    await step.run();

    await expect(step.stepButton).toBeDisabled();
    await expect(step.runButton).toBeHidden();
    await expect(step.resetButton).toBeVisible();
  });
});
