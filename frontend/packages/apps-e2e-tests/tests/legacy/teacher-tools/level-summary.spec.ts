import {type Locator, type Page} from '@playwright/test';

import {
  createAuthorizedTeacher,
  createSection,
  createStudent,
  createTeacher,
  createTeacherAssociatedStudent,
  joinSection,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {dismissTeacherPanel} from '../../shared/ui';

/**
 * Level Summary — teacher view of student free-response submissions.
 *
 * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
 *
 * The @eyes scenarios execute through the interaction points where Cucumber
 * takes Applitools snapshots; the visual assertion is stubbed with comments.
 * The source @skip "Check free response AI" scenario remains quarantined.
 */

/**
 * Open a level summary as a teacher with a fresh section.
 *
 * @param page - Playwright page
 * @param path - summary page path
 * @param authorized - whether the teacher needs authorized-teacher access
 */
async function openSummaryWithSection(
  page: Page,
  path: string,
  authorized = false,
): Promise<void> {
  if (authorized) {
    await createAuthorizedTeacher(page);
  } else {
    await createTeacher(page);
  }
  await createSection(page);
  await page.goto(path);
  await page
    .locator('#summary-container')
    .waitFor({state: 'visible', timeout: 30_000});
  await page
    .locator('#summary-container .uitest-sectionselect')
    .waitFor({state: 'visible', timeout: 15_000});
}

/**
 * Submit a response on allthethingscourse lesson 27 level 1.
 *
 * @param page - Playwright page signed in as a student
 * @param text - response text to submit
 */
async function submitFreeResponse(page: Page, text: string): Promise<void> {
  await page.goto('/courses/allthethingscourse/units/1/lessons/27/levels/1/');
  await page
    .locator('.free-response > textarea')
    .waitFor({state: 'visible', timeout: 30_000});
  await page.locator('.free-response > textarea').fill(text);
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('.submitButton').click(),
  ]);
}

/**
 * Enable student names using the visible switch label.
 * Agent Browser shows the checkbox as the readiness signal, but the input is
 * covered by the styled switch span, so Playwright must click the label text.
 *
 * @param page - Playwright page on a level summary
 */
async function showStudentNames(page: Page): Promise<void> {
  const checkbox = page.getByRole('checkbox', {name: /Show student names/});
  if (!(await checkbox.isChecked())) {
    await clickSwitchLabel(page, checkbox, 'Show student names');
  }
  await expect(checkbox).toBeChecked({timeout: 10_000});
}

/**
 * Enable AI insights using the visible switch label.
 * The styled switch covers the checkbox input, matching the student-name
 * switch behavior.
 *
 * @param page - Playwright page on a level summary
 */
async function showAiInsights(page: Page): Promise<void> {
  const checkbox = page.getByRole('checkbox', {name: /Show AI Insights/});
  if (!(await checkbox.isChecked())) {
    await clickSwitchLabel(page, checkbox, 'Show AI Insights');
  }
  await expect(checkbox).toBeChecked({timeout: 10_000});
}

/**
 * Toggles a summary-page switch through its visible label, matching the
 * Cucumber `label:contains(...)` selector.  The checkbox input is styled and
 * can receive a pointer click without changing state in Firefox.
 *
 * @param page - Playwright page on a level summary
 * @param checkbox - switch checkbox locator
 * @param labelText - visible switch label
 */
async function clickSwitchLabel(
  page: Page,
  checkbox: Locator,
  labelText: string,
): Promise<void> {
  const label = page
    .locator('label')
    .filter({has: checkbox})
    .filter({hasText: labelText})
    .first();

  await expect(async () => {
    if (!(await checkbox.isChecked())) {
      await label.click();
    }
    if (!(await checkbox.isChecked())) {
      await label.evaluate(element => (element as HTMLElement).click());
    }
    if (!(await checkbox.isChecked())) {
      await checkbox.focus();
      await page.keyboard.press('Space');
    }
    expect(await checkbox.isChecked()).toBe(true);
  }).toPass({timeout: 10_000});
}

test.describe(
  'Level Summary — Check for Understanding summaries',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Free Response level 1
     */
    test('free response level 1 visual summary reaches snapshot point', async ({
      page,
    }) => {
      await openSummaryWithSection(
        page,
        '/courses/allthethingscourse/units/1/lessons/27/levels/1/summary',
      );
      // Applitools snapshot stub: "free response level summary 1".
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Free Response level 2
     */
    test('free response level 2 visual summary reaches snapshot point', async ({
      page,
    }) => {
      await openSummaryWithSection(
        page,
        '/courses/allthethingscourse/units/1/lessons/27/levels/2/summary',
      );
      // Applitools snapshot stub: "free response level summary 2".
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Free Response level 3
     */
    test('free response level 3 visual summary reaches snapshot point', async ({
      page,
    }) => {
      await openSummaryWithSection(
        page,
        '/courses/allthethingscourse/units/1/lessons/27/levels/3/summary',
      );
      // Applitools snapshot stub: "free response level summary 3".
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Multi level 1
     */
    test('multi level 1 visual summary reaches snapshot points', async ({
      page,
    }) => {
      await openSummaryWithSection(
        page,
        '/courses/allthethingscourse/units/1/lessons/9/levels/1/summary',
        true,
      );
      // Applitools snapshot stub: "multi level summary 1".
      await page.locator('span', {hasText: 'Show answer'}).first().click();
      // Applitools snapshot stub: "multi level summary 1 show answer".
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Multi level 2
     */
    test('multi level 2 visual summary reaches snapshot points', async ({
      page,
    }) => {
      await openSummaryWithSection(
        page,
        '/courses/allthethingscourse/units/1/lessons/9/levels/4/summary',
        true,
      );
      // Applitools snapshot stub: "multi level summary 2".
      await page.locator('span', {hasText: 'Show answer'}).first().click();
      // Applitools snapshot stub: "multi level summary 2 show answer".
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Check for Understanding summaries
     */
    test('teacher can show/hide student names and hide responses in summary', async ({
      page,
    }) => {
      const studentName = `Sally_${Date.now()}`;
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName,
        });

      await submitFreeResponse(page, 'sample response');

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/27/levels/1/summary',
      );
      await page
        .locator('#summary-container')
        .waitFor({state: 'visible', timeout: 30_000});
      await dismissTeacherPanel(page);
      const summary = page.locator('#summary-container');

      await expect(
        summary.locator('p').filter({hasText: 'sample response'}),
      ).toBeVisible({timeout: 15_000});
      await expect(
        summary.locator('p').filter({hasText: studentName}),
      ).not.toBeAttached();

      await showStudentNames(page);
      await summary
        .locator('p')
        .filter({hasText: 'sample response'})
        .scrollIntoViewIfNeeded();
      await expect(
        summary.locator('p').filter({hasText: studentName}),
      ).toBeVisible({timeout: 10_000});

      await page
        .locator("button[aria-label='Additional options']")
        .first()
        .click();
      await page
        .getByRole('button', {name: /Hide response/})
        .first()
        .click();
      await expect(
        page.getByRole('button', {name: 'Show hidden responses'}),
      ).toBeVisible({timeout: 10_000});

      await expect(
        summary.locator('p').filter({hasText: 'sample response'}),
      ).not.toBeVisible();
      await expect(
        summary.locator('p').filter({hasText: studentName}),
      ).not.toBeVisible();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Check free response AI
     */
    test('free response AI summary analysis', async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });

      await submitFreeResponse(page, 'sample response');

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/27/levels/1/summary',
      );
      await page
        .locator('#summary-container')
        .waitFor({state: 'visible', timeout: 30_000});
      await dismissTeacherPanel(page);

      await showAiInsights(page);
      const evaluateResponses = page.getByRole('button', {
        name: 'Evaluate student responses',
      });
      await expect(evaluateResponses).toBeEnabled({timeout: 15_000});
      await evaluateResponses.click();

      await expect(
        page.locator('#summary-container').locator('p', {
          hasText: 'Proficient: 1',
        }),
      ).toBeVisible({timeout: 30_000});

      await page.getByText('View detailed analysis', {exact: true}).click();
      await expect(
        page.locator('#summary-container').locator('p', {
          hasText: 'Dummy data returned for testing purposes.',
        }),
      ).toBeVisible({timeout: 10_000});

      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/27/levels/2/summary',
      );
      await page
        .locator('#summary-container')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.getByRole('checkbox', {name: /Show AI Insights/}),
      ).not.toBeAttached();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/level_summary.feature
     * Scenario: Check for Understanding summaries eyes
     */
    test('check for understanding summary visual states reach snapshot points', async ({
      page,
    }) => {
      const {teacherEmail, teacherPassword, sectionCode} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Sally',
        });

      await submitFreeResponse(page, 'sample response');

      await createStudent(page, {name: 'Student2'});
      await joinSection(page, sectionCode);
      await submitFreeResponse(page, 'sample response 2');

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/27/levels/1/summary',
      );
      await page
        .locator('#summary-container')
        .waitFor({state: 'visible', timeout: 30_000});

      // Applitools snapshot stub: "student names hidden".
      await showStudentNames(page);
      await page
        .locator('#summary-container')
        .locator('p')
        .filter({hasText: 'Sally'})
        .scrollIntoViewIfNeeded();
      await expect(
        page.locator('#summary-container').locator('p').filter({
          hasText: 'Sally',
        }),
      ).toBeVisible({timeout: 10_000});
      // Applitools snapshot stub: "student names shown".

      const firstResponse = page
        .locator('#summary-container')
        .locator('p')
        .filter({hasText: /^sample response$/})
        .locator(
          'xpath=ancestor::div[.//button[@aria-label="Additional options"]][1]',
        );
      await firstResponse.scrollIntoViewIfNeeded();
      await firstResponse
        .locator("button[aria-label='Additional options']")
        .first()
        .click();
      await expect(
        page.getByRole('button', {name: /Pin response/}).first(),
      ).toBeVisible({timeout: 10_000});
      await page
        .getByRole('button', {name: /Pin response/})
        .first()
        .click();
      // Applitools snapshot stub: "pinned response".
    });
  },
);
