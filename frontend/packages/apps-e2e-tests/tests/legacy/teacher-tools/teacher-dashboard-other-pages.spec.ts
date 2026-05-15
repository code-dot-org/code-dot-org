import {
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  getLevelbuilderAccess,
  signIn,
} from '../../shared/auth';
import {mockDcdo} from '../../shared/cookies';
import {expect, test} from '../../shared/fixtures';

import {TeacherDashboardPage} from './TeacherDashboardPage';

/**
 * Teacher Dashboard Other Pages — dashboard tabs not covered by narrower
 * teacher-dashboard scenarios.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/view_other_teacher_dashboard_pages.feature
 */

test.describe('Teacher Dashboard other pages', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/view_other_teacher_dashboard_pages.feature
   * Scenario: Viewing teacher dashboard pages
   */
  test('teacher can view progress, stats, roster, text responses, and assessments', async ({
    page,
  }) => {
    await page.goto('/home');
    await mockDcdo(page, 'ai-tutor-teacher-nav-v2', false);

    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        authorized: true,
        studentName: 'Sally',
      });

    await signIn(page, teacherEmail, teacherPassword);
    await getLevelbuilderAccess(page);
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);

    const dashboard = new TeacherDashboardPage(page);
    await dashboard.gotoHome();
    await dashboard.openFirstSectionProgress();
    await dashboard.expectProgressV2Ready();

    await dashboard.openSidebarTab('Stats');
    await expect(page.locator('#uitest-stats-table')).toContainText('Sally', {
      timeout: 30_000,
    });

    await dashboard.openSidebarTab('Roster');
    await expect(page.locator('#uitest-manage-students-table')).toContainText(
      'Sally',
      {timeout: 30_000},
    );
    await expect(page.locator('#uitest-privacy-text')).toContainText(
      'We encourage you to share this letter',
    );
    await expect(page.locator('#uitest-privacy-link')).toContainText(
      'Just looking for a letter',
    );

    await dashboard.openSidebarTab('Text Responses');
    await expect(page.locator('#unit-selector-v2')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('heading', {name: 'Text Responses'}),
    ).toBeVisible();
    await expect(
      page.getByText('you will not see any text responses here'),
    ).toBeVisible();

    await dashboard.openSidebarTab('Assessments');
    await dashboard.expectAssessmentsTabReady();
    await expect(page.locator('#assessment-selector')).toContainText(
      'Lesson 30: Anonymous student survey',
    );
    await page
      .locator('#assessment-selector')
      .selectOption({label: 'Lesson 30: Anonymous student survey'});
    await expect(page.getByText('this survey is anonymous')).toBeVisible({
      timeout: 30_000,
    });
  });
});
