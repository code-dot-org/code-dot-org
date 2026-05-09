import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab — Template Backed Levels.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/template_backed.feature
 *
 * Levels 10 and 11 of lesson 18 in allthethingscourse are both backed by the
 * same template project.  Code written on one level persists when navigating
 * to the other.
 */

const LEVEL_10 =
  '/courses/allthethingscourse/units/1/lessons/18/levels/10?noautoplay=true';
const LEVEL_11 =
  '/courses/allthethingscourse/units/1/lessons/18/levels/11?noautoplay=true';

test.describe('App Lab — Template Backed Levels', () => {
  /**
   * Source: template_backed.feature — "Template backed level"
   *
   * Resets level 10 to the starting template, appends two code lines across
   * level 10 and 11, then returns to level 10 and verifies all three lines
   * (the original plus both appended) are present in the shared template code.
   */
  test(
    'code persists across levels sharing the same template',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);

      // -- Level 10 ----------------------------------------------------------

      await studentPage.goto(LEVEL_10);
      await applab.waitForReady();

      // Reset to the template starting state before asserting initial code.
      await applab.resetToStartingVersion();
      await applab.waitForReady();

      await expect(
        studentPage.locator('.projectTemplateWorkspaceIcon').first(),
      ).toBeVisible({timeout: 15_000});

      // Palette should have exactly 2 blocks for this restricted level.
      await expect(
        studentPage.locator('.droplet-palette-canvas > g'),
      ).toHaveCount(2, {timeout: 10_000});

      // Starting code from the template.
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe('turnRight(90);\n');

      // Append a line in text mode.
      await applab.ensureTextMode();
      await applab.appendCode('turnLeft(90);\n');
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe('turnRight(90);\nturnLeft(90);\n');

      await applab.run();
      await expect(studentPage.locator('.project_updated_at')).toContainText(
        'Saved',
        {timeout: 60_000},
      );

      // -- Level 11 (same template) ------------------------------------------

      await studentPage.goto(LEVEL_11);
      await applab.waitForReady();

      await expect(
        studentPage.locator('.projectTemplateWorkspaceIcon').first(),
      ).toBeVisible({timeout: 15_000});
      await expect(
        studentPage.locator('.droplet-palette-canvas > g'),
      ).toHaveCount(2, {timeout: 10_000});

      // Code saved on level 10 is visible here.
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe('turnRight(90);\nturnLeft(90);\n');

      await applab.ensureTextMode();
      await applab.appendCode('turnRight(10);\n');
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe('turnRight(90);\nturnLeft(90);\nturnRight(10);\n');
      await applab.run();

      // -- Back to level 10 --------------------------------------------------

      await studentPage.goto(LEVEL_10);
      await applab.waitForReady();

      await expect(
        studentPage.locator('.projectTemplateWorkspaceIcon').first(),
      ).toBeVisible({timeout: 15_000});

      // Working copy now contains all three lines.
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe('turnRight(90);\nturnLeft(90);\nturnRight(10);\n');
    },
  );
});
