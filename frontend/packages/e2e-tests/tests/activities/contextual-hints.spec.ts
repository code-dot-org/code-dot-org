import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';

test.describe('Contextual Hints', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/contextual_hints.feature "Blocks render in contextual hints"
   */
  test('Blocks render in contextual hints', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);

    await lab.gotoLevel({lesson: 6, level: 2});

    // Lightbulb visible before running (authored hints pre-loaded).
    await expect(lab.hints.lightbulb).toBeVisible();

    // Run the program — maze animation plays, then incorrect-solution feedback appears.
    await lab.runButton.click();
    await expect(lab.inlineFeedback).toBeVisible();

    // Feedback text and hint count update atomically after run.
    // U+2019 RIGHT SINGLE QUOTATION MARK in "aren’t"
    await expect(lab.inlineFeedback).toContainText(
      'Not quite. Try using a block you aren’t using yet.',
    ); // U+2019
    await expect(lab.hints.lightbulb).toBeVisible();
    await expect(lab.hints.hintCount).toBeVisible();
    await expect(lab.hints.hintCount).toHaveText('4');

    // Click lightbulb, confirm "Yes", reveal the authored hint with embedded block.
    await lab.hints.viewNext();

    // Instructions panel shows hint text and a Blockly block-space.
    await expect(lab.instructionsPanel).toContainText(
      'Try using a block like this to solve the puzzle.',
    );
    await expect(
      lab.instructionsPanel.locator('.block-space').first(),
    ).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/contextual_hints.feature "Contextual hints in level without Authored Hints"
   */
  test('Contextual hints in level without Authored Hints', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);

    await lab.gotoLevel({lesson: 3, level: 6});

    // No authored hints — lightbulb absent from the DOM before first run.
    await expect(lab.hints.lightbulb).toHaveCount(0);

    // Run the program — a contextual hint is generated on incorrect solution.
    await lab.runButton.click();
    await expect(lab.inlineFeedback).toBeVisible();
    await expect(lab.resetButton).toBeVisible();

    // Lightbulb appears with 1 contextual hint available.
    await expect(lab.hints.lightbulb).toBeVisible();
    await expect(lab.hints.hintCount).toBeVisible();
    await expect(lab.hints.hintCount).toHaveText('1');
  });
});
