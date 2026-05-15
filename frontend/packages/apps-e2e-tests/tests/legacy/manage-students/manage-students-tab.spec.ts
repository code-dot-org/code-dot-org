import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {mockCapLockoutPhase} from '../../shared/cap';
import {test} from '../../shared/fixtures';

import {ManageStudentsPage} from './ManageStudentsPage';

const CAP_LOCKOUT_ISO = '2024-07-01T06:00:00.000Z';

test.describe('Manage students tab', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/teacher_dashboard/manage_students_tab.feature
   * Scenario: Teacher bulk updates US state for all section students
   */
  test(
    'teacher bulk updates US state for all section students',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      const {teacherEmail, teacherPassword, studentDisplayName} =
        await createTeacherAssociatedStudent(page, {
          studentAge: 10,
          studentName: 'Student',
          studentCountryCode: 'US',
          studentUsState: 'CO',
          studentCreatedAt: CAP_LOCKOUT_ISO,
        });

      await signIn(page, teacherEmail, teacherPassword);
      const roster = new ManageStudentsPage(page);
      await roster.openRoster();
      await roster.openStateBulkSetModal();
      await roster.expectStateBulkSetModal();
      await roster.bulkSetState('AL');
      await roster.saveFirstStudentState(studentDisplayName, 'AL');
    },
  );
});
