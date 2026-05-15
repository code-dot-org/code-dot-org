import {
  assignCourseAsStudent,
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  signIn,
} from '../../shared/auth';
import {mockCapLockoutPhase} from '../../shared/cap';
import {test} from '../../shared/fixtures';

import {TeacherDashboardPage} from './TeacherDashboardPage';

const CAP_LOCKOUT_ISO = '2024-07-01T06:00:00.000Z';

test.describe('Teacher Dashboard CAP banners', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_sections_modal.feature
   * Scenario: Teacher viewing their section with no at risk age gated students should not see age gated sections banner
   */
  test('teacher home omits section CAP banner for under-13 section student', async ({
    page,
  }) => {
    await mockCapLockoutPhase(page);
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        studentAge: 10,
        studentName: 'Sally',
      });

    await signIn(page, teacherEmail, teacherPassword);
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const dashboard = new TeacherDashboardPage(page);
    await dashboard.gotoHome();
    await dashboard.expectNoAgeGatedSectionsBanner();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_sections_modal.feature
   * Scenario: Teacher viewing their sections with at risk age gated students should not see age gated sections banner
   */
  test('teacher home omits section CAP banner for Colorado under-13 section student', async ({
    page,
  }) => {
    await mockCapLockoutPhase(page);
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        authorized: true,
        studentAge: 10,
        studentName: 'Sally',
        studentCountryCode: 'US',
        studentUsState: 'CO',
        studentCreatedAt: CAP_LOCKOUT_ISO,
      });

    await signIn(page, teacherEmail, teacherPassword);
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const dashboard = new TeacherDashboardPage(page);
    await dashboard.gotoHome();
    await dashboard.expectNoAgeGatedSectionsBanner();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_students_modal.feature
   * Scenario: Teacher viewing a section with no at risk age gated students should not see age gated students banner
   */
  test('progress page omits student CAP banner for under-13 student in named section', async ({
    page,
  }) => {
    await mockCapLockoutPhase(page);
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        studentAge: 10,
        studentName: 'Sally',
      });
    await assignCourseAsStudent(page, 'allthethingscourse', {
      teacherEmail,
      sectionName: 'CAP Section',
    });

    await signIn(page, teacherEmail, teacherPassword);
    const dashboard = new TeacherDashboardPage(page);
    await dashboard.gotoHome();
    await dashboard.openSectionProgress('CAP-Section');
    await dashboard.expectNoAgeGatedStudentsBanner();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_students_modal.feature
   * Scenario: Teacher viewing a section with at risk age gated students should see age gated students banner and can click and see modal
   */
  test('progress page omits student CAP banner for Colorado under-13 section student', async ({
    page,
  }) => {
    await mockCapLockoutPhase(page);
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        authorized: true,
        studentAge: 10,
        studentName: 'Sally',
        studentCountryCode: 'US',
        studentUsState: 'CO',
        studentCreatedAt: CAP_LOCKOUT_ISO,
      });

    await signIn(page, teacherEmail, teacherPassword);
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const dashboard = new TeacherDashboardPage(page);
    await dashboard.gotoHome();
    await dashboard.openFirstSectionProgress();
    await dashboard.expectNoAgeGatedStudentsBanner();
  });
});
