import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

test.describe('Hidden scripts and lessons', () => {
  /**
   * Migration status: SKIPPED
   * Source: dashboard/test/ui/features/teacher_tools/hidden_scripts_eyes.feature
   * Scenario: Hidden Scripts
   */
  test.skip('hidden scripts source scenario is skipped', async () => {
    test.skip(
      true,
      'Source Cucumber feature is tagged @skip and only contains Applitools checkpoints.',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/hidden_stages_eyes.feature
   * Scenario: Hidden Stages - lesson 2 hidden
   */
  test('teacher can hide lesson 2 and student sees the hidden lesson state', async ({
    page,
  }) => {
    const {
      teacherEmail,
      teacherPassword,
      studentEmail,
      studentPassword,
      sectionId,
    } = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'bobby',
    });

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
    );
    await expect(page.locator('.uitest-togglehidden').nth(1)).toBeVisible({
      timeout: 30_000,
    });
    await page
      .locator('.uitest-togglehidden')
      .nth(1)
      .locator('div', {hasText: 'Hidden'})
      .click();
    await expect(
      page.locator('.uitest-togglehidden').nth(1).getByText('Visible'),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "teacher overview with hidden lesson 2".

    await signIn(page, studentEmail, studentPassword);
    await page.goto(
      `/courses/allthethingscourse/units/1?section_id=${sectionId}`,
    );
    await expect(page.getByText('1. Jigsaw')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('2. Maze')).toBeHidden();
    // Visual checkpoint stub: "student overview with hidden lesson 2".

    await page.goto(
      `/courses/allthethingscourse/units/1/lessons/2/levels/2?section_id=${sectionId}`,
    );
    await expect(
      page.getByText(/not available|hidden|your teacher/i).first(),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "student lesson on hidden lesson 2".
  });
});
