import {createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/** Skip webkit — @no_safari (Safari 16 regex incompatibility in WebLab2). */
const skipSafari = ({browserName}: {browserName: string}) =>
  test.skip(browserName === 'webkit', '@no_safari');

/**
 * Web Lab — age restriction redirect.
 *
 * Source: dashboard/test/ui/features/star_labs/weblab/too_young.feature
 * Scenario: Weblab Redirected
 *
 * An under-13 student navigating to /projects/weblab/new must be redirected
 * to /home with an age-restriction alert. The Bramble editor (cross-origin
 * iframe) prevents full WebLab E2E tests in Playwright, but this redirect
 * path touches no editor content and is safe to port.
 */
test.describe('Web Lab — age restriction', () => {
  test.use({studentAge: 10});

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/weblab/too_young.feature
   * Scenario: Weblab Redirected
   */
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

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/star_labs/weblab/too_young.feature
 * Scenario: Weblab Allowed for Student in Teacher's Section
 */
test('teacher-associated under-13 student can open Web Lab', async ({page}) => {
  await createTeacherAssociatedStudent(page, {
    studentAge: 10,
    studentName: 'Luna',
  });

  await page.goto('/projects/weblab/new');
  await page
    .locator('#workspace-header')
    .waitFor({state: 'visible', timeout: 60_000});
  await expect(page).toHaveURL(/\/projects\/weblab\/[^/]+\/edit/);
});

/**
 * Web Lab 2 — editor and instructions load.
 *
 * Source: dashboard/test/ui/features/student_learning/weblab2/weblab2_general.feature
 * @no_safari @no_mobile
 *
 * Verifies that the instructions drawer, file list, and CodeMirror editor
 * all render correctly for a signed-in student on the designated UI-test level.
 * The preview iframe (@no_ci) is covered by weblab2_preview.feature and not
 * ported here.
 */
test.describe('Web Lab 2 — editor and instructions load', () => {
  test(
    'instructions drawer, file list, and code editor are all visible',
    {tag: '@no_mobile'},
    async ({studentPage, browserName}) => {
      skipSafari({browserName});
      // hideProductTours suppresses first-visit tour overlays.
      await studentPage.goto(
        '/courses/allthethingscourse/units/1/lessons/51/levels/11?hideProductTours=true',
      );
      await studentPage
        .locator('#instructions-drawer')
        .waitFor({state: 'visible', timeout: 60_000});
      await expect(studentPage.locator('#instructions-drawer')).toContainText(
        'This is the level for a basic Web Lab 2 UI Test.',
      );
      await expect(studentPage.locator('#uitest-files-list')).toContainText(
        'index.html',
      );
      await expect(studentPage.locator('.codemirror-container')).toContainText(
        'Hello world!',
      );
    },
  );
});
