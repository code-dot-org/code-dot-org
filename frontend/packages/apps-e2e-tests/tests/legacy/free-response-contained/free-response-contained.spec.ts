import {type Page} from '@playwright/test';

import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {
  expectNotTried,
  expectPerfect,
  headerBubble,
} from '../../shared/progress';

/**
 * Free response contained levels — lesson 41 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/free_response_contained_levels.feature
 *
 * @eyes scenarios execute through the interaction points where Cucumber takes
 * Applitools snapshots; the visual assertions are stubbed with comments. Two
 * non-@eyes scenarios are ported:
 *
 * 1. "Teacher can reset progress on free response contained level" — teacher
 *    enters a response, runs the level, verifies progress, then deletes the
 *    answer and verifies progress resets to not-tried.
 *
 * 2. "Student can attempt retriable free response contained level multiple
 *    times" — student submits twice; second submission text persists on reload.
 *
 * Background: authorized teacher-associated student; browser signed in as the
 * student after setup.
 */

/**
 * Click Run and wait for the milestone POST that persists the response.
 * The visible run state can arrive before server persistence on these contained
 * levels; the reload assertion depends on the server write.
 *
 * @param page - Playwright page on a contained-response level
 */
async function runAndWaitForMilestone(page: Page): Promise<void> {
  const milestonePost = page.waitForResponse(
    response =>
      response.request().method() === 'POST' &&
      response.url().includes('/milestone/') &&
      response.ok(),
    {timeout: 30_000},
  );
  await page.locator('#runButton').click();
  await milestonePost;
}

test.describe('Free response contained levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/free_response_contained_levels.feature
   * Scenario: Applab with free response contained level
   */
  test('applab with free response contained level reaches visual checkpoints', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page, {authorized: true});

    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/15');
    await page
      .locator('.response')
      .waitFor({state: 'visible', timeout: 60_000});
    // Applitools snapshot stub: "initial load".

    await page.locator('.response').fill('This is my answer');
    await expect(page.locator('.response')).toHaveValue('This is my answer');
    // Applitools snapshot stub: "answer entered".

    await expect(page.locator('#runButton')).toBeEnabled({timeout: 15_000});
    await runAndWaitForMilestone(page);
    // Applitools snapshot stub: "level run".

    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/15');
    await page
      .locator('.response')
      .waitFor({state: 'visible', timeout: 60_000});
    await expect(page.locator('.response')).toHaveValue('This is my answer');
    // Applitools snapshot stub: "reloaded with contained level answered".

    await expect(page.locator('#runButton')).toBeEnabled({timeout: 15_000});
    await runAndWaitForMilestone(page);
    await page
      .locator('#finishButton')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#finishButton').click();
    // Applitools snapshot stub: "finished level with contained level".

    await page.locator('#continue-button').click();
    await page.waitForURL(/\/lessons\/18\/levels\/16/, {timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/free_response_contained_levels.feature
   * Scenario: Javalab with free response contained level
   */
  test('javalab with free response contained level reaches visual checkpoints', async ({
    page,
  }) => {
    test.slow();
    await createTeacherAssociatedStudent(page, {authorized: true});

    await page.goto('/courses/allthethingscourse/units/1/lessons/44/levels/6');
    await page
      .locator('.response')
      .waitFor({state: 'visible', timeout: 60_000});
    await page.locator('.response').scrollIntoViewIfNeeded();
    // Applitools snapshot stub: "initial load".

    await page.locator('.response').fill('This is my answer');
    await expect(page.locator('.response')).toHaveValue('This is my answer');
    // Applitools snapshot stub: "answer entered".

    await expect(page.locator('#runButton')).toBeEnabled({timeout: 15_000});
    await runAndWaitForMilestone(page);
    // Applitools snapshot stub: "level run".
    await expect(page.locator('.javalab-console')).toContainText('[JAVALAB]', {
      timeout: 30_000,
    });

    await page.goto('/courses/allthethingscourse/units/1/lessons/44/levels/6');
    await page
      .locator('.response')
      .waitFor({state: 'visible', timeout: 60_000});
    await expect(page.locator('.response')).toHaveValue('This is my answer');
    // Applitools snapshot stub: "reloaded with contained level answered".

    await expect(page.locator('#runButton')).toBeEnabled({timeout: 15_000});
    await runAndWaitForMilestone(page);
    // Applitools snapshot stub: "finished level with contained level".
  });

  test('teacher can reset progress on free response contained level', async ({
    page,
  }) => {
    // Source: free_response_contained_levels.feature
    // "Teacher can reset progress on free response contained level"
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    // Sign in as the teacher.
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/3');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});

    // Enter a response and run the level.
    await page.locator('.response').fill('Here is my response!');
    await expect(page.locator('.response')).toHaveValue('Here is my response!');
    await runAndWaitForMilestone(page);
    await expect(page.locator('#resetButton')).toBeVisible({timeout: 15_000});
    await page.locator('#resetButton').click();
    await expectPerfect(headerBubble(page, 3));

    // Delete the answer — progress should revert to not-tried.
    await page.getByRole('button', {name: /Delete Answer/}).click();
    await expect(page.locator('.response')).toHaveValue('', {
      timeout: 10_000,
    });
    await expectNotTried(headerBubble(page, 3));

    // Re-enter and resubmit to confirm the flow works again.
    await page.locator('.response').fill('Here is my response!');
    await expect(page.locator('.response')).toHaveValue('Here is my response!');
    await runAndWaitForMilestone(page);
    await expect(page.locator('#resetButton')).toBeVisible({timeout: 15_000});
    await page.locator('#resetButton').click();
    await expectPerfect(headerBubble(page, 3));
  });

  test('student can attempt retriable free response contained level multiple times', async ({
    page,
  }) => {
    // Source: free_response_contained_levels.feature
    // "Student can attempt retriable free response contained level multiple times"
    await createTeacherAssociatedStudent(page, {authorized: true});

    // Student (currently signed in) navigates to the retriable level.
    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/9');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});

    // First submission.
    await page.locator('.response').fill('Here is my response!');
    await expect(page.locator('.response')).toHaveValue('Here is my response!');
    await runAndWaitForMilestone(page);
    await expect(page.locator('#resetButton')).toBeVisible({timeout: 15_000});
    await page.locator('#resetButton').click();
    await expectPerfect(headerBubble(page, 9));

    // Second submission with edited text (retriable level allows this).
    await page.locator('.response').pressSequentially(' edited');
    await expect(page.locator('.response')).toHaveValue(
      'Here is my response! edited',
    );
    await runAndWaitForMilestone(page);
    await expect(page.locator('#resetButton')).toBeVisible({timeout: 15_000});
    await page.locator('#resetButton').click();

    // Reload — server should remember the latest submission text.
    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/9');
    await page
      .locator('.response')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.response')).toHaveValue(
      'Here is my response! edited',
    );
    await expectPerfect(headerBubble(page, 9));
  });
});
