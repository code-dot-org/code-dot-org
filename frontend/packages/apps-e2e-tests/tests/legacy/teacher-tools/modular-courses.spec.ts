import {
  assignCourseAsStudent,
  createStudent,
  createTeacher,
  signIn,
  signOut,
} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {ModularCoursesPage} from './ModularCoursesPage';

/**
 * Modular Courses — navigation within and between modular courses preserves
 * the correct course context in URLs, breadcrumbs, and progress dashboards.
 *
 * Source: dashboard/test/ui/features/teacher_tools/modular_courses.feature
 */

test.describe('Using Modular Courses', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/modular_courses.feature
   * Scenario: Navigating within modular courses
   *
   * URL and breadcrumb context is maintained for both ui-test-course-2017
   * and ui-test-course-2019 (both share "UI Test Shared Unit").
   */
  test('navigating within modular courses preserves course context', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/home');

    const modularCourses = new ModularCoursesPage(page);
    await modularCourses.runCourseNavigationSequence('ui-test-course-2017');
    await modularCourses.runCourseNavigationSequence('ui-test-course-2019');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/modular_courses.feature
   * Scenario: Progress is saved across modular courses
   *
   * A student completes the shared unit in the 2017 modular course. The
   * teacher sees progress in both sections, using each course-specific level
   * URL in the V2 progress table.
   */
  test('progress is saved across modular courses', async ({page}) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createTeacher(page, {name: 'Teacher_Sally'});
    await createStudent(page, {name: 'Sally'});
    await assignCourseAsStudent(page, 'ui-test-course-2017', {
      teacherEmail,
      sectionName: 'Course 2017',
    });
    await assignCourseAsStudent(page, 'ui-test-course-2019', {
      teacherEmail,
      sectionName: 'Course 2019',
    });

    const modularCourses = new ModularCoursesPage(page);
    await modularCourses.completeFirstSharedUnitLevel();

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);
    await modularCourses.openProgressForSection('Course 2017');
    await modularCourses.expectSharedUnitProgress('ui-test-course-2017');

    await modularCourses.selectSidebarSection('Course 2019');
    await modularCourses.expectSharedUnitProgress('ui-test-course-2019');
  });
});
