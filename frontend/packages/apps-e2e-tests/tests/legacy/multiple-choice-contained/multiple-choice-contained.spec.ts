import {expect, test} from '../../shared/fixtures';
import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expectNotTried, expectPerfect, headerBubble} from '../../shared/progress';

/**
 * Multiple choice contained levels — lesson 41 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
 *
 * @eyes scenarios are skipped (Applitools not available).  Two non-@eyes
 * scenarios are ported:
 *
 * 1. "Teacher can reset progress on multiple choice contained level" — teacher
 *    selects an answer, runs, verifies progress, then deletes the answer and
 *    confirms the level reverts to not-tried.
 *
 * 2. "Student can retry multiple choice contained level that allows multiple
 *    attempts" — student submits twice with different answers; second answer
 *    persists on reload.
 *
 * Background: authorized teacher-associated student; browser signed in as the
 * student after setup.
 */

test.describe('Multiple choice contained levels', () => {
  test(
    'teacher can reset progress on multiple choice contained level',
    async ({page}) => {
      // Source: multiple_choice_contained_levels.feature
      // "Teacher can reset progress on multiple choice contained level"
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {authorized: true});

      // Sign in as the teacher.
      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/41/levels/2',
      );
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      // Select first answer option and run.
      await page.locator('#unchecked_0').click();
      await expect(page.locator('#checked_0')).toBeVisible({timeout: 5_000});
      await page.locator('#runButton').click();
      await expectPerfect(headerBubble(page, 2));

      // Reset and delete answer — progress should revert to not-tried.
      await page.locator('#resetButton').click();
      await page.locator('button', {hasText: 'Delete Answer'}).click();
      await expect(page.locator('#unchecked_0')).toBeVisible({timeout: 10_000});
      await expectNotTried(headerBubble(page, 2));

      // Re-select a different option and resubmit.
      await page.locator('#unchecked_1').click();
      await expect(page.locator('#checked_1')).toBeVisible({timeout: 5_000});
      await page.locator('#runButton').click();
      await page.locator('#resetButton').click();
      await expectPerfect(headerBubble(page, 2));
    },
  );

  test(
    'student can retry multiple choice contained level that allows multiple attempts',
    async ({page}) => {
      // Source: multiple_choice_contained_levels.feature
      // "Student can retry multiple choice contained level that allows multiple attempts"
      await createTeacherAssociatedStudent(page, {authorized: true});

      // Student (currently signed in) navigates to the retriable level.
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/41/levels/10',
      );
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      // First submission.
      await page.locator('#unchecked_0').click();
      await expect(page.locator('#checked_0')).toBeVisible({timeout: 5_000});
      await page.locator('#runButton').click();
      await page.locator('#resetButton').click();
      await expectPerfect(headerBubble(page, 10));

      // Second submission — select a different option (retriable allows this).
      await page.locator('#unchecked_1').click();
      await expect(page.locator('#checked_1')).toBeVisible({timeout: 5_000});
      await page.locator('#runButton').click();
      await page.locator('#resetButton').click();
      await expectPerfect(headerBubble(page, 10));

      // Reload — server should show the latest answer (option 1 checked).
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/41/levels/10',
      );
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('#checked_1')).toBeVisible({timeout: 5_000});
    },
  );
});
