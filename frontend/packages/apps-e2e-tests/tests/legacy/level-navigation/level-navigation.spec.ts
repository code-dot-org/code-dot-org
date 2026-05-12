import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {expectPerfect, headerBubble} from '../../shared/progress';
import {dismissTeacherPanel} from '../../shared/ui';

/**
 * Continue button behaviour on external-video, markdown, and auto-success levels.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_navigation.feature
 *
 * Scenario 1 requires a teacher (teacher panel present on the level).
 * Scenarios 2–3 are anonymous.
 */

test.describe('Level navigation — continue button', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_navigation.feature
   * Scenario: External Video Level
   */
  test('external video level: submit navigates to unit overview', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/courses/allthethingscourse/units/1/lessons/55/levels/1');
    await page
      .locator('#teacher-panel-container')
      .waitFor({state: 'attached', timeout: 30_000});

    await dismissTeacherPanel(page);

    await page.locator('.video-download').waitFor({state: 'visible'});
    await page.locator('.submitButton').waitFor({state: 'visible'});

    await Promise.all([
      page.waitForNavigation(),
      page.locator('.submitButton').click(),
    ]);
    expect(page.url()).toContain('/courses/allthethingscourse/units/1');
    expect(page.url()).not.toMatch(/\/lessons\//);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_navigation.feature
   * Scenario: External Markdown Level
   */
  test('external markdown level: submit advances to next level', async ({
    page,
  }) => {
    await page.goto('/courses/allthethingscourse/units/1/lessons/21/levels/1');
    await page
      .locator('.submitButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await Promise.all([
      page.waitForNavigation(),
      page.locator('.submitButton').click(),
    ]);
    expect(page.url()).toContain('/lessons/21/levels/2');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_navigation.feature
   * Scenario: Complete an auto-success level signed-out, continue, the auto-success level should show up as completed
   */
  test('auto-success level: submit advances and level 14 shows as perfect', async ({
    page,
  }) => {
    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/14');
    await page
      .locator('.submitButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await Promise.all([
      page.waitForNavigation(),
      page.locator('.submitButton').click(),
    ]);
    expect(page.url()).toContain('/lessons/18/levels/15');

    // Level 14 should now show as perfect in the lesson header.
    await page
      .locator('.header_level')
      .waitFor({state: 'visible', timeout: 30_000});
    await expectPerfect(headerBubble(page, 14));
  });
});
