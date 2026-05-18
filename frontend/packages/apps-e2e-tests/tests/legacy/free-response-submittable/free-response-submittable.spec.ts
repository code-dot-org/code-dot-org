import type {Page} from '@playwright/test';

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

/**
 * Activates a legacy control without depending on jQuery.
 *
 * The source Cucumber scenario uses `using jQuery` for these controls. In
 * WebKit, a normal pointer click can report success without opening the
 * visible confirmation modal. HTMLElement.click() matches that legacy path.
 *
 * @param page - Playwright page on the free-response level
 * @param selector - selector for the legacy control
 */
async function clickLegacyControl(page: Page, selector: string): Promise<void> {
  const target = page.locator(selector).first();
  await expect(target).toBeVisible();
  await target.evaluate(element => (element as HTMLElement).click());
}

/**
 * Activates a legacy control and waits for the page navigation that follows.
 *
 * @param page - Playwright page
 * @param selector - selector for the control to click
 */
async function clickAndWaitForNavigation(
  page: Page,
  selector: string,
): Promise<void> {
  await Promise.all([
    page.waitForNavigation({waitUntil: 'load', timeout: 30_000}),
    clickLegacyControl(page, selector),
  ]);
}

test.describe('Free response submittable — lesson 27', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/free_response_submittable.feature
   * Scenario: Loading the level
   */
  test(
    'loading the level shows the question heading',
    {tag: '@no_mobile'},
    async ({page}) => {
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/free_response_submittable.feature
   * Scenario: Submit anything, unsubmit, be able to resubmit.
   */
  test(
    'submit, unsubmit, and resubmit cycle restores editable state',
    {tag: '@no_mobile'},
    async ({page}) => {
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
      await clickLegacyControl(page, '.unsubmitButton');
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/free_response_submittable.feature
   * Scenario: Level without multiple attempts allowed is locked after submit
   */
  test(
    'level without multiple attempts locks after submit',
    {tag: '@no_mobile'},
    async ({page}) => {
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
