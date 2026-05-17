import {
  assignSectionToCourseAndUnit,
  createSectionWithCourse,
  createStudent,
  createTeacherAssociatedStudent,
  getLevelbuilderAccess,
  joinSection,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {ManageStudentsPage} from '../manage-students/ManageStudentsPage';

import {TeacherDashboardPage} from './TeacherDashboardPage';

test.describe(
  'Teacher dashboard visual readiness ports',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/calendar_eyes.feature
     * Scenario: Lesson materials page
     */
    test('calendar tab renders instructional minutes and lessons', async ({
      page,
      eyes,
    }) => {
      await eyes.open('calendar page');
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });
      await signIn(page, teacherEmail, teacherPassword);
      await getLevelbuilderAccess(page);
      await assignSectionToCourseAndUnit(page, 0, 'ui-test-csp-2025', 1);

      const dashboard = new TeacherDashboardPage(page);
      await dashboard.gotoHome();
      await dashboard.openFirstSectionProgress();
      await dashboard.openSidebarTab('Calendar');
      await expect(page.locator('#uitest-spinner')).not.toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page.getByText('Instructional minutes per week'),
      ).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText('Lesson 1: Intro')).toBeVisible({
        timeout: 30_000,
      });
      await eyes.check('calendar');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/lesson_materials_eyes.feature
     * Scenario: Lesson materials page
     */
    test('lesson materials tab renders resources and lesson plan link', async ({
      page,
      eyes,
    }) => {
      await eyes.open('lesson materials');
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
      await dashboard.openSidebarTab('Lesson Materials');
      await expect(
        page.getByRole('heading', {name: 'Lesson Materials'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('heading', {name: 'Teacher Resources'}),
      ).toBeVisible({timeout: 30_000});
      await eyes.check('lesson materials');

      await page
        .locator('#ui-test-lessons-in-assigned-unit-dropdown')
        .selectOption({
          label: 'Lesson 48 — AI Rubrics',
        });
      await expect(page.getByText('Lesson Plan: AI Rubrics')).toBeVisible({
        timeout: 30_000,
      });
      await eyes.check('lesson materials - lesson 48');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/local_nav_v2_standalone_eyes.feature
     * Scenario: Local navigation on single-unit course
     */
    test('single-unit course local navigation switches to student view', async ({
      page,
      eyes,
    }) => {
      await eyes.open('teacher local nav v2 - single-unit course overview');
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });
      await signIn(page, teacherEmail, teacherPassword);
      await getLevelbuilderAccess(page);
      await assignSectionToCourseAndUnit(
        page,
        0,
        'ui-test-single-unit-course-2026',
        1,
      );

      const dashboard = new TeacherDashboardPage(page);
      await dashboard.gotoHome();
      await dashboard.openFirstSectionProgress();
      await dashboard.openSidebarTab('Course');
      await expect(
        page.getByRole('heading', {name: 'Single Unit 2026'}),
      ).toBeVisible({timeout: 30_000});
      await eyes.check('unit overview');

      await page.locator('#uitest-view-as-student').click();
      await expect(page.locator('.uitest-assigned')).toBeVisible({
        timeout: 30_000,
      });
      await eyes.check('student view');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/manage_students_tab_views_eyes.feature
     * Scenario: Viewing the manage students tab in normal and edit mode
     */
    test('manage students tab edit-all saves a long family name', async ({
      page,
      eyes,
    }) => {
      await eyes.open('manage students tab');
      const {teacherEmail, teacherPassword, studentDisplayName} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'SallyHasAVeryVeryLongFirstName',
        });
      await signIn(page, teacherEmail, teacherPassword);

      const roster = new ManageStudentsPage(page);
      await roster.openRoster();
      await roster.saveFamilyNameForStudent(
        studentDisplayName,
        'SallyAlsoHasAVeryVeryLongLastName',
      );
      await eyes.check('manage students tab', {
        ignoreRegions: [
          '#ui-test-section-code-button',
          '#section-options-dropdown-dropdown-button',
          '#uitest-manage-students-table tbody tr td:first-child',
          '[class*="manageStudentsLoginInfo"][class*="explanation"]',
        ],
      });
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2_eyes.feature
     * Scenario: Local navigation on Progress v2
     */
    test('progress v2 local navigation renders first and second sections', async ({
      page,
      eyes,
    }) => {
      await eyes.open('teacher local nav v2 - progress');
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });
      await signIn(page, teacherEmail, teacherPassword);
      await getLevelbuilderAccess(page);
      await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
      const secondSection = await createSectionWithCourse(
        page,
        'ui-test-single-unit-course-2026',
        1,
      );
      await createStudent(page, {name: 'Talia'});
      await joinSection(page, secondSection.sectionCode);

      await signIn(page, teacherEmail, teacherPassword);
      const dashboard = new TeacherDashboardPage(page);
      await dashboard.gotoHome();
      await dashboard.openFirstSectionProgress();
      await expect(page.getByRole('heading', {name: 'Icon Key'})).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('#ui-test-progress-table-v2')).toBeVisible({
        timeout: 30_000,
      });
      await page.waitForSelector('#ui-test-skeleton-progress-column', {
        state: 'hidden',
        timeout: 60_000,
      });
      await eyes.check('progress v2 - first section');

      await page
        .locator('#uitest-sidebar-section-dropdown')
        .selectOption({label: 'New Section'});
      await expect(page.locator('#ui-test-progress-table-v2')).toBeVisible({
        timeout: 30_000,
      });
      await page.waitForSelector('#ui-test-skeleton-progress-column', {
        state: 'hidden',
        timeout: 60_000,
      });
      await eyes.check('progress v2 - second section');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2_eyes.feature
     * Scenario: Local navigation on Unit and Course overview pages
     */
    test('unit and course overview local navigation renders', async ({
      page,
      eyes,
    }) => {
      await eyes.open('teacher local nav v2 - unit/course overview');
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
      await dashboard.openSidebarTab('Course');
      await expect(
        page.getByRole('heading', {name: 'All the Things!'}),
      ).toBeVisible({timeout: 30_000});
      await eyes.check('unit overview');

      await page.getByRole('link', {name: 'allthethingscourse'}).click();
      await expect(
        page.getByRole('heading', {name: 'allthethingscourse'}),
      ).toBeVisible({timeout: 30_000});
      await eyes.check('course overview');
    });
  },
);
