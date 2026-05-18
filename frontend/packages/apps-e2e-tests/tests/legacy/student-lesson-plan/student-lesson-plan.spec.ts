import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/teacher_tools/student_lesson_plan.feature
 * Scenario: Viewing Student Lesson Plan
 */
test(
  'student lesson plan: content sections and lesson navigation',
  {tag: '@no_mobile'},
  async ({browserName, page}) => {
    test.skip(browserName === 'webkit', '@no_safari');

    await createStudent(page, {name: 'Jean'});
    await page.goto('/courses/allthelessonplans/units/1?no_redirect=true');
    await page
      .locator('.ui-test-lesson-resources')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});

    const [lessonPlanPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('.ui-test-lesson-resources').first().click(),
    ]);

    await lessonPlanPage.waitForURL(
      /\/courses\/allthelessonplans\/units\/1\/lessons\/1\/student/,
      {timeout: 30_000, waitUntil: 'domcontentloaded'},
    );
    await lessonPlanPage
      .locator('#show-container')
      .waitFor({state: 'visible', timeout: 30_000});

    // Lesson name
    await expect(
      lessonPlanPage.locator('h1:has-text("Lesson 1: First Lesson")'),
    ).toBeVisible({timeout: 15_000});

    // Sections: Overview, Resources, Vocabulary, Introduced Code
    await expect(lessonPlanPage.locator('h2:has-text("Overview")')).toBeVisible(
      {timeout: 15_000},
    );
    await expect(
      lessonPlanPage.locator('p:has-text("Student overview of the lesson")'),
    ).toBeVisible({timeout: 15_000});

    await expect(
      lessonPlanPage.locator('h2:has-text("Resources")'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      lessonPlanPage.locator('li a:has-text("Student Resource")'),
    ).toBeVisible({timeout: 15_000});

    await expect(
      lessonPlanPage.locator('h2:has-text("Vocabulary")'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      lessonPlanPage.locator(
        'li:has-text("Word - This is a definition of the word word")',
      ),
    ).toBeVisible({timeout: 15_000});

    await expect(
      lessonPlanPage.locator('h2:has-text("Introduced Code")'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      lessonPlanPage.locator('li a:has-text("playSound")'),
    ).toBeVisible({timeout: 15_000});

    // Announcements
    const announcements = lessonPlanPage.locator('.announcement-notification');
    await expect(announcements.first()).toContainText(
      'Information for Students',
    );
    await expect(announcements.nth(1)).toContainText(
      'Information for Students and Teachers',
    );

    // Navigate to Lesson 2 via dropdown nav.
    // The dropdown groups lessons by lesson group.  On entry the current group
    // (Lesson Group 1, containing Lesson 1) is expanded; its section header and
    // Lesson 1 link are shown.  Lesson Group 2 header is shown but collapsed —
    // click it first to expand the group and reveal the Lesson 2 link.
    await lessonPlanPage
      .locator('.uitest-lesson-dropdown-nav')
      .waitFor({state: 'visible', timeout: 15_000});
    await lessonPlanPage.locator('.uitest-lesson-dropdown-nav').click();

    // Wait for dropdown to open (section headers appear).
    await lessonPlanPage
      .locator('a.no-navigation')
      .nth(1)
      .waitFor({state: 'visible', timeout: 15_000});
    // Click the second section header (Lesson Group 2) to expand it.
    await lessonPlanPage.locator('a.no-navigation').nth(1).click();

    // Lesson 2 is now the first a.navigate in the dropdown.
    await lessonPlanPage
      .locator('a.navigate')
      .first()
      .waitFor({state: 'visible', timeout: 15_000});
    await Promise.all([
      lessonPlanPage.waitForURL(
        /\/courses\/allthelessonplans\/units\/1\/lessons\/2\/student/,
        {timeout: 30_000, waitUntil: 'domcontentloaded'},
      ),
      lessonPlanPage.locator('a.navigate').first().click(),
    ]);
    await expect(
      lessonPlanPage.locator('h1:has-text("Lesson 2: Second Lesson")'),
    ).toBeVisible({timeout: 15_000});

    // Navigate back to the unit overview.
    await lessonPlanPage
      .locator('a:has-text("All The Lesson Plans")')
      .waitFor({state: 'visible', timeout: 15_000});
    await Promise.all([
      lessonPlanPage.waitForURL(/\/courses\/allthelessonplans\/units\/1/, {
        timeout: 30_000,
        waitUntil: 'domcontentloaded',
      }),
      lessonPlanPage.locator('a:has-text("All The Lesson Plans")').click(),
    ]);
  },
);
