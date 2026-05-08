import {createTeacher, createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

/**
 * Course overview page — signed-out, student, teacher, and single-unit redirect paths.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/course_overview.feature
 *
 * The "student in section" scenario is skipped: it requires complex section
 * setup with course assignment and a second sign-in as the student.
 */

const COURSE_URL = '/courses/ui-test-csp-2019';

test.describe('Course overview', () => {
  test('signed-out: overview page loads', async ({page}) => {
    await page.goto(COURSE_URL);
    await page
      .locator('.uitest-CourseScript')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  });

  test('student not in section: overview page loads', async ({page}) => {
    await createStudent(page);
    await page.goto(COURSE_URL);
    await page
      .locator('.uitest-CourseScript')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  });

  test('teacher with no sections: overview page loads', async ({page}) => {
    await createTeacher(page);
    await page.goto(COURSE_URL);
    await page
      .locator('.uitest-CourseScript')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  });

  // Requires teacher to create a section with course assignment, then sign in
  // as the student — multi-step auth flow not covered by a single-user helper.
  test.fixme(
    'student in section: overview page reflects section assignment',
    async () => {},
  );

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
