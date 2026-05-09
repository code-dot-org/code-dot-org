import {
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  getLevelbuilderAccess,
  signIn,
} from '../../shared/auth';
import {test} from '../../shared/fixtures';

/**
 * Teacher Dashboard Assessments — assessments tab initialization.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments1.feature
 */

test.describe('Teacher Dashboard Assessments', {tag: '@no_mobile'}, () => {
  /**
   * Source: teacher_dashboard_assessments1.feature
   * "Assessments tab initialization"
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
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);

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
    await page
      .locator('div')
      .filter({hasText: 'this survey is anonymous'})
      .waitFor({state: 'visible', timeout: 15_000});
  });
});
