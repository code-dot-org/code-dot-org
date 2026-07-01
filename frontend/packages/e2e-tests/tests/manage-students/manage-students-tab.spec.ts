import {expect, test} from '../fixtures';
import {ManageStudentsPage} from '../pages/manage-students-page';
import {createTeacherAssociatedStudent, signIn, signOut} from '../shared/auth';
import {setCountryOverride} from '../shared/geolocation';

// CO lockout date pinned into the past so the CAP-locked-out under-13 student
// this scenario creates sits in the all-user lockout phase. Mirrors
// cap_steps.rb's @cap_lockout_date and the CO default in state_policies.rb
// (DateTime.parse('2024-07-01T00:00:00MDT')).
const CAP_LOCKOUT_DATE = '2024-07-01T06:00:00.000Z';
// cap_steps.rb also sets cap_CO_start_date_override to one year before the
// lockout date (DST-crossing artifact of ActiveSupport's 1.year.ago).
const CAP_START_DATE = '2023-07-02T00:10:48.000Z';

test.describe('Manage students tab', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/teacher_dashboard/manage_students_tab.feature
   * "Teacher bulk updates US state for all section students"
   */
  test(
    'Teacher bulk updates US state for all section students',
    {tag: '@no_mobile'},
    async ({page, dcdo}) => {
      const roster = new ManageStudentsPage(page);

      await page.goto('/');
      await dcdo.mock('cap_CO_start_date_override', CAP_START_DATE);
      await dcdo.mock('cap_CO_lockout_date_override', CAP_LOCKOUT_DATE);
      // The State column only renders for a teacher whose own country_code is
      // US, which is set from geolocation at account-creation time — the
      // override must be in place before createTeacherAssociatedStudent runs.
      await setCountryOverride(page, {countryCode: 'US'});

      const {email, password} = await createTeacherAssociatedStudent(page, {
        studentName: 'Student',
        age: '10',
        usState: 'CO',
        createdAt: CAP_LOCKOUT_DATE,
      });

      // createTeacherAssociatedStudent leaves the student's session active;
      // switch to the teacher to view/manage the roster.
      await signOut(page);
      await page.goto('/');
      await signIn(page, {email, password});

      await roster.openRoster();
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
