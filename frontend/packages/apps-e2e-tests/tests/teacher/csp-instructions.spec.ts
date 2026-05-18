import {expect, test} from '@playwright/test';
import {type Page} from '@playwright/test';

import {createStudent} from '../shared/auth';
import {labLevelUrl} from '../shared/urls';

/**
 * CSP instructions panel — Help & Tips tab, collapser, and resizer.
 *
 * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
 * @no_mobile @single_session
 *
 * All scenarios navigate to App Lab levels (lesson 18, allthethingscourse) as
 * a signed-in student.  The instructions panel is lab-agnostic React; these
 * tests exercise tab visibility, content, collapse/expand, and the resizer.
 */

/**
 * Navigate to an App Lab course level and wait until the page is interactive.
 * Mirrors "I wait for the lab page to fully load" from Cucumber (jQuery-ready).
 * Course-level App Lab pages always render #runButton; design/data mode buttons
 * are optional and depend on the level configuration.
 *
 * @param page - Playwright page
 * @param level - level number within lesson 18 (allthethingscourse)
 */
async function gotoApplabLevel(page: Page, level: number): Promise<void> {
  await page.goto(labLevelUrl(18, level));
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 60_000});
}

test.describe('CSP instructions panel', () => {
  test.beforeEach(async ({page}) => {
    // Background: I create a student named "Lillian"
    await createStudent(page);
  });

  test(
    'Help & Tips and Instructions tabs visible when level has videos',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 1);
      await page.locator('.uitest-helpTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Turtle Programming',
      );
      await page.locator('.uitest-instructionsTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Given only 4 turtle commands,',
      );
    },
  );

  test(
    'Help & Tips and Instructions tabs visible when level has a map reference',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 18);
      await page.locator('.uitest-helpTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Circuit Playground',
      );
      await page.locator('.uitest-instructionsTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Given only 4 turtle commands,',
      );
    },
  );

  test(
    'Help & Tips and Instructions tabs visible when level has reference links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 19);
      await page.locator('.uitest-helpTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'The Circuit Playground is a simple single board computer with many built in Inputs and Outputs for us to explore.',
      );
      await page.locator('.uitest-instructionsTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Given only 4 turtle commands,',
      );
    },
  );

  test(
    'resources tab absent when level has no videos, map references, or reference links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 3);
      await expect(page.locator('.uitest-helpTab')).not.toBeVisible();
    },
  );

  test(
    'resources tab displays videos, map references, and reference links',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 20);
      await page.locator('.uitest-helpTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'App Lab - Make It Interactive',
      );
      await expect(page.locator('.editor-column').first()).toContainText(
        'Welcome to the Circuit Playground',
      );
      await page.locator('.uitest-instructionsTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Given only 4 turtle commands,',
      );
    },
  );

  test(
    'instructions can be collapsed and expanded',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 20);
      await page.locator('#ui-test-collapser').click();
      await expect(page.locator('.instructions-markdown')).toBeHidden();
      await page.locator('#ui-test-collapser').click();
      await expect(page.locator('.instructions-markdown')).toBeVisible();
    },
  );

  test(
    'instructions have a resizer on non-embedded levels',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 20);
      await expect(page.locator('#ui-test-resizer')).toBeVisible();
    },
  );

  test(
    'instructions do not show a resizer on embedded levels',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 12);
      await expect(page.locator('#ui-test-resizer')).not.toBeVisible();
    },
  );

  test(
    'resources tab clickable and shows correct text for contained levels',
    {tag: '@no_mobile'},
    async ({page}) => {
      await gotoApplabLevel(page, 15);
      await page.locator('.uitest-helpTab').click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Welcome to the Circuit Playground',
      );
      await page.locator('.uitest-instructionsTab').click();
      await expect(page.locator('.editor-column').first()).not.toContainText(
        'Welcome to the Circuit Playground',
      );
    },
  );
});
