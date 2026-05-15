import {
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  getLevelbuilderAccess,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {TeacherDashboardPage} from './TeacherDashboardPage';

/**
 * Teacher Dashboard Assessments — assessments tab initialization.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments1.feature
 */

test.describe('Teacher Dashboard Assessments', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments1.feature
   * Scenario: Assessments tab initialization
   *
   * Teacher assigns a unit with a survey (but no rubric assessment) to their
   * section; the Assessments tab shows the unit selector and assessment
   * selector, and the anonymous-survey notice is displayed.
   */
  test('assessments tab initializes with survey unit', async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/home');
    await getLevelbuilderAccess(page);
    // Assign the teacher's first (only) section to allthethingscourse unit 1.
    await assignSectionToCourseAndUnit(page, 0, 'ui-test-artist', 1);

    await page.reload();
    await page
      .locator('a')
      .filter({hasText: 'View progress'})
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('a').filter({hasText: 'View progress'}).click();

    // Progress tab loads.
    await page
      .locator('#unit-selector-v2')
      .waitFor({state: 'visible', timeout: 20_000});

    // Switch to Assessments tab.
    await page
      .locator('#ui-test-teacher-sidebar')
      .getByRole('link', {name: 'Assessments'})
      .click();
    await page
      .locator('#unit-selector-v2')
      .waitFor({state: 'visible', timeout: 15_000});
    await page
      .locator('#assessment-selector')
      .waitFor({state: 'visible', timeout: 15_000});

    // Select a specific survey.
    await page.locator('#assessment-selector').selectOption({
      label: 'Anonymous student survey 2',
    });
    await expect(page.getByTestId('assessments-tab')).toContainText(
      'this survey is anonymous',
      {timeout: 15_000},
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/assessment_feedback_download.feature
   * Scenario: Assessments tab has feedback download
   */
  test('assessments tab offers the unit feedback CSV download', async ({
    page,
  }) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/teacher_dashboard/home');
    await assignSectionToCourseAndUnit(page, 0, 'ui-test-csp-2019', 3);
    await page.reload({waitUntil: 'domcontentloaded'});

    const dashboard = new TeacherDashboardPage(page);
    await dashboard.openFirstSectionProgress();
    await expect(page.locator('#unit-selector-v2')).toBeVisible({
      timeout: 30_000,
    });

    await dashboard.openSidebarTab('Assessments');
    await dashboard.expectAssessmentsTabReady();
    await page.locator('#assessment-selector').selectOption({
      label: 'All teacher feedback in this unit',
    });
    await expect(page.getByText('Download CSV of Feedback')).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/assessment_feedback_download.feature
   * Scenario: Assessments tab does not have feedback download
   */
  test('assessments tab omits feedback download for course without assessments', async ({
    page,
  }) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/teacher_dashboard/home');
    await assignSectionToCourseAndUnit(page, 0, 'ui-test-artist', 1);

    const dashboard = new TeacherDashboardPage(page);
    await page.reload({waitUntil: 'domcontentloaded'});
    await dashboard.openFirstSectionProgress();
    await dashboard.openSidebarTab('Assessments');
    const emptyAssessments = page
      .getByText(
        'It looks like there are no multi-question assessments or surveys in this course',
      )
      .or(page.getByText("It's a bit empty here..."));
    await expect(emptyAssessments).toBeVisible({timeout: 30_000});
  });
});
