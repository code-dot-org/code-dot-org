import {createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Submittable free response level type — lesson 27 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/free_response_submittable.feature
 *
 * All scenarios tagged @no_mobile and @as_taught_student (student enrolled in a
 * teacher's section).
 */

const LEVEL_1_URL =
  '/courses/allthethingscourse/units/1/lessons/27/levels/1?noautoplay=true';

/** Lesson 27 level 4 — no multiple attempts; locks after first submit. */
const LEVEL_4_URL =
  '/courses/allthethingscourse/units/1/lessons/27/levels/4?noautoplay=true';

async function clickAndWaitForNavigation(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<void> {
  await Promise.all([
    page.waitForNavigation({waitUntil: 'load', timeout: 30_000}),
    page.locator(selector).first().click(),
  ]);
}

test.describe('Free response submittable — lesson 27', () => {
  test(
    'loading the level shows the question heading',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Scenario: Loading the level
      await createTeacherAssociatedStudent(page);
      await page.goto(LEVEL_1_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.free-response > h1')).toHaveText(
        'Submit a Lesson Plan: Routing and Packets',
      );
    },
  );

  test(
    'submit, unsubmit, and resubmit cycle restores editable state',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Scenario: Submit anything, unsubmit, be able to resubmit.
      await createTeacherAssociatedStudent(page);
      await page.goto(LEVEL_1_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Submit a response; navigates away.
      await page.locator('.free-response > textarea').fill('sample response');
      await clickAndWaitForNavigation(page, '.submitButton');

      // Reload — unsubmit button visible, submit hidden, text preserved.
      await page.goto(LEVEL_1_URL);
      await page
        .locator('.unsubmitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.free-response > textarea')).toContainText(
        'sample response',
      );
      await expect(page.locator('.unsubmitButton')).toBeVisible();
      await expect(page.locator('.submitButton')).toBeHidden();

      // Unsubmit — confirmation modal; confirm navigates back.
      await page.locator('.unsubmitButton').click();
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await clickAndWaitForNavigation(page, '.modal #ok-button');

      // After unsubmit: submit button is visible and enabled.
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.submitButton')).toBeVisible();
      await expect(page.locator('.submitButton')).toBeEnabled();
    },
  );

  test(
    'level without multiple attempts locks after submit',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Scenario: Level without multiple attempts allowed is locked after submit
      await createTeacherAssociatedStudent(page);
      await page.goto(LEVEL_4_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Submit a response; navigates away.
      await page.locator('.free-response > textarea').fill('sample response');
      await clickAndWaitForNavigation(page, '.submitButton');

      // Reload — next-level button visible, textarea readonly, submit gone.
      await page.goto(LEVEL_4_URL);
      await page
        .locator('.nextLevelButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.free-response > textarea')).toContainText(
        'sample response',
      );
      // readOnly is a DOM property, not an HTML attribute.
      await expect(page.locator('.free-response > textarea')).toHaveJSProperty(
        'readOnly',
        true,
      );
      await expect(page.locator('.submitButton')).toBeHidden();
    },
  );
});
