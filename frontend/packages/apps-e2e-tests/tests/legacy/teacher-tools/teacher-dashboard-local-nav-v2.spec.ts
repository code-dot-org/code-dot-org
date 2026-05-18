import {
  assignCourseAsStudent,
  createTeacherAssociatedStudent,
  getLevelbuilderAccess,
  signIn,
} from '../../shared/auth';
import {mockDcdo} from '../../shared/cookies';
import {expect, test} from '../../shared/fixtures';

/**
 * Teacher Dashboard V2 Local Navigation — settings modifications and
 * single-unit course overview navigation.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2.feature
 *
 * Background: DCDO key "ai-tutor-teacher-nav-v2" is mocked to false so the
 * AI tutor overlay does not interfere with navigation.
 */

test.describe(
  'Teacher Dashboard Local Navigation V2',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2.feature
     * Scenario: Modifying settings on the teacher dashboard
     *
     * Teacher changes grade level, course, and section name via the settings
     * panel and confirms the progress page reflects the updates.
     */
    test('teacher modifies section settings', async ({page}) => {
      // Set DCDO mock before any account navigation.
      await page.goto('/home');
      await mockDcdo(page, 'ai-tutor-teacher-nav-v2', false);

      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });
      // Student is now signed in; assign course to create the named section.
      await assignCourseAsStudent(page, 'allthethingscourse', {
        teacherEmail,
        sectionName: 'All the Things Section',
      });

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto('/home');
      await getLevelbuilderAccess(page);

      await page
        .locator('#task-button-View-progress-All-the-Things-Section')
        .waitFor({state: 'visible', timeout: 30_000});
      await page
        .locator('#task-button-View-progress-All-the-Things-Section')
        .click();

      await page
        .locator('#ui-test-teacher-sidebar')
        .waitFor({state: 'visible', timeout: 15_000});
      await page
        .locator('#ui-test-teacher-sidebar a[href$="/settings"]')
        .click();
      await page
        .locator('#uitest-spinner')
        .first()
        .waitFor({state: 'hidden', timeout: 15_000});
      await page
        .locator('h1')
        .filter({hasText: 'Settings'})
        .waitFor({state: 'visible', timeout: 15_000});
      await page
        .getByRole('heading', {name: 'Class Section', exact: true})
        .waitFor({state: 'visible', timeout: 10_000});

      // Toggle grade level and select a course.
      await page.locator('input[name="grades[]"]').first().click();
      await page
        .locator('button')
        .filter({hasText: 'Elementary School'})
        .waitFor({state: 'visible', timeout: 10_000});
      await page
        .locator('button')
        .filter({hasText: 'Elementary School'})
        .click();
      await page
        .locator('input[name="UI Test CSF"]')
        .waitFor({state: 'visible', timeout: 10_000});
      // MUI radio is visually overlaid; force click to bypass intercept check.
      await page.locator('input[name="UI Test CSF"]').click({force: true});

      // Rename the section.
      await page.locator('#uitest-section-name-setup').clear();
      await page
        .locator('#uitest-section-name-setup')
        .fill("Sally's Super Section");

      await Promise.all([
        page.waitForNavigation({timeout: 30_000}),
        page.locator('button').filter({hasText: 'Save'}).click(),
      ]);

      await page
        .locator('h1')
        .filter({hasText: 'Progress'})
        .waitFor({state: 'visible', timeout: 15_000});
      await page
        .locator('#ui-test-progress-table-v2')
        .waitFor({state: 'visible', timeout: 15_000});
      // page.waitForSelector avoids a Playwright internal selector-generation
      // TypeError that occurs with locator().waitFor({state:'hidden'}) on this element.
      await page.waitForSelector('#ui-test-skeleton-progress-column', {
        state: 'hidden',
        timeout: 60_000,
      });
      await expect(page.locator('#unit-selector-v2')).toContainText(
        'UI Test CSF',
        {timeout: 30_000},
      );
      await expect(
        page.locator('#uitest-sidebar-section-dropdown'),
      ).toContainText("Sally's Super Section");
      await expect(
        page.locator('#uitest-sidebar-section-dropdown'),
      ).not.toContainText('All the Things Section');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2.feature
     * Scenario: Single-unit course overview
     *
     * Teacher navigates to the Course tab for a single-unit course and sees the
     * unit overview page with no breadcrumb.
     */
    test('single-unit course overview navigation', async ({page}) => {
      await page.goto('/home');
      await mockDcdo(page, 'ai-tutor-teacher-nav-v2', false);

      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });
      await assignCourseAsStudent(page, 'ui-test-single-unit-course-2025', {
        teacherEmail,
        sectionName: 'Single Unit Section',
      });

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto('/home');

      await page
        .locator('#task-button-View-progress-Single-Unit-Section')
        .waitFor({state: 'visible', timeout: 30_000});
      await page
        .locator('#task-button-View-progress-Single-Unit-Section')
        .click();

      await page
        .locator('#ui-test-teacher-sidebar')
        .waitFor({state: 'visible', timeout: 15_000});
      await page
        .locator('#ui-test-teacher-sidebar')
        .getByRole('link', {name: 'Course'})
        .click();

      await expect(page).toHaveURL(
        /\/courses\/ui-test-single-unit-course-2025\/units\/1/,
        {
          timeout: 15_000,
        },
      );
      await page
        .locator('h1')
        .filter({hasText: 'Single Unit 2025'})
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('#assignment-version-year')).toContainText(
        '2025',
        {timeout: 15_000},
      );
      await expect(page.locator('.unit-breadcrumb')).not.toBeAttached({
        timeout: 10_000,
      });
    });
  },
);
