import {
  createSectionWithCourse,
  createStudent,
  createTeacher,
  joinSection,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Course overview page — signed-out, student, teacher, and single-unit redirect paths.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/course_overview.feature
 *
 */

const COURSE_URL = '/courses/ui-test-csp-2019';

test.describe('Course overview', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/course_overview.feature
   * Scenario: Viewing course overview signed out
   */
  test('signed-out: overview page loads', async ({page}) => {
    await page.goto(COURSE_URL);
    await page
      .locator('.uitest-CourseScript')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/course_overview.feature
   * Scenario: Viewing course overview as a student not in a section
   */
  test('student not in section: overview page loads', async ({page}) => {
    await createStudent(page);
    await page.goto(COURSE_URL);
    await page
      .locator('.uitest-CourseScript')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/course_overview.feature
   * Scenario: Viewing course overview as a teacher with no sections
   */
  test('teacher with no sections: overview page loads', async ({page}) => {
    await createTeacher(page);
    await page.goto(COURSE_URL);
    await page
      .locator('.uitest-CourseScript')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/course_overview.feature
   * Scenario: Viewing course overview as a student in a section
   *
   * The Cucumber scenario assigns UI Test CSP to the teacher's section through
   * the section settings UI, then signs in as the student and verifies the
   * course overview loads. Section editor assignment is covered elsewhere, so
   * this port uses the shared course-assigned section setup helper and keeps
   * the assertion focused on the enrolled student's course overview.
   */
  test('student in section: overview page reflects section assignment', async ({
    page,
  }) => {
    await createTeacher(page);
    const {sectionCode} = await createSectionWithCourse(
      page,
      'ui-test-csp-2019',
      1,
    );
    await createStudent(page);
    await joinSection(page, sectionCode);

    await page.goto(COURSE_URL);
    await expect(page.locator('.uitest-CourseScript').first()).toBeVisible({
      timeout: 30_000,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/course_overview.feature
   * Scenario: Viewing course overview for a single-unit course
   */
  test('single-unit course: /courses/<name> redirects to /units/1', async ({
    page,
  }) => {
    // Original single-unit course.
    await page.goto('/courses/ui-test-single-unit-course-2026');
    await page.waitForURL(
      /\/courses\/ui-test-single-unit-course-2026\/units\/1/,
      {timeout: 30_000},
    );

    // Modular (versioned-script) single-unit course.
    await page.goto('/courses/ui-test-versioned-script-2019');
    await page.waitForURL(
      /\/courses\/ui-test-versioned-script-2019\/units\/1/,
      {
        timeout: 30_000,
      },
    );
  });
});
