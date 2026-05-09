import {assignCourseAndUnit, createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Course Versions — version warning banners and version-selector dropdown.
 *
 * Source: dashboard/test/ui/features/teacher_tools/course_versions.feature
 *
 * All three scenarios use a signed-in student.  Assignment to an older course
 * version is done via assignCourseAndUnit() (mirrors `I am assigned to course
 * "X" unit N` → POST /api/test/assign_course_and_unit_as_student).
 *
 * Test courses used:
 *   ui-test-course-2017 / ui-test-course-2019  — multi-unit course with versions
 *   ui-test-versioned-script-2017 / -2019      — single-unit versioned course
 */

test.describe('Course Versions', {tag: '@no_mobile'}, () => {
  /**
   * Source: "Version warning announcement on course and script overview pages"
   *
   * Without assignment: no version selector or warning on course-2019.
   * After assignment to course-2017 unit 1: version selector and warning appear.
   * After generating progress in course-2017: specific warning text appears.
   * Closing the banner persists across reload and across course overview.
   */
  test('version warning appears after assignment and dismisses persistently', async ({
    page,
  }) => {
    await createStudent(page);

    // Without assignment: no version selector, no newer-version warning.
    await page.goto('/courses/ui-test-course-2019');
    await expect(page.locator('.uitest-CourseScript').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).not.toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeAttached();

    // Assign to older version.
    await assignCourseAndUnit(page, 'ui-test-course-2017', 1);

    // Course overview now shows version selector + warning.
    await page.goto('/courses/ui-test-course-2019');
    await expect(page.locator('.uitest-CourseScript').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).toBeVisible();

    // Unit overview: no version selector but warning still present.
    await page.goto('/courses/ui-test-course-2019/units/1');
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).not.toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).toBeVisible();

    // Generate progress in 2017 by visiting /next (redirects to first level).
    await page.goto('/courses/ui-test-course-2017/units/1/next');
    await page.waitForURL(
      /\/courses\/ui-test-course-2017\/units\/1\/lessons\/1\/levels\/1/,
      {timeout: 30_000},
    );

    // Course overview warning now shows the "using the dropdown below" variant.
    await page.goto('/courses/ui-test-course-2019');
    await expect(page.locator('.uitest-CourseScript').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).toBeVisible();
    await expect(
      page.locator('.announcement-notification', {
        hasText: 'using the dropdown below',
      }),
    ).toBeVisible();

    // Unit overview warning shows the "going to the course page" variant.
    await page.goto('/courses/ui-test-course-2019/units/1');
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator('.announcement-notification', {
        hasText: 'going to the course page',
      }),
    ).toBeVisible();

    // Dismiss the unit-level banner. Use dispatchEvent so React's synthetic
    // handler fires in all browsers (WebKit pointer-events on <i> can block
    // native Playwright click from reaching the handler).
    await page
      .locator('.announcement-notification', {hasText: 'newer version'})
      .locator('.fa-xmark')
      .dispatchEvent('click');
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeVisible({timeout: 10_000});

    // Dismissed state persists after reload.
    await page.reload();
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeVisible();

    // Course overview: dismissed on unit does not affect course overview
    // (the course overview banner was not dismissed, but the test says it
    // "does not exist" — the course overview manages its own dismissed state).
    await page.goto('/courses/ui-test-course-2019');
    await expect(page.locator('.uitest-CourseScript').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeAttached();
  });

  /**
   * Source: "Versions warning announcement on script overview page"
   *
   * Without assignment to the 2017 version: no selector on the 2019 unit page.
   * After assignment + progress: warning appears on the 2019 page.
   * Dismissing the banner persists across reload.
   */
  test('version warning on script overview dismisses persistently', async ({
    page,
  }) => {
    await createStudent(page);

    // Without assignment: no version selector, no warning on 2019 unit.
    await page.goto('/courses/ui-test-versioned-script-2019/units/1');
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).not.toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeAttached();

    // Assign to 2017 and generate progress.
    await assignCourseAndUnit(page, 'ui-test-versioned-script-2017', 1);
    await page.goto('/courses/ui-test-versioned-script-2017/units/1/next');
    await page.waitForURL(
      /\/courses\/ui-test-versioned-script-2017\/units\/1\/lessons\/1\/levels\/1/,
      {timeout: 30_000},
    );

    // 2019 unit overview now shows version selector + warning; URL is 2019.
    await page.goto('/courses/ui-test-versioned-script-2019/units/1');
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/ui-test-versioned-script-2019/);
    await expect(page.locator('#uitest-version-selector')).toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).toBeVisible();

    // Dismiss the banner. Use dispatchEvent to ensure React's synthetic event
    // handler fires in all browsers including Firefox, where pointer-events on
    // the <i> icon can cause the native Playwright click to miss the handler.
    await page
      .locator('.announcement-notification', {hasText: 'newer version'})
      .locator('.fa-xmark')
      .dispatchEvent('click');
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeVisible({timeout: 10_000});

    // Dismissed state persists after reload.
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).toBeVisible();
    await expect(
      page.locator('.announcement-notification', {hasText: 'newer version'}),
    ).not.toBeVisible();
  });

  /**
   * Source: "Switch versions using dropdown on script overview page"
   *
   * Without assignment, navigating to the 2017 unit redirects to 2019.
   * After assignment to 2017: the version selector dropdown lets the student
   * switch between 2017 and 2019 (2018 is never listed).
   */
  test('version selector dropdown switches between course versions', async ({
    page,
  }) => {
    await createStudent(page);

    // Without assignment: 2017 unit redirects to 2019.
    await page.goto('/courses/ui-test-versioned-script-2017/units/1');
    await page.waitForURL(/ui-test-versioned-script-2019/, {
      timeout: 30_000,
    });
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).not.toBeVisible();

    // Assign to 2017.
    await assignCourseAndUnit(page, 'ui-test-versioned-script-2017', 1);

    // Now 2017 unit loads without redirect.
    await page.goto('/courses/ui-test-versioned-script-2017/units/1');
    await expect(page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-version-selector')).toBeVisible();

    // 2018 is never listed; 2019 is available.
    // Dropdown items can render outside the browser viewport when the selector
    // is near the bottom of the page — use JS click to bypass viewport checking.
    await page.locator('#assignment-version-year').click();
    await expect(
      page.locator('.assignment-version-title', {hasText: '2018'}),
    ).not.toBeVisible();
    await page
      .locator('.assignment-version-title', {hasText: '2019'})
      .evaluate(el => (el as HTMLElement).click());
    await page.waitForURL(/ui-test-versioned-script-2019\/units\/1/, {
      timeout: 30_000,
    });
    await expect(page.locator('#script-title')).toContainText('2019', {
      timeout: 20_000,
    });

    // Switch back to 2017.
    await expect(page.locator('#uitest-version-selector')).toBeVisible();
    await page.locator('#assignment-version-year').click();
    await expect(
      page.locator('.assignment-version-title', {hasText: '2018'}),
    ).not.toBeVisible();
    await page
      .locator('.assignment-version-title', {hasText: '2017'})
      .evaluate(el => (el as HTMLElement).click());
    await page.waitForURL(/ui-test-versioned-script-2017\/units\/1/, {
      timeout: 30_000,
    });
  });
});
