import {
  assignCourseAsStudent,
  createTeacherAssociatedStudent,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {expectNotTried, expectPerfect} from '../../shared/progress';

/**
 * BubbleChoice level type — lessons 40 and 52 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
 *
 * Scenarios 1 and 2 are tagged @properties_encryption_key — they require a
 * server-side encryption key not present in the test environment and are
 * therefore marked fixme.
 *
 * Scenario 3 ("Navigating between a Lab2 sublevel and another Lab2 level")
 * does not require the encryption key and is fully ported.
 */

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
   * Migration status: PENDING
   * Source: dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
   * Scenario: Lab2 BubbleChoice progress
   */
  test.fixme(
    'Lab2 BubbleChoice progress (@properties_encryption_key required)',
    async () => {},
  );
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
    const sublevelUrl =
      '/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1';
    await page.goto(sublevelUrl);

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
