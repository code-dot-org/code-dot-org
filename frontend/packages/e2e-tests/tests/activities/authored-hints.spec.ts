import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';

test.describe('Authored Hints', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/authored_hints.feature "View Authored Hints"
   */
  test('View Authored Hints', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);

    await lab.gotoLevel({lesson: 6, level: 2});

    // Lightbulb shown, badge shows 3. (toHaveText alone passes for hidden
    // nodes, so assert visibility too.)
    await expect(lab.hints.lightbulb).toBeVisible();
    await expect(lab.hints.hintCount).toBeVisible();
    await expect(lab.hints.hintCount).toHaveText('3');

    // View the first hint
    await lab.hints.viewNext();
    await expect(lab.instructionsPanel).toContainText(
      'This is the first hint.',
    );
    await expect(lab.instructionsPanel).toContainText(
      'It has some basic markup',
    );
    await expect(lab.hints.hintCount).toBeVisible();
    await expect(lab.hints.hintCount).toHaveText('2');

    // View the second hint — contains an image
    await lab.hints.viewNext();
    await expect(lab.instructionsPanel).toContainText(
      'This is the second hint. It has a hint video.',
    );
    await expect(lab.hints.hintImage).toBeVisible();
    await expect(lab.hints.hintCount).toBeVisible();
    await expect(lab.hints.hintCount).toHaveText('1');

    // Wait for the hint image to fully load before proceeding
    await lab.hints.waitForImageLoad();

    // View the third and final hint — counter badge disappears from the DOM
    await lab.hints.viewNext();
    await expect(lab.instructionsPanel).toContainText(
      "This is the third and final hint. It doesn't have anything special.",
    );
    await expect(lab.hints.lightbulb).toBeVisible();
    await expect(lab.hints.hintCount).toHaveCount(0);

    // Clicking the lightbulb after hints are exhausted has no effect
    await lab.hints.clickLightbulb();
    await expect(lab.hints.yesButton).toHaveCount(0);
  });
});
