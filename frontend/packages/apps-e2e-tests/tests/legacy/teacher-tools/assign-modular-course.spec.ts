import type {Locator, Page} from '@playwright/test';

import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

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
 *
 * @param page - Playwright page holding the teacher session
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

/**
 * Toggle the checkbox for sectionName inside the multi-assign dialog.
 * Mirrors `I click the "..." checkbox in the dialog` from section_management_steps.rb.
 *
 * @param page - Playwright page with the assign dialog open
 * @param sectionName - accessible label of the checkbox (section name)
 */
async function clickSectionCheckbox(
  page: Page,
  sectionName: string,
): Promise<void> {
  const dialog = page.getByRole('dialog');
  const checkbox = dialog.getByRole('checkbox', {name: sectionName});
  const labelText = dialog.locator('span', {hasText: sectionName}).first();

  await expect(checkbox).toBeVisible({timeout: 10_000});
  await expect(checkbox).toBeEnabled({timeout: 10_000});
  await expect(labelText).toBeVisible({timeout: 10_000});

  await expect(async () => {
    if (!(await checkbox.isChecked())) {
      await labelText.click({timeout: 1_000});
    }
    await expect(checkbox).toBeChecked({timeout: 1_000});
  }).toPass({timeout: 10_000});
}

/**
 * Return whether the checkbox for sectionName is currently checked.
 * Mirrors `the "..." checkbox is (not )?selected` from section_management_steps.rb.
 *
 * @param page - Playwright page with the assign dialog open
 * @param sectionName - accessible label of the checkbox (section name)
 */
async function sectionCheckboxIsChecked(
  page: Page,
  sectionName: string,
): Promise<boolean> {
  return page
    .getByRole('dialog')
    .getByRole('checkbox', {name: sectionName})
    .isChecked();
}

/**
 * Confirm the dialog and wait for the section assignment PATCH to finish.
 * The success toast opens before navigation in the source scenario, but the
 * persisted section update is the durable readiness signal for the dashboard.
 *
 * @param page - Playwright page with the assign dialog open
 * @returns true when a section PATCH was observed
 */
async function confirmSectionAssignments(page: Page): Promise<boolean> {
  const sectionPatch = page
    .waitForResponse(
      response => {
        return (
          response.url().includes('/dashboardapi/sections/') &&
          response.request().method() === 'PATCH'
        );
      },
      {timeout: 15_000},
    )
    .catch(() => null);

  await page.getByRole('button', {name: 'Confirm section assignments'}).click();
  const response = await sectionPatch;
  if (!response) {
    return false;
  }
  expect(response.ok()).toBe(true);
  return true;
}

/**
 * Assign Section 1 in the multi-assign dialog, retrying only when the dialog
 * closes without emitting the section PATCH. That failure mode means the page
 * reset dialog-local checkbox state before confirm; reopening exercises the
 * same user journey without accepting a missing persistence event.
 *
 * @param page - Playwright page on the unit or course overview
 * @param openButton - locator for the relevant "Assign to sections" button
 */
async function assignSectionOneThroughDialog(
  page: Page,
  openButton: Locator,
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await openSectionAssignmentsDialog(page, openButton);

    // Both checkboxes should start unchecked.
    await expect(async () =>
      expect(await sectionCheckboxIsChecked(page, 'Section 1')).toBe(false),
    ).toPass({timeout: 10_000});
    await expect(async () =>
      expect(await sectionCheckboxIsChecked(page, 'Section 2')).toBe(false),
    ).toPass({timeout: 10_000});

    await clickSectionCheckbox(page, 'Section 1');

    // Section 1 now checked; Section 2 still unchecked.
    await expect(async () =>
      expect(await sectionCheckboxIsChecked(page, 'Section 1')).toBe(true),
    ).toPass({timeout: 10_000});
    await expect(async () =>
      expect(await sectionCheckboxIsChecked(page, 'Section 2')).toBe(false),
    ).toPass({timeout: 10_000});

    if (await confirmSectionAssignments(page)) {
      return;
    }

    await openButton.waitFor({state: 'visible', timeout: 15_000});
  }

  throw new Error('Section assignment dialog closed without a section PATCH');
}

/**
 * Open the section assignment dialog and wait for its visible confirm button.
 * Firefox can occasionally focus the legacy assign button without dispatching
 * the React click handler, so retry with an element click only if the visible
 * dialog state does not change.
 *
 * @param page - Playwright page on the unit or course overview
 * @param openButton - locator for the relevant "Assign to sections" button
 */
async function openSectionAssignmentsDialog(
  page: Page,
  openButton: Locator,
): Promise<void> {
  const confirmButton = page.getByRole('button', {
    name: 'Confirm section assignments',
  });

  await expect(async () => {
    await expect(openButton).toBeVisible({timeout: 10_000});
    await expect(openButton).toBeEnabled({timeout: 10_000});
    await openButton.scrollIntoViewIfNeeded();
    await openButton.click();

    if (!(await confirmButton.isVisible({timeout: 3_000}).catch(() => false))) {
      await openButton.evaluate(element => (element as HTMLElement).click());
    }

    await expect(confirmButton).toBeVisible({timeout: 10_000});
  }).toPass({timeout: 30_000});
}

test.describe('Assigning Modular Courses', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/assign_modular_course.feature
   * Scenario: Assign unit in modular course from unit overview page
   */
  test('assign unit from unit overview page', async ({page}) => {
    await createTeacher(page);
    // Navigate to a full page so the CSRF token is valid for the session.
    await page.goto('/home');
    await createNamedSections(page);

    await page.goto(UNIT_3_URL);
    await page
      .locator('#uitest-multi-assign-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await assignSectionOneThroughDialog(
      page,
      page.locator('#uitest-multi-assign-button'),
    );
    await page
      .locator('span')
      .filter({hasText: 'Success! Assignment updated!'})
      .waitFor({state: 'visible', timeout: 15_000});

    await page.goto('/teacher_dashboard/home');
    // Section cards render only after asyncLoadComplete (two API calls on mount).
    await page
      .locator('#course-content-dropdown-Section-1')
      .waitFor({state: 'visible', timeout: 45_000});
    await expect(
      page.locator('#course-content-dropdown-Section-1'),
    ).toContainText(COURSE_SLUG);
    // Section 2 was not assigned — its courseId remains null and
    // CourseContentDropdown is never rendered; the ID won't be in the DOM.
    await expect(
      page.locator('#course-content-dropdown-Section-2'),
    ).not.toBeAttached({timeout: 10_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/assign_modular_course.feature
   * Scenario: Assign unit in modular course from course overview page
   */
  test('assign unit from course overview page', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createNamedSections(page);

    await page.goto(COURSE_OVERVIEW_URL);
    // Click the 3rd (0-indexed: eq(2)) multi-assign button inside the
    // .uitest-CourseScript container.
    await page
      .locator('.uitest-CourseScript #uitest-multi-assign-button')
      .nth(2)
      .waitFor({state: 'visible', timeout: 30_000});
    await assignSectionOneThroughDialog(
      page,
      page.locator('.uitest-CourseScript #uitest-multi-assign-button').nth(2),
    );
    await page
      .locator('span')
      .filter({hasText: 'Success! Assignment updated!'})
      .waitFor({state: 'visible', timeout: 15_000});

    await page.goto('/home');
    // Section cards render only after asyncLoadComplete (two API calls on mount).
    await page
      .locator('#course-content-dropdown-Section-1')
      .waitFor({state: 'visible', timeout: 45_000});
    await expect(
      page.locator('#course-content-dropdown-Section-1'),
    ).toContainText(COURSE_SLUG);
    await expect(
      page.locator('#course-content-dropdown-Section-2'),
    ).not.toBeAttached({timeout: 10_000});
  });
});
