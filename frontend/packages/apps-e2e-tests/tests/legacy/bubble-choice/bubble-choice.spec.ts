import type {Page} from '@playwright/test';

import {
  assignCourseAsStudent,
  createAuthorizedTeacher,
  createSectionWithCourse,
  createStudent,
  createTeacherAssociatedStudent,
  joinSection,
  signIn,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {expectNotTried, expectPerfect} from '../../shared/progress';

/**
 * BubbleChoice level type — lessons 40 and 52 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
 *
 * Scenario 3 ("Navigating between a Lab2 sublevel and another Lab2 level")
 * does not require the encryption key and is fully ported.
 */

const LAB2_BUBBLE_CHOICE_SUBLEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1';
const LAB2_BUBBLE_CHOICE_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/52/levels/8';

interface AiChatTeacherStudentPair {
  teacherEmail: string;
  teacherPassword: string;
}

/**
 * Creates the same teacher/student relationship as the source scenario, but
 * assigns the section through the test endpoint that enables AI Chat.  The
 * Lab2 BubbleChoice sublevel is AI Chat-backed, so the visible readiness
 * signal is the enabled `#lab2-aichat` pane rather than the disabled-teacher
 * message.
 *
 * @param page - Playwright page whose context receives each session
 * @returns teacher credentials for switching back after student completion
 */
async function createAiChatEnabledTeacherAssociatedStudent(
  page: Page,
): Promise<AiChatTeacherStudentPair> {
  const {email: teacherEmail, password: teacherPassword} =
    await createAuthorizedTeacher(page);
  await page.goto('/home');
  const {sectionCode} = await createSectionWithCourse(
    page,
    'allthethingscourse',
    1,
    {aiChatEnabled: true},
  );
  await createStudent(page, {name: 'Alice'});
  await joinSection(page, sectionCode);

  return {teacherEmail, teacherPassword};
}

/**
 * Closes the instructions dialog when it appears.  Some authenticated lab
 * loads reuse the previous dismissed state, so absence is acceptable.
 *
 * @param page - Playwright page on a Lab2 sublevel
 */
async function closeInstructionsDialogIfPresent(page: Page): Promise<void> {
  const closeDialog = page.locator('#ui-close-dialog');
  await closeDialog.waitFor({state: 'visible', timeout: 10_000}).catch(() => {
    /* dialog may already be dismissed */
  });
  if (await closeDialog.isVisible()) {
    await closeDialog.click();
    await closeDialog.waitFor({state: 'hidden', timeout: 10_000});
  }
}

/**
 * Completes the Lab2 BubbleChoice sublevel as a student.  The visible
 * readiness signal is an enabled AI Chat lab pane; the legacy instructions
 * continue button sometimes sits under the faded dialog overlay, so activation
 * uses the DOM click only after the visible button and enabled lab state are
 * both asserted.
 *
 * @param page - Playwright page signed in as the student
 */
async function completeLab2BubbleChoiceSublevel(page: Page): Promise<void> {
  await page.goto(LAB2_BUBBLE_CHOICE_SUBLEVEL_URL);
  await closeInstructionsDialogIfPresent(page);
  await expect(page.locator('#lab2-aichat')).toBeVisible({timeout: 30_000});
  await expect(
    page.getByText(
      'Your teacher has not enabled this tool. Check with your teacher if you think this is an error.',
    ),
  ).not.toBeVisible();

  const continueButton = page.locator('#instructions-continue-button');
  await expect(continueButton).toBeVisible({timeout: 15_000});
  await continueButton.evaluate(element => (element as HTMLElement).click());

  await page.waitForURL(
    /\/courses\/allthethingscourse\/units\/1\/lessons\/52\/levels\/8(?:\?.*)?$/,
    {timeout: 30_000},
  );
}

test.describe('BubbleChoice — progress tracking', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
   * Scenario: Viewing BubbleChoice progress
   */
  test('viewing BubbleChoice progress', {tag: '@no_mobile'}, async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {studentName: 'Alice'});
    await assignCourseAsStudent(page, 'allthethingscourse', {
      teacherEmail,
      sectionName: 'New Section',
    });

    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/40/levels/1/sublevel/1',
    );

    const submitButton = page.locator('.submitButton');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await page.waitForURL(/\/lessons\/40\/levels\/1/);
    const activityBubble = page
      .locator('.uitest-bubble-choice')
      .first()
      .locator('.progress-bubble')
      .first();
    await expectPerfect(activityBubble);
    await expect(page).toHaveURL(
      /\/courses\/allthethingscourse\/units\/1\/lessons\/40\/levels\/1/,
    );

    await signIn(page, teacherEmail, teacherPassword);

    await page.goto('/courses/allthethingscourse/units/1');
    await expect(
      page.getByRole('heading', {name: 'All the Things!'}),
    ).toBeVisible();
    await expect(page.getByText('Lesson 40: Bubble Choice')).toBeVisible();
    await page
      .getByRole('combobox', {name: 'Select a student'})
      .selectOption({label: 'Alice'});
    await expect(page).toHaveURL(/user_id=/);

    const lessonProgressBubble = page
      .locator('#progress-lesson-40 .progress-bubble')
      .first();
    await expectPerfect(lessonProgressBubble);

    await page.goto('/courses/allthethingscourse/units/1/lessons/40/levels/1');
    await expect(page.locator('.teacher-panel')).toBeVisible();

    const teacherActivityBubble = page
      .locator('.uitest-bubble-choice')
      .first()
      .locator('.progress-bubble')
      .first();
    await expectNotTried(teacherActivityBubble);

    await page.locator('.uitest-sectionselect').selectOption({
      label: 'New Section',
    });
    await expect(
      page.getByRole('link', {name: 'View Teacher Dashboard'}),
    ).toBeVisible();
    await expect(page.locator('.teacher-panel td').nth(1)).toContainText(
      'Alice',
    );
    await page.locator('.teacher-panel td').nth(1).click();
    await expectPerfect(teacherActivityBubble);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
   * Scenario: Lab2 BubbleChoice progress
   */
  test('Lab2 BubbleChoice progress', async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createAiChatEnabledTeacherAssociatedStudent(page);

    await completeLab2BubbleChoiceSublevel(page);

    const activityBubble = page
      .locator('.uitest-bubble-choice')
      .first()
      .locator('.progress-bubble')
      .first();
    await expectPerfect(activityBubble);
    await expect(page).toHaveURL(
      new RegExp(`${LAB2_BUBBLE_CHOICE_LEVEL_URL}$`),
    );

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);

    await page.goto('/courses/allthethingscourse/units/1');
    await expect(
      page.getByRole('heading', {name: 'All the Things!'}),
    ).toBeVisible();
    await page
      .getByRole('combobox', {name: 'Select a student'})
      .selectOption({label: 'Alice'});
    await expect(page).toHaveURL(/user_id=/);
    await expect(
      page.getByRole('row', {name: /52\. Lab2 Showcase/}),
    ).toBeVisible();
    const lessonProgressBubble = page
      .locator('a[href*="/lessons/52/levels/8"]')
      .first()
      .locator('.progress-bubble');
    await expectPerfect(lessonProgressBubble);

    await page.goto(LAB2_BUBBLE_CHOICE_LEVEL_URL);
    await expect(page.locator('.teacher-panel')).toBeVisible();
    await page.locator('.uitest-sectionselect').selectOption({
      label: 'New Section',
    });
    const teacherActivityBubble = page
      .locator('.uitest-bubble-choice')
      .first()
      .locator('.progress-bubble')
      .first();
    await expectNotTried(teacherActivityBubble);
    await page
      .locator('.teacher-panel table td')
      .filter({hasText: 'Alice'})
      .click();
    await expectPerfect(teacherActivityBubble);

    await page.goto(LAB2_BUBBLE_CHOICE_SUBLEVEL_URL);
    await closeInstructionsDialogIfPresent(page);
    await expect(page.locator('.teacher-panel')).toBeVisible();
    await page.locator('.uitest-sectionselect').selectOption({
      label: 'New Section',
    });
    const teacherPanelBubble = page
      .locator('.teacher-panel .progress-bubble')
      .first();
    await expectNotTried(teacherPanelBubble);
    await page
      .locator('.teacher-panel table td')
      .filter({hasText: 'Alice'})
      .click();
    await expect(page.locator('#lab2-aichat')).toBeVisible({timeout: 30_000});
    await expectPerfect(teacherPanelBubble);
  });
});

// ─── Scenario 3 — navigate between Lab2 sublevel and another Lab2 level ──────

test.describe('BubbleChoice — Lab2 sublevel navigation', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
   * Scenario: Navigating between a Lab2 sublevel and another Lab2 level
   */
  test('navigating from Lab2 sublevel to another level and back', async ({
    page,
  }) => {
    // Source: bubble_choice.feature "Navigating between a Lab2 sublevel and another Lab2 level"
    await createTeacherAssociatedStudent(page);

    // Navigate to Lab2 BubbleChoice sublevel.
    await page.goto(LAB2_BUBBLE_CHOICE_SUBLEVEL_URL);

    // Dismiss the instructions dialog if it appears.
    const closeBtn = page.locator('#ui-close-dialog');
    await closeBtn.waitFor({state: 'visible', timeout: 10_000}).catch(() => {
      /* dialog may not appear */
    });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await closeBtn.waitFor({state: 'hidden', timeout: 10_000});
    }

    // Click the 6th progress bubble (0-indexed :eq(5)) to navigate to
    // another Lab2 level (panels — lesson 52 level 6).
    await page.locator('.progress-bubble').nth(5).click();
    await page
      .locator('#lab2-panels')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page).toHaveURL(
      /\/courses\/allthethingscourse\/units\/1\/lessons\/52\/levels\/6/,
    );

    // Navigate back — should return to the sublevel.
    await page.goBack();
    await page
      .locator('#lab2-aichat')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page).toHaveURL(
      /\/courses\/allthethingscourse\/units\/1\/lessons\/52\/levels\/8\/sublevel\/1/,
    );
  });
});
