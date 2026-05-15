import {type Page} from '@playwright/test';

import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {
  expectNotTried,
  expectPerfect,
  headerBubble,
} from '../../shared/progress';

/**
 * Multiple choice contained levels — lesson 41 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
 *
 * @eyes scenarios execute through the interaction points where Cucumber takes
 * Applitools snapshots; the visual assertions are stubbed with comments.
 * Two non-@eyes scenarios are also ported:
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

/**
 * Selects a contained multiple-choice answer and waits for the checked state.
 *
 * @param page - Playwright page on a contained multiple-choice level
 * @param index - answer index from the Cucumber selector
 */
async function selectAnswer(page: Page, index: number): Promise<void> {
  await page.locator(`#unchecked_${index}`).click();
  await expect(page.locator(`#checked_${index}`)).toBeVisible({
    timeout: 5_000,
  });
}

/**
 * Clicks Run and waits for the milestone POST that persists contained answers.
 * The visible run state can arrive before server persistence; reload checks
 * depend on the write being complete.
 *
 * @param page - Playwright page on a contained multiple-choice level
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
  await expect(page.locator('#resetButton')).toBeVisible({timeout: 15_000});
}

test.describe('Multiple choice contained levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
   * Scenario: GameLab with a submittable contained level
   */
  test('gamelab with submittable contained level reaches visual checkpoints', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page, {authorized: true});

    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/7');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});
    // Applitools snapshot stub: "initial load".

    await selectAnswer(page, 0);
    await expect(page.locator('#runButton')).toBeEnabled({timeout: 15_000});
    // Applitools snapshot stub: "answer entered".

    await runAndWaitForMilestone(page);
    // Applitools snapshot stub: "level run".

    await Promise.all([
      page.waitForURL(/\/lessons\/41\/levels\/8/, {timeout: 30_000}),
      page.locator('#submitButton, .submitButton').first().click(),
    ]);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
   * Scenario: Gamelab with multiple choice contained level
   */
  test('gamelab with multiple choice contained level reaches visual checkpoints', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page, {authorized: true});

    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/2');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});
    // Applitools snapshot stub: "initial load".

    await selectAnswer(page, 0);
    await expect(page.locator('#runButton')).toBeEnabled({timeout: 15_000});
    // Applitools snapshot stub: "answer entered".

    await runAndWaitForMilestone(page);
    // Applitools snapshot stub: "level run".

    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/2');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});
    await expect(page.locator('#checked_0')).toBeVisible({timeout: 5_000});
    // Applitools snapshot stub: "reloaded with contained level answered".

    await runAndWaitForMilestone(page);
    await page
      .locator('#finishButton')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#finishButton').click();
    // Applitools snapshot stub: "finished level with contained level".

    await Promise.all([
      page.waitForURL(/\/lessons\/41\/levels\/3/, {timeout: 30_000}),
      page.locator('#continue-button').click(),
    ]);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
   * Scenario: Unauthorized Teacher on CSF Maze with multiple choice contained level
   */
  test('unauthorized teacher can view a CSF contained multiple choice answer', async ({
    page,
  }) => {
    const {teacherEmail, teacherPassword, sectionId} =
      await createTeacherAssociatedStudent(page, {studentName: 'Sally'});
    await signIn(page, teacherEmail, teacherPassword);

    await page.goto(
      `/courses/ui-test-csf/units/1/lessons/1/levels/2?section_id=${sectionId}&viewAs=Instructor`,
    );
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});
    // Visual checkpoint stub: "initial load".

    await selectAnswer(page, 0);
    // Visual checkpoint stub: "answer entered".

    await page.locator('.uitest-teacherOnlyTab').first().click();
    await expect(
      page.locator('.editor-column').filter({hasText: 'Answer'}).first(),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "multiple choice answer for teacher".

    await page.locator('#runButton').click();
    await expect(page.locator('#resetButton')).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "level run".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
   * Scenario: Teacher can reset progress on multiple choice contained level
   */
  test('teacher can reset progress on multiple choice contained level', async ({
    page,
  }) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    // Sign in as the teacher.
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/2');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});

    // Select first answer option and run.
    await selectAnswer(page, 0);
    await runAndWaitForMilestone(page);
    await expectPerfect(headerBubble(page, 2));

    // Reset and delete answer — progress should revert to not-tried.
    await page.locator('#resetButton').click();
    await page
      .locator('button')
      .filter({hasText: /Delete Answer|Borrar respuesta/})
      .click();
    await expect(page.locator('#unchecked_0')).toBeVisible({timeout: 10_000});
    await expectNotTried(headerBubble(page, 2));

    // Re-select a different option and resubmit.
    await selectAnswer(page, 1);
    await runAndWaitForMilestone(page);
    await page.locator('#resetButton').click();
    await expectPerfect(headerBubble(page, 2));
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature
   * Scenario: Student can retry multiple choice contained level that allows multiple attempts
   */
  test('student can retry multiple choice contained level that allows multiple attempts', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page, {authorized: true});

    // Student (currently signed in) navigates to the retriable level.
    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/10');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 60_000});

    // First submission.
    await selectAnswer(page, 0);
    await runAndWaitForMilestone(page);
    await page.locator('#resetButton').click();
    await expectPerfect(headerBubble(page, 10));

    // Second submission — select a different option (retriable allows this).
    await selectAnswer(page, 1);
    await runAndWaitForMilestone(page);
    await page.locator('#resetButton').click();
    await expectPerfect(headerBubble(page, 10));

    // Reload — server should show the latest answer (option 1 checked).
    await page.goto('/courses/allthethingscourse/units/1/lessons/41/levels/10');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('#checked_1')).toBeVisible({timeout: 5_000});
  });
});
