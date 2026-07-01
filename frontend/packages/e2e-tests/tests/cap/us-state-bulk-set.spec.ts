import {expect, test} from '../fixtures';
import {ManageStudentsPage} from '../pages/teacher-dashboard/manage-students-page';
import {TeacherDashboardPage} from '../pages/teacher-dashboard/teacher-dashboard';
import {createTeacherAssociatedStudent, signIn, signOut} from '../shared/auth';
import {setCountryOverride} from '../shared/geolocation';

// Mirrors cap_steps.rb's @cap_lockout_date / CO default in state_policies.rb.
const CAP_LOCKOUT_DATE = '2024-07-01T06:00:00.000Z';
// cap_steps.rb's cap_CO_start_date_override (DST-crossing artifact of 1.year.ago).
const CAP_START_DATE = '2023-07-02T00:10:48.000Z';

test.describe('CAP US state bulk set', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/teacher_dashboard/manage_students_tab.feature
   * "Teacher bulk updates US state for all section students"
   */
  test(
    'Teacher bulk updates US state for all section students',
    {tag: '@no_mobile'},
    async ({page, dcdo}) => {
      const dashboard = new TeacherDashboardPage(page);
      const roster = new ManageStudentsPage(page);

      await page.goto('/');
      await dcdo.mock('cap_CO_start_date_override', CAP_START_DATE);
      await dcdo.mock('cap_CO_lockout_date_override', CAP_LOCKOUT_DATE);
      // State column requires country_code=US on the teacher, set at creation time.
      await setCountryOverride(page, {countryCode: 'US'});

      const {email, password} = await createTeacherAssociatedStudent(page, {
        studentName: 'Student',
        age: '10',
        usState: 'CO',
        createdAt: CAP_LOCKOUT_DATE,
      });

      await signOut(page);
      await page.goto('/');
      await signIn(page, {email, password});

      await dashboard.navigateToRoster();
      await roster.waitForTable();
      await roster.openStateBulkSetModal();

      await expect(roster.bulkSetModalHeading).toBeVisible();
      await expect(roster.bulkSetModalStateLabel).toBeVisible();
      await expect(roster.bulkSetModalStateSelect).toHaveValue('');
      await expect(roster.bulkSetModal).toContainText(
        'Please be sure to choose the correct state. For certain states, we may be required to obtain parental consent for student accounts.',
      );
      await expect(roster.bulkSetModalConsentLink).toHaveAttribute(
        'href',
        'https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts',
      );

      await roster.bulkSetState('AL');
      await expect(roster.firstRowStateSelect()).toHaveValue('AL');

      await roster.saveFirstRow();

      await page.reload();
      await expect(roster.table).toBeVisible();
      await expect(roster.firstRow()).toContainText('Student');
      await expect(roster.firstRow()).toContainText('AL');
    },
  );
});
