import {test} from '../../shared/fixtures';
import {
  expectNotTried,
  expectPerfect,
  headerBubble,
} from '../../shared/progress';

/**
 * Standalone video levels — lesson 34 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/standalone_video.feature
 *
 * Verifies that clicking the submit/continue button on a standalone video level
 * records "perfect" progress for that level slot.
 */

const LEVEL_URL = '/courses/allthethingscourse/units/1/lessons/34/levels/1';

test.describe('Standalone video', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/standalone_video.feature
   * Scenario: Progress is posted when continue is clicked
   */
  test('progress is posted when continue is clicked', async ({studentPage}) => {
    await studentPage.goto(LEVEL_URL);
    await studentPage
      .locator('.submitButton')
      .waitFor({state: 'visible', timeout: 30_000});

    // Before submitting the level should be not-tried.
    await expectNotTried(headerBubble(studentPage, 1));

    // Click submit (continue), which navigates to the next level.
    await Promise.all([
      studentPage.waitForNavigation(),
      studentPage.locator('.submitButton').click(),
    ]);

    // Return to the same level; progress bubble should now be perfect.
    await studentPage.goto(LEVEL_URL);
    await studentPage
      .locator('.submitButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await expectPerfect(headerBubble(studentPage, 1));
  });
});
