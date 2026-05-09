import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Modular Courses — navigation within and between modular courses preserves
 * the correct course context in URLs and breadcrumbs.
 *
 * Source: dashboard/test/ui/features/teacher_tools/modular_courses.feature
 */

/**
 * Click the "Go to Unit" button inside the course-script card whose text
 * contains unitName.
 * Mirrors `I click the button in the unit card for unit "X"` from steps.rb.
 *
 * @param page - Playwright page on a course overview page
 * @param unitName - display name of the unit card to find
 */
async function clickGoToUnit(
  page: import('@playwright/test').Page,
  unitName: string,
): Promise<void> {
  const cards = page.locator('.uitest-CourseScript');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.innerText().catch(() => '');
    if (text.includes(unitName)) {
      await card.getByRole('link', {name: 'Go to Unit'}).click();
      return;
    }
  }
  throw new Error(`No course-script card found containing "${unitName}"`);
}

/**
 * Open the lesson-progress dropdown in the level-page header.
 * Mirrors `I open the progress drop down of the current page` from progress.rb.
 *
 * @param page - Playwright page at a level
 */
async function openProgressDropDown(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.locator('.header_popup_link').click();
  await page
    .locator('.uitest-summary-progress-table')
    .waitFor({state: 'visible', timeout: 15_000});
}

/**
 * Run the full modular-course navigation sequence for one course slug.
 * Steps mirror the Scenario body for courses ui-test-course-2017 and
 * ui-test-course-2019 (the scenario iterates both slugs).
 *
 * @param page - Playwright page signed in as a teacher
 * @param courseSlug - e.g. "ui-test-course-2017"
 */
async function runCourseNavigationSequence(
  page: import('@playwright/test').Page,
  courseSlug: string,
): Promise<void> {
  await page.goto(`/courses/${courseSlug}`);
  await expect(
    page
      .locator('.uitest-CourseScript')
      .filter({hasText: 'UI Test Shared Unit'}),
  ).toBeVisible({timeout: 15_000});

  // Unit overview references the course we came from.
  await clickGoToUnit(page, 'UI Test Shared Unit');
  await page
    .locator('.unit-overview-top-row')
    .waitFor({state: 'visible', timeout: 20_000});
  await expect(page).toHaveURL(new RegExp(`/courses/${courseSlug}/units/`), {
    timeout: 15_000,
  });
  await expect(page.locator('.unit-breadcrumb')).toContainText(courseSlug, {
    timeout: 10_000,
  });

  // Level references the course we came from.
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('#progress-lesson-1 .progress-bubble-link').first().click(),
  ]);
  await page
    .locator('#level-body')
    .waitFor({state: 'visible', timeout: 20_000});
  await expect(page).toHaveURL(new RegExp(`/courses/${courseSlug}/units/`), {
    timeout: 10_000,
  });

  // Continuing keeps us in the same course.
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('.submitButton').click(),
  ]);
  await page
    .locator('#level-body')
    .waitFor({state: 'visible', timeout: 20_000});
  await expect(page).toHaveURL(new RegExp(`/courses/${courseSlug}/units/`), {
    timeout: 10_000,
  });

  // Progress dropdown View Unit Overview navigates back to unit overview.
  await page
    .locator('.header_popup_link')
    .waitFor({state: 'visible', timeout: 10_000});
  await openProgressDropDown(page);
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.getByRole('link', {name: 'View Unit Overview'}).click(),
  ]);
  await page
    .locator('.unit-overview-top-row')
    .waitFor({state: 'visible', timeout: 20_000});
  await expect(page).toHaveURL(new RegExp(`/courses/${courseSlug}/units/`), {
    timeout: 10_000,
  });

  // Unit breadcrumb links back to the course overview.
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('.unit-breadcrumb a').click(),
  ]);
  await page
    .locator('#course_overview')
    .waitFor({state: 'visible', timeout: 20_000});
  await expect(page).toHaveURL(new RegExp(`/courses/${courseSlug}$`), {
    timeout: 10_000,
  });
}

test.describe('Using Modular Courses', {tag: '@no_mobile'}, () => {
  /**
   * Source: modular_courses.feature — "Navigating within modular courses"
   *
   * URL and breadcrumb context is maintained for both ui-test-course-2017
   * and ui-test-course-2019 (both share "UI Test Shared Unit").
   */
  test('navigating within modular courses preserves course context', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto('/home');

    await runCourseNavigationSequence(page, 'ui-test-course-2017');
    await runCourseNavigationSequence(page, 'ui-test-course-2019');
  });
});
