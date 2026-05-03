import {expect, test} from '@playwright/test';

import {createStudent} from '../../shared/auth';

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
  test('young student is redirected from weblab to home', async ({page}) => {
    await createStudent(page, {age: 10});
    await page.goto('/projects/weblab/new');
    await page.waitForURL('**/home');
    await expect(page.locator('.alert-danger')).toContainText(
      'This content has age restrictions in place',
    );
  });
});
