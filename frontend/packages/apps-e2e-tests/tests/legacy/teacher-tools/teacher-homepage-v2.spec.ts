import type {Locator, Page} from '@playwright/test';

import {
  createSection,
  createSectionWithCourse,
  createStudent,
  createTeacher,
  getLevelbuilderAccess,
  joinSection,
  signIn,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Teacher Homepage V2 — section management actions from the teacher dashboard
 * home page.
 *
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
 */

/**
 * Confirms the course assignment dialog and waits for the section PATCH that
 * persists the checked section.  The source scenario waits for the visible
 * success toast, but the dashboard card needs the saved section assignment.
 *
 * @param page - Playwright page with the assignment dialog open
 * @returns true when the section PATCH is observed and succeeds
 */
async function confirmSectionAssignments(page: Page): Promise<boolean> {
  const sectionPatch = page
    .waitForResponse(
      response =>
        response.url().includes('/dashboardapi/sections/') &&
        response.request().method() === 'PATCH',
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
 * Assigns AI for Oceans to the empty teacher section.  If the dialog closes
 * without emitting the save PATCH, reopen it and repeat the same visible user
 * flow instead of navigating ahead with unsaved state.
 *
 * @param page - Playwright page on the course catalog page
 * @param openButton - "Assign AI for Oceans to your classroom" button
 */
async function assignAiForOceansToUntitledSection(
  page: Page,
  openButton: Locator,
): Promise<void> {
  const sectionOption = page.getByRole('checkbox', {
    name: 'Untitled Section',
  });
  const confirmAssignments = page.getByRole('button', {
    name: 'Confirm section assignments',
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    await openButton.click();
    await expect(confirmAssignments).toBeVisible({timeout: 15_000});
    await expect(sectionOption).toBeVisible({timeout: 10_000});
    await sectionOption.evaluate(element => (element as HTMLElement).click());
    if (!(await sectionOption.isChecked().catch(() => false))) {
      await expect(openButton).toBeVisible({timeout: 15_000});
      continue;
    }
    await expect(confirmAssignments).toBeEnabled({timeout: 10_000});

    if (await confirmSectionAssignments(page)) {
      await expect(
        page.locator('p').filter({hasText: 'You have successfully assigned'}),
      ).toBeVisible({timeout: 15_000});
      return;
    }

    await expect(openButton).toBeVisible({timeout: 15_000});
  }

  throw new Error('Course assignment dialog closed before saving the section');
}

test.describe('Teacher Homepage V2', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can access section pages from section options dropdown
   *
   * Settings, Roster, Login cards, and Print certificates links all load the
   * correct destination pages.
   */
  test('section options dropdown links navigate to correct pages', async ({
    page,
  }) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createTeacher(page);
    await page.goto('/home');
    await getLevelbuilderAccess(page);

    const {sectionCode} = await createSectionWithCourse(
      page,
      'ui-test-single-unit-course-2026',
      1,
    );
    const {displayName: studentName} = await createStudent(page);
    await joinSection(page, sectionCode);

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/teacher_dashboard/home');

    // Settings
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-Section-settings')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-Section-settings').click();
    await page
      .locator('#sections-set-up-container')
      .waitFor({state: 'visible', timeout: 15_000});

    // Roster
    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-Roster')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-Roster').click();
    await page
      .locator('#uitest-manage-students-table')
      .waitFor({state: 'visible', timeout: 15_000});

    // Login cards
    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-Login-cards')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-Login-cards').click();
    await page
      .locator('#ui-test-section-login-info')
      .waitFor({state: 'visible', timeout: 15_000});

    // Print certificates (navigates to a new page)
    await page.goto('/teacher_dashboard/home');
    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-print-certificates')
      .waitFor({state: 'visible', timeout: 10_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#ui-test-print-certificates').click(),
    ]);
    await page
      .locator('#certificate-batch')
      .waitFor({state: 'visible', timeout: 15_000});

    void studentName;
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can archive and restore sections from the section options dropdown
   */
  test('teacher can archive and restore sections', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-archive-section')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-archive-section').click();
    await page.locator('#ui-test-archived').click();

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-archive-section')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-archive-section').click();
    await page.locator('#ui-test-teaching').click();

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can delete a section from the section options dropdown
   */
  test('teacher can delete a section', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#section-options-dropdown-dropdown-button').click();
    await page
      .locator('#ui-test-delete-section')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-delete-section').click();
    await page
      .locator('#ui-test-delete-section-confirm')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-delete-section-confirm').click();

    await expect(
      page.locator('#section-options-dropdown-dropdown-button'),
    ).not.toBeAttached({timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can assign a course from the "Assign a course" button and access lessons from the "Jump to" dropdown
   */
  test('teacher assigns course from empty-state button and uses Jump to dropdown', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#ui-test-empty-state-button-Assign-a-course')
      .waitFor({state: 'visible', timeout: 30_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#ui-test-empty-state-button-Assign-a-course').click(),
    ]);

    // Assign AI for Oceans.
    await page
      .locator('h4')
      .filter({hasText: 'AI for Oceans'})
      .waitFor({state: 'visible', timeout: 30_000});
    const assignAiForOceans = page.locator(
      "[aria-label='Assign AI for Oceans to your classroom']",
    );
    await assignAiForOceansToUntitledSection(page, assignAiForOceans);

    const courseDropdown = page.locator(
      '#course-content-dropdown-Untitled-Section',
    );
    await expect(async () => {
      await page.goto('/teacher_dashboard/home');
      await expect(courseDropdown).toContainText('Course: AI for Oceans', {
        timeout: 5_000,
      });
    }).toPass({timeout: 45_000});

    await page
      .locator('#go-to-lesson-dropdown-button')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#go-to-lesson-dropdown-button').click();
    await page
      .locator('#ui-test-lesson-AI-for-Oceans')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-lesson-AI-for-Oceans').click();
    await page
      .locator('a')
      .filter({hasText: 'AI for Oceans'})
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can access section roster from the "Add students" button on the section card
   */
  test('teacher opens roster via Add students button', async ({page}) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSection(page);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#ui-test-empty-state-button-Add-students')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#ui-test-empty-state-button-Add-students').click();
    await page
      .locator('#uitest-manage-students-table')
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can view student progress from the "View progress" button on the section card
   */
  test('teacher views student progress from View progress button', async ({
    page,
  }) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createTeacher(page);
    await page.goto('/home');
    await getLevelbuilderAccess(page);

    const {sectionCode} = await createSectionWithCourse(
      page,
      'ui-test-single-unit-course-2026',
      1,
    );
    await createStudent(page, {name: 'Bobby'});
    await joinSection(page, sectionCode);

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#task-button-View-progress-New-Section')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#task-button-View-progress-New-Section').click();
    await page
      .locator('h1')
      .filter({hasText: 'Progress'})
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can view lesson materials from the "View lesson materials" button on the section card
   */
  test('teacher views lesson materials from View lesson materials button', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/home');
    await createSectionWithCourse(page, 'ui-test-single-unit-course-2026', 1);
    await page.goto('/teacher_dashboard/home');

    await page
      .locator('#task-button-View-lesson-materials-New-Section')
      .waitFor({state: 'visible', timeout: 30_000});
    await page
      .locator('#task-button-View-lesson-materials-New-Section')
      .click();
    await page
      .locator('h1')
      .filter({hasText: 'Lesson Materials'})
      .waitFor({state: 'visible', timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature
   * Scenario: Teacher can view sections on new teacher homepage
   */
  test('teacher can view sections on new teacher homepage', async ({
    page,
    eyes,
  }) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createTeacher(page, {name: 'Teacher Hank'});
    await page.goto('/home');
    await getLevelbuilderAccess(page);

    await createSection(page);
    const {sectionCode} = await createSectionWithCourse(
      page,
      'ui-test-single-unit-course-2026',
      1,
    );
    await createStudent(page, {name: 'Bobby'});
    await joinSection(page, sectionCode);

    await signOut(page);
    await signIn(page, teacherEmail, teacherPassword);
    await eyes.open('teacher homepage');
    await page.goto('/teacher_dashboard/home');

    await expect(page.locator('#ui-test-section-list')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('New Section')).toBeVisible();
    await expect(page.getByText('Untitled Section')).toBeVisible();
    await eyes.check('teacher homepage');
  });
});
