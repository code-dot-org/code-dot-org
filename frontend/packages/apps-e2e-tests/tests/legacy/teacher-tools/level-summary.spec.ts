import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Level Summary — teacher view of student free-response submissions.
 *
 * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
 * Scenario: "Check for Understanding summaries"
 *
 * The @eyes scenarios (Free Response 1-3, Multi level 1-2, Check for
 * Understanding summaries eyes) require Applitools and are not ported.
 * The @skip "Check free response AI" scenario is omitted.
 */

/**
 * Dismiss the teacher panel if it is currently expanded.
 * Mirrors `I dismiss the teacher panel` from steps.rb.
 *
 * @param page - Playwright page with a teacher panel present
 */
async function dismissTeacherPanel(
  page: import('@playwright/test').Page,
): Promise<void> {
  const hideHandle = page.locator('.show-handle .fa-chevron-left');
  if (await hideHandle.isVisible({timeout: 5_000}).catch(() => false)) {
    await hideHandle.click();
    await page
      .locator('.hide-handle .fa-chevron-right')
      .waitFor({state: 'visible', timeout: 10_000});
  }
}

test.describe(
  'Level Summary — Check for Understanding summaries',
  {tag: '@no_mobile'},
  () => {
    /**
     * Source: level_summary.feature
     * "Check for Understanding summaries"
     * @as_taught_student / teacher auth
     *
     * Student submits a free-response answer → teacher views summary →
     * verifies response visible, student name hidden by default → reveals
     * names → hides the response → confirms it no longer appears.
     */
    test('teacher can show/hide student names and hide responses in summary', async ({
      page,
    }) => {
      // Unique student name so name assertions are unambiguous.
      const studentName = `Sally_${Date.now()}`;

      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName,
        });

      // --- Student: submit free-response answer ---
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/27/levels/1/',
      );
      await page
        .locator('.free-response > textarea')
        .waitFor({state: 'visible', timeout: 30_000});
      await page.locator('.free-response > textarea').fill('sample response');

      await Promise.all([
        page.waitForNavigation({timeout: 30_000}),
        page.locator('.submitButton').click(),
      ]);

      // --- Teacher: view summary page ---
      await signIn(page, teacherEmail, teacherPassword);

      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/27/levels/1/summary',
      );
      await page
        .locator('#summary-container')
        .waitFor({state: 'visible', timeout: 30_000});

      await dismissTeacherPanel(page);

      // Student response visible; name hidden by default.
      await expect(
        page.locator('p').filter({hasText: 'sample response'}),
      ).toBeVisible({timeout: 15_000});
      await expect(
        page.locator('p').filter({hasText: studentName}),
      ).not.toBeAttached();

      // Reveal student names.
      await page
        .locator('label')
        .filter({hasText: 'Show student names'})
        .click();
      await expect(
        page.locator('p').filter({hasText: studentName}),
      ).toBeVisible({timeout: 10_000});

      // Hide the response via the Additional options menu.
      await page
        .locator("button[aria-label='Additional options']")
        .first()
        .click();
      await page
        .locator('.uitest-hide-response')
        .waitFor({state: 'visible', timeout: 10_000});
      await page.locator('.uitest-hide-response').first().click();

      await expect(
        page.locator('p').filter({hasText: 'sample response'}),
      ).not.toBeAttached();
      await expect(
        page.locator('p').filter({hasText: studentName}),
      ).not.toBeAttached();
      await expect(
        page.locator('a').filter({hasText: 'Show hidden responses'}),
      ).toBeVisible({timeout: 10_000});
    });
  },
);
