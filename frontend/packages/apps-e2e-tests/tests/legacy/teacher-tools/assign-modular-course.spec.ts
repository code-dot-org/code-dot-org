import {test} from '@playwright/test';
import type {Page} from '@playwright/test';

import {createTeacher} from '../../shared/auth';

import {ModularCoursesPage} from './ModularCoursesPage';

/**
 * Assigning Modular Courses — teacher assigns a unit from a modular course to
 * one section and verifies the section table reflects the change.
 *
 * Source: dashboard/test/ui/features/teacher_tools/assign_modular_course.feature
 */

const COURSE_SLUG = 'ui-test-course-2019';
const COURSE_OVERVIEW_URL = `/courses/${COURSE_SLUG}`;
const UNIT_3_URL = `/courses/${COURSE_SLUG}/units/3`;

/**
 * Create two named student sections for the currently signed-in teacher via
 * the test-only /api/test/create_student_section_with_name endpoint.
 * Mirrors `I am a teacher with student sections named Section 1 and Section 2`
 * from section_management_steps.rb.
 */
async function createNamedSections(page: Page): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  for (const sectionName of ['Section 1', 'Section 2']) {
    const resp = await page.request.post(
      '/api/test/create_student_section_with_name',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf ?? '',
        },
        data: {section_name: sectionName},
      },
    );
    if (!resp.ok()) {
      throw new Error(
        `create section "${sectionName}" failed: ${resp.status()} — ${await resp.text()}`,
      );
    }
  }
}

test.describe('Assigning Modular Courses', {tag: '@no_mobile'}, () => {
  /** Migration status: COMPLETED  Source: dashboard/test/ui/features/teacher_tools/assign_modular_course.feature "Assign unit in modular course from unit overview page" */
  test('assign unit from unit overview page', async ({page}) => {
    await createTeacher(page);
    // Navigate to a full page so the CSRF token is valid for the session.
    await page.goto('/home');
    await createNamedSections(page);

    const modularPage = new ModularCoursesPage(page);

    await page.goto(UNIT_3_URL);
    const firstAssignButton = modularPage.multiAssignButton();
    await firstAssignButton.waitFor({state: 'visible', timeout: 30_000});
    await modularPage.assignSectionOneThroughDialog(firstAssignButton);
    await modularPage.waitForAssignmentSuccessToast();

    await page.goto('/teacher_dashboard/home');
    await modularPage.expectSectionAssignedToCourse('Section 1', COURSE_SLUG);
    // Section 2 was not assigned — its courseId remains null and
    // CourseContentDropdown is never rendered; the ID is absent from the DOM.
    await modularPage.expectSectionNotAssigned('Section 2');
  });

  /** Migration status: COMPLETED  Source: dashboard/test/ui/features/teacher_tools/assign_modular_course.feature "Assign unit in modular course from course overview page" */
  test('assign unit from course overview page', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createNamedSections(page);

    const modularPage = new ModularCoursesPage(page);

    await page.goto(COURSE_OVERVIEW_URL);
    // Click the 3rd (0-indexed: eq(2)) multi-assign button inside the
    // .uitest-CourseScript container — jQuery :eq(2) maps to Playwright .nth(2).
    const thirdAssignButton = modularPage.courseScriptMultiAssignButton(2);
    await thirdAssignButton.waitFor({state: 'visible', timeout: 30_000});
    await modularPage.assignSectionOneThroughDialog(thirdAssignButton);
    await modularPage.waitForAssignmentSuccessToast();

    // Scenario 2 navigates to /home (which redirects to /teacher_dashboard/home).
    await page.goto('/home');
    await modularPage.expectSectionAssignedToCourse('Section 1', COURSE_SLUG);
    await modularPage.expectSectionNotAssigned('Section 2');
  });
});
