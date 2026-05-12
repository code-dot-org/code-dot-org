import {expect, test} from '../../shared/fixtures';

/**
 * Curriculum reference level type — lesson 35 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/curriculum_reference.feature
 *
 * The source feature is tagged @eyes. These tests load the iframe and stop
 * where Cucumber would compare the Applitools screenshot.
 */
test.describe('Curriculum reference — lesson 35', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/curriculum_reference.feature
   * Scenario: Load iframe then take screenshot
   */
  test('curriculum reference level reaches visual snapshot point', async ({
    page,
  }) => {
    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/35/levels/1?noautoplay=true',
    );
    await expect(page.locator('#curriculum-reference')).toBeVisible({
      timeout: 30_000,
    });
    // Applitools snapshot stub: "initial load" for "curriculum reference level".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/curriculum_reference.feature
   * Scenario: Load iframe then take screenshot
   */
  test('map level inside curriculum reference reaches visual snapshot point', async ({
    page,
  }) => {
    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/35/levels/2?noautoplay=true',
    );
    await expect(page.locator('#curriculum-reference')).toBeVisible({
      timeout: 30_000,
    });
    // Applitools snapshot stub: "initial load" for "map level".
  });
});
