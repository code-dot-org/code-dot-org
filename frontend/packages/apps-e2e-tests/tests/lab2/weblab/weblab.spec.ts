import {expect, test} from '../../shared/fixtures';

/**
 * Web Lab — age restriction redirect.
 *
 * Source: dashboard/test/ui/features/star_labs/weblab/too_young.feature
 * Scenario: Weblab Redirected (@as_young_student)
 *
 * An under-13 student navigating to /projects/weblab/new must be redirected
 * to /home with an age-restriction alert. The Bramble editor (cross-origin
 * iframe) prevents full WebLab E2E tests in Playwright, but this redirect
 * path touches no editor content and is safe to port.
 */
test.describe('Web Lab — age restriction', () => {
  test.use({studentAge: 10});

  test('young student is redirected from weblab to home', async ({
    studentPage,
  }) => {
    await studentPage.goto('/projects/weblab/new');
    await studentPage.waitForURL('**/home');
    await expect(studentPage.locator('.alert-danger')).toContainText(
      'This content has age restrictions in place',
    );
  });
});
