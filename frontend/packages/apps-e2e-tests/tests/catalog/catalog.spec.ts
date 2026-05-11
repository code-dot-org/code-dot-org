import {type Page} from '@playwright/test';

import {createTeacher} from '../shared/auth';
import {expect, test} from '../shared/fixtures';

type SectionName = 'Section 1' | 'Section 2';
type NamedSectionIds = Record<SectionName, number>;

/**
 * Curriculum Catalog — signed-out, student, teacher, and assign/unassign flows.
 *
 * Sources:
 *   dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
 *   dashboard/test/ui/features/acquisition_products/curriculum_catalog_assign_unassign.feature
 */

/**
 * Wait for the catalog to load (AI for Oceans card visible).
 *
 * @param page - Playwright page navigated to /catalog
 */
async function waitForCatalog(page: Page): Promise<void> {
  await page
    .locator('h4', {hasText: 'AI for Oceans'})
    .waitFor({state: 'visible', timeout: 30_000});
}

/**
 * Create two named sections for the currently signed-in teacher.
 * Mirrors `I am a teacher with student sections named Section 1 and Section 2`
 * from section_management_steps.rb.
 *
 * @param page - Playwright page holding the teacher session
 */
async function createNamedSections(page: Page): Promise<NamedSectionIds> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  for (const sectionName of ['Section 1', 'Section 2']) {
    const response = await page.request.post(
      '/api/test/create_student_section_with_name',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf ?? '',
        },
        data: {section_name: sectionName},
      },
    );

    if (!response.ok()) {
      throw new Error(
        `create section "${sectionName}" failed: ${response.status()} — ${await response.text()}`,
      );
    }
  }

  const sectionsResponse = await page.request.get('/dashboardapi/sections');
  expect(sectionsResponse.ok()).toBe(true);
  const sections = (await sectionsResponse.json()) as Array<{
    id: number;
    name: string;
  }>;

  return {
    'Section 1': expectSectionId(sections, 'Section 1'),
    'Section 2': expectSectionId(sections, 'Section 2'),
  };
}

/**
 * Find a named section id in /dashboardapi/sections.
 *
 * @param sections - sections returned by dashboardapi
 * @param sectionName - expected section name
 */
function expectSectionId(
  sections: Array<{id: number; name: string}>,
  sectionName: SectionName,
): number {
  const section = sections.find(s => s.name === sectionName);
  expect(section).toBeTruthy();
  return section!.id;
}

/**
 * Open the assignment dialog from a catalog card or expanded card.
 *
 * @param page - Playwright page on the curriculum catalog
 * @param curriculumName - visible curriculum card title
 * @param expandedCard - when true, use the card's details view first
 */
async function openAssignmentDialog(
  page: Page,
  curriculumName: string,
  {expandedCard = false}: {expandedCard?: boolean} = {},
): Promise<void> {
  if (expandedCard) {
    await page
      .getByRole('button', {name: `View details about ${curriculumName}`})
      .click();
    await page
      .getByRole('button', {
        name: `Assign ${curriculumName} to your classroom`,
      })
      .filter({hasText: 'Assign to class sections'})
      .click();
  } else {
    await page
      .getByRole('button', {
        name: `Assign ${curriculumName} to your classroom`,
      })
      .click();
  }

  await expect(
    page.getByRole('button', {name: 'Confirm section assignments'}),
  ).toBeVisible({timeout: 15_000});
}

/**
 * Assert the named section checkbox state in the assignment dialog.
 *
 * @param page - Playwright page with assignment dialog open
 * @param sectionName - accessible checkbox name
 * @param checked - expected selected state
 */
async function expectSectionCheckbox(
  page: Page,
  sectionName: string,
  checked: boolean,
): Promise<void> {
  const checkbox = page.getByRole('checkbox', {name: sectionName});
  if (checked) {
    await expect(checkbox).toBeChecked();
  } else {
    await expect(checkbox).not.toBeChecked();
  }
}

/**
 * Toggle one section in the assignment dialog and confirm.
 *
 * @param page - Playwright page with assignment dialog open
 * @param sectionName - accessible checkbox name
 * @param checked - target selected state for the section
 * @param sectionId - id used by the section PATCH endpoint
 */
async function confirmSectionAssignment(
  page: Page,
  sectionName: SectionName,
  checked: boolean,
  sectionId: number,
): Promise<void> {
  const checkbox = page.getByRole('checkbox', {name: sectionName});
  if ((await checkbox.isChecked()) !== checked) {
    await checkbox.click();
  }
  await expectSectionCheckbox(page, sectionName, checked);

  const confirmButton = page.getByRole('button', {
    name: 'Confirm section assignments',
  });
  const sectionUpdateResponse = page.waitForResponse(
    response => {
      return (
        response.url().includes(`/dashboardapi/sections/${sectionId}`) &&
        response.request().method() === 'PATCH'
      );
    },
    {timeout: 30_000},
  );
  await confirmButton.click();
  const response = await sectionUpdateResponse;
  expect(response.ok()).toBe(true);
  const section = (await response.json()) as {course_id: number | null};
  if (checked) {
    expect(section.course_id).not.toBeNull();
  } else {
    expect(section.course_id).toBeNull();
  }
  await expect(confirmButton).toBeHidden({timeout: 30_000});
}

/**
 * Confirm a checkbox change and retry if the section update races.
 *
 * @param page - Playwright page
 * @param curriculumName - visible curriculum card title
 * @param sectionName - accessible checkbox name
 * @param checked - target selected state for the section
 * @param sectionId - id used by the section PATCH endpoint
 * @param expandedCard - when true, use expanded-card details for a retry
 */
async function confirmSectionAssignmentWithRetry(
  page: Page,
  curriculumName: string,
  sectionName: SectionName,
  checked: boolean,
  sectionId: number,
  {expandedCard = false}: {expandedCard?: boolean} = {},
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await page.goto('/catalog');
      await waitForCatalog(page);
      await openAssignmentDialog(page, curriculumName, {expandedCard});
      if (
        (await page.getByRole('checkbox', {name: sectionName}).isChecked()) ===
        checked
      ) {
        return;
      }
    }

    try {
      await confirmSectionAssignment(page, sectionName, checked, sectionId);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/**
 * Assert that a section card on teacher home is or is not assigned to a course.
 *
 * @param page - Playwright page
 * @param sectionName - section name shown in the section table
 * @param courseName - course display name to find in the section's assignment
 * @param assigned - whether the course should be present
 */
async function expectSectionCourseAssignment(
  page: Page,
  sectionName: string,
  courseName: string,
  assigned: boolean,
): Promise<void> {
  const sectionAssignment = page.locator(
    `#course-content-dropdown-${sectionName.replaceAll(' ', '-')}`,
  );

  if (assigned) {
    await expect(sectionAssignment).toContainText(courseName, {
      timeout: 45_000,
    });
    return;
  }

  await expect(async () => {
    const text = await sectionAssignment
      .textContent({timeout: 1_000})
      .catch(() => '');
    expect(text ?? '').not.toContain(courseName);
  }).toPass({timeout: 30_000, intervals: [500, 1_000, 2_000]});
}

/**
 * Complete one catalog assign/unassign scenario.
 *
 * @param page - Playwright page
 * @param expandedCard - when true, assign from expanded-card details
 */
async function assignAndUnassignCatalogOfferings(
  page: Page,
  {expandedCard = false}: {expandedCard?: boolean} = {},
): Promise<void> {
  await createTeacher(page);
  await page.goto('/home');
  const sectionIds = await createNamedSections(page);

  await page.goto('/catalog');
  await waitForCatalog(page);

  await openAssignmentDialog(page, 'AI for Oceans', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', false);
  await expectSectionCheckbox(page, 'Section 2', false);
  await confirmSectionAssignmentWithRetry(
    page,
    'AI for Oceans',
    'Section 1',
    true,
    sectionIds['Section 1'],
    {expandedCard},
  );

  await openAssignmentDialog(page, 'UI Test CSP', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', false);
  await expectSectionCheckbox(page, 'Section 2', false);
  await confirmSectionAssignmentWithRetry(
    page,
    'UI Test CSP',
    'Section 2',
    true,
    sectionIds['Section 2'],
    {expandedCard},
  );

  await page.goto('/teacher_dashboard/home');
  await expectSectionCourseAssignment(page, 'Section 1', 'AI for Oceans', true);
  await expectSectionCourseAssignment(page, 'Section 2', 'UI Test CSP', true);

  await page.goto('/catalog');
  await waitForCatalog(page);

  await openAssignmentDialog(page, 'AI for Oceans', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', true);
  await expectSectionCheckbox(page, 'Section 2', false);
  await confirmSectionAssignmentWithRetry(
    page,
    'AI for Oceans',
    'Section 1',
    false,
    sectionIds['Section 1'],
    {expandedCard},
  );

  await openAssignmentDialog(page, 'UI Test CSP', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', false);
  await expectSectionCheckbox(page, 'Section 2', true);
  await confirmSectionAssignmentWithRetry(
    page,
    'UI Test CSP',
    'Section 2',
    false,
    sectionIds['Section 2'],
    {expandedCard},
  );
  await expect(
    page.locator('p', {hasText: 'You have successfully assigned'}),
  ).not.toBeVisible();

  await page.goto('/teacher_dashboard/home');
  await expectSectionCourseAssignment(
    page,
    'Section 1',
    'AI for Oceans',
    false,
  );
  await expectSectionCourseAssignment(page, 'Section 2', 'UI Test CSP', false);
}

test.describe('Curriculum Catalog — signed-out', () => {
  test('signed-out user is redirected to sign-in when clicking Assign', async ({
    page,
  }) => {
    await page.goto('/catalog');

    await page
      .locator('h4', {hasText: 'AI for Oceans'})
      .waitFor({state: 'visible'});

    // Click the assign button for "AI for Oceans".
    await page
      .locator('[aria-label="Assign AI for Oceans to your classroom"]')
      .click();

    await expect(
      page.locator('h3', {
        hasText: 'Sign in or create account to assign a curriculum',
      }),
    ).toBeVisible();

    // Follow the sign-in link and verify the sign-in page loads.
    await page.locator('a', {hasText: 'Sign in or create account'}).click();
    await expect(
      page.locator('h2', {hasText: 'Have an account already? Sign in'}),
    ).toBeVisible();
  });
});

test.describe('Curriculum Catalog — signed-in student', () => {
  /**
   * Source: curriculum_catalog.feature — "Signed-in student does not see Assign button"
   * @as_student
   *
   * Students are not allowed to assign curricula; the Assign button must not
   * appear on the catalog page for a signed-in student account.
   */
  test('signed-in student does not see Assign button', async ({
    studentPage,
  }) => {
    await studentPage.goto('/catalog');
    await waitForCatalog(studentPage);
    await expect(
      studentPage.locator('button', {hasText: 'Assign'}),
    ).not.toBeVisible();
  });
});

test.describe('Curriculum Catalog — signed-in teacher', () => {
  /**
   * Source: curriculum_catalog.feature —
   * "Signed-in teacher without sections is prompted to create sections when clicking Assign"
   * @as_teacher
   *
   * A teacher with no sections who clicks Assign should see a "Create class
   * section" dialog, and following the Create Section link should land on /home
   * with the "New class section" button visible.
   */
  test('teacher without sections is prompted to create a section', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/catalog');
    await waitForCatalog(teacherPage);

    await teacherPage
      .locator('[aria-label="Assign AI for Oceans to your classroom"]')
      .click();
    await expect(
      teacherPage.locator('h3', {
        hasText: 'Create class section to assign a curriculum',
      }),
    ).toBeVisible();

    await teacherPage.locator('a', {hasText: 'Create Section'}).click();
    await teacherPage.waitForURL('**/home', {timeout: 15_000});
    await expect(
      teacherPage.locator('button', {hasText: 'New class section'}),
    ).toBeVisible({timeout: 15_000});
  });
});

test.describe('Curriculum Catalog — assign and unassign', () => {
  test.describe.configure({mode: 'serial'});

  /**
   * Migration status: COMPLETED
   * Source: curriculum_catalog_assign_unassign.feature
   * Scenario: Signed-in teacher with sections assigns and unassigns offerings to sections
   *
   * Creates a teacher with two named sections, assigns AI for Oceans to
   * Section 1 and UI Test CSP to Section 2, verifies on /home, then
   * unassigns both and verifies again.
   */
  test('teacher assigns and unassigns courses to named sections', async ({
    page,
  }) => {
    await assignAndUnassignCatalogOfferings(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: curriculum_catalog_assign_unassign.feature
   * Scenario: On expanded card, Signed-in teacher with sections assigns and unassigns offerings to sections
   * @no_mobile
   *
   * Same assign/unassign assertions as above, but starts each assignment from
   * the expanded catalog card's details view.
   */
  test(
    'teacher assigns and unassigns courses from expanded cards',
    {tag: '@no_mobile'},
    async ({page}) => {
      await assignAndUnassignCatalogOfferings(page, {expandedCard: true});
    },
  );
});
