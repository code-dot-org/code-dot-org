import {
  createTeacher,
  createStudent,
  createSectionWithCourse,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Joining a section via /join — signed-out and signed-in paths.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/join_section_signup.feature
 */

test.describe('Join section signup', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/join_section_signup.feature
   * Scenario: Attempt to join section while signed out
   */
  test('signed-out user: /join shows sign-up link', async ({page}) => {
    await page.goto('/join');
    await page
      .locator('a:has-text("Create an account")')
      .waitFor({state: 'visible', timeout: 30_000});

    await page.locator('a:has-text("Create an account")').click();
    await page.waitForURL(/\/users\/sign_up\/account_type/, {timeout: 30_000});
    expect(page.url()).toContain('user_return_to=%2Fjoin');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/join_section_signup.feature
   * Scenario: Attempt to join section while signed in
   */
  test(
    'signed-in student: /join redirects to assigned course',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page);
      const {sectionCode} = await createSectionWithCourse(
        page,
        'allthethingscourse',
        1,
      );

      // Switch to a new student session on the same page.
      await createStudent(page);

      // Navigate to join page, submit form, wait for redirect chain through root to course.
      await page.goto(`/join/${sectionCode}`);
      await page
        .locator('#join_new_section')
        .waitFor({state: 'visible', timeout: 15_000});
      await Promise.all([
        page.waitForNavigation({timeout: 30_000}),
        page.locator('#join_new_section').click(),
      ]);
      await page.waitForURL(/\/courses\/allthethingscourse\/units\/1/, {
        timeout: 30_000,
      });
    },
  );
});
