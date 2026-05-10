import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab — Template Backed Levels.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/template_backed.feature
 * Migration status: see per-scenario comments.
 *
 * Levels 10 and 11 of lesson 18 in allthethingscourse are both backed by the
 * same template project.  Code written on one level persists when navigating
 * to the other.
 */

const LEVEL_10 =
  '/courses/allthethingscourse/units/1/lessons/18/levels/10?noautoplay=true';
const LEVEL_11 =
  '/courses/allthethingscourse/units/1/lessons/18/levels/11?noautoplay=true';
const STARTING_CODE = 'turnRight(90);\n';
const LEVEL_10_CODE = 'turnRight(90);\nturnLeft(90);\n';
const SHARED_TEMPLATE_CODE = 'turnRight(90);\nturnLeft(90);\nturnRight(10);\n';

test.describe('App Lab — Template Backed Levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: template_backed.feature — "Template backed level"
   *
   * Starts from a fresh test student, appends two code lines across level 10
   * and 11, then returns to level 10 and verifies all three lines (the
   * original plus both appended) are present in the shared template code.
   *
   * Fresh user auth is the partition boundary.  The legacy Cucumber scenario
   * resets because it reuses serial test state; this Playwright port creates a
   * distinct channel for each student/template/script tuple and therefore does
   * not need the destructive Start over flow before editing.
   */
  test(
    'code persists across levels sharing the same template',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);

      // -- Level 10 ------------------------------------------------------

      await gotoAppLabLevel(applab, LEVEL_10);

      await expect(
        studentPage.locator('.projectTemplateWorkspaceIcon').first(),
      ).toBeVisible({timeout: 15_000});

      // Palette should have exactly 2 blocks for this restricted level.
      await expect(
        studentPage.locator('.droplet-palette-canvas > g'),
      ).toHaveCount(2, {timeout: 10_000});

      // Starting code from the template.
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe(STARTING_CODE);

      // Append a line in text mode.
      await saveExpectedCodeWithUiRetry(applab, LEVEL_10_CODE, async () => {
        await applab.appendCode('turnLeft(90);\n');
      });

      // -- Level 11 (same template) --------------------------------------

      await gotoAppLabLevel(applab, LEVEL_11);

      await expect(
        studentPage.locator('.projectTemplateWorkspaceIcon').first(),
      ).toBeVisible({timeout: 15_000});
      await expect(
        studentPage.locator('.droplet-palette-canvas > g'),
      ).toHaveCount(2, {timeout: 10_000});

      // Code saved on level 10 is visible here.
      await expect
        .poll(() => applab.getCode(), {timeout: 10_000})
        .toBe(LEVEL_10_CODE);

      await saveExpectedCodeWithUiRetry(
        applab,
        SHARED_TEMPLATE_CODE,
        async () => {
          await applab.appendCode('turnRight(10);\n');
        },
      );

      // -- Back to level 10 ----------------------------------------------

      await expect(async () => {
        await gotoAppLabLevel(applab, LEVEL_10);

        await expect(
          studentPage.locator('.projectTemplateWorkspaceIcon').first(),
        ).toBeVisible({timeout: 15_000});

        // Working copy now contains all three lines.
        await expect
          .poll(() => applab.getCode(), {timeout: 10_000})
          .toBe(SHARED_TEMPLATE_CODE);
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: 60_000,
      });
    },
  );
});

/**
 * Navigate to an App Lab level and wait for the editor to become interactive.
 * Chromium can report net::ERR_ABORTED when a previous App Lab save finishes
 * close to the next navigation; retrying the user-visible ready state keeps the
 * test parallel-safe without serializing workers.
 *
 * @param applab - App Lab page object for the current page
 * @param url - level URL to load
 */
async function gotoAppLabLevel(applab: AppLab, url: string): Promise<void> {
  await expect(async () => {
    await applab.page.goto(url, {waitUntil: 'domcontentloaded'});
    await applab.waitForReady();
  }).toPass({
    intervals: [500, 1_000, 2_000],
    timeout: 60_000,
  });
}

/**
 * Prepare the expected editor text, run the App Lab level, and wait for the
 * visible save status.  A conflict save can briefly leave the right code in the
 * editor with the "Error saving project" banner; retrying from the visible
 * editor state matches the user's recovery path and the Cucumber readiness
 * signal, while the later cross-level reload still proves persistence.
 *
 * @param applab - App Lab page object for the loaded level
 * @param expectedCode - Full editor text expected before saving
 * @param prepareCode - Idempotent edit step that creates the expected code
 */
async function saveExpectedCodeWithUiRetry(
  applab: AppLab,
  expectedCode: string,
  prepareCode: () => Promise<void>,
): Promise<void> {
  await expect(async () => {
    await applab.waitForReady();
    await applab.ensureTextMode();
    const shouldSave = (await applab.getCode()) !== expectedCode;
    if (shouldSave) {
      await prepareCode();
    }
    await expect
      .poll(() => applab.getCode(), {timeout: 10_000})
      .toBe(expectedCode);
    await runAndWaitForSave(applab, {expectSave: shouldSave});
  }).toPass({
    intervals: [1_000, 2_000, 5_000],
    timeout: 2 * 60_000,
  });
}

/**
 * Run App Lab and wait for the visible save indicator.  This uses the same UI
 * readiness signal Cucumber observes instead of waiting on the transport
 * request.
 *
 * @param applab - App Lab page object for the loaded level
 */
async function runAndWaitForSave(
  applab: AppLab,
  {expectSave}: {expectSave: boolean},
): Promise<void> {
  await applab.waitForUiSaveAfter(() => applab.run(), {expectSave});
}
