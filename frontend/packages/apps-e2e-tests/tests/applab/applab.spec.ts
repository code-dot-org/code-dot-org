import {createTeacherAssociatedStudent} from '../shared/auth';
import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab smoke tests — data storage, design mode, and data browser.
 *
 * Sources:
 *   dashboard/test/ui/features/star_labs/applab/data_blocks.feature
 *   dashboard/test/ui/features/star_labs/applab/clipping.feature
 *   dashboard/test/ui/features/star_labs/applab/level_options.feature (scenario 1)
 *
 * All scenarios run as an authenticated student (@as_student).
 * Complex Droplet-manipulation scenarios (code entry, drag-and-drop) and
 * @eyes scenarios are not ported here.
 */

/**
 * Relative URL for App Lab lesson-18 levels in allthethingscourse.
 *
 * @param level - level number within lesson 18
 */
function applabLevelUrl(level: number): string {
  return `/courses/allthethingscourse/units/1/lessons/18/levels/${level}?noautoplay=true`;
}

test.describe('App Lab — data storage blocks', () => {
  /**
   * Source: data_blocks.feature — "Evaluate Data Blocks"
   * @no_mobile
   *
   * Level 18/8 runs create/read/update/deleteRecord and set/getKeyValue blocks
   * and prints visible elements on success.
   */
  test(
    'data storage blocks produce visible output labels after run',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await studentPage.goto(applabLevelUrl(8));
      await applab.waitForReady();
      await applab.openDebugConsole();
      await applab.run();
      await applab.waitForKeyValueLabel();
      await expect(applab.recordLabel).toBeVisible();
    },
  );
});

test.describe('App Lab — design mode clipping', () => {
  /**
   * Source: clipping.feature — "Load an app to edit and see the blocks unclipped in design mode"
   *
   * After navigating to the App Lab project page and switching to design mode
   * the design canvas must carry the clip-content CSS class.
   */
  test('design mode canvas has clip-content class', async ({studentPage}) => {
    // Navigate to the App Lab project page for this fresh student account.
    await studentPage.goto('/projects/applab');
    const applab = new AppLab(studentPage);
    await applab.waitForReady();

    // Reload mirrors the Cucumber "I reload the page" step — ensures the
    // project is loaded from the server, not only client-initialised.
    await studentPage.reload();
    await applab.waitForReady();

    await applab.switchToDesignMode();
    await expect(studentPage.locator('#designModeViz')).toHaveClass(
      /clip-content/,
    );
  });
});

test.describe('App Lab — data browser', () => {
  /**
   * Source: level_options.feature — "Table data in level definition appears in data browser"
   * @as_student
   *
   * Level 18/16 has pre-seeded table data (table_name2 with a "Seattle" row).
   * Clicking the Data Mode button then navigating to the table should expose it.
   */
  test('pre-seeded level table data is visible in the data browser', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);

    // Set up the listener before navigation — populate_tables fires async
    // during page init and must complete before data mode is entered, or the
    // tables never appear (the data browser renders at entry time).
    const populatePromise = studentPage.waitForResponse(
      r => r.url().includes('populate_tables'),
      {timeout: 15_000},
    );

    await studentPage.goto(applabLevelUrl(16));
    await applab.waitForReady();

    // Block until the server has written the pre-seeded table data.
    await populatePromise;

    await applab.switchToDataMode();
    await applab.waitForDataLibrary();
    await applab.selectDataTable('table_name2');
    await applab.expectDataTableCell('Seattle');
  });
});

test.describe('App Lab — sharing from script level', () => {
  /**
   * Source: sharing_from_script_level.feature — "Sharing from an App Lab script level"
   * @no_mobile
   *
   * Share links generated from a course level must point to /projects/applab/<id>
   * and not back to the course level URL — regression test for forum issue 11495.
   */
  test(
    'share link from course level points to /projects/applab/',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await studentPage.goto(applabLevelUrl(1));
      await applab.waitForReady();

      await studentPage.locator('.project_share').first().click();
      const copyButton = studentPage.locator('#sharing-dialog-copy-button');
      await expect(copyButton).toBeVisible({timeout: 15_000});
      const shareUrl = await copyButton.getAttribute('value');
      expect(shareUrl).toContain('/projects/applab/');
    },
  );
});

test.describe('App Lab — project template workspace icon', () => {
  /**
   * Source: scenarios.feature — (first unnamed scenario)
   *
   * A free /projects/applab page was not created from a project template,
   * so the template workspace icon must not appear in the toolbar.
   */
  test('free project page has no template workspace icon', async ({
    studentPage,
  }) => {
    await studentPage.goto('/projects/applab/new');
    const applab = new AppLab(studentPage);
    await applab.waitForReady();
    await expect(
      studentPage.locator('.projectTemplateWorkspaceIcon'),
    ).not.toBeVisible();
  });
});

test.describe('App Lab — submittable level', () => {
  /**
   * Source: applab_submittable.feature — "Submit anything, unsubmit, be able to resubmit."
   * @no_mobile @as_taught_student
   *
   * Level 18/7 submit → unsubmit → resubmit cycle.  Requires a teacher-section
   * enrolment so the submit/unsubmit buttons render.
   *
   * FIXME: #confirm-button triggers a multi-step server redirect that leaves
   * the browser mid-navigation; every subsequent page.goto() gets
   * net::ERR_ABORTED regardless of which load/navigation signal we await
   * first.  Three approaches (waitForLoadState, modal-hidden, both) all
   * reproduce the same failure.  Needs investigation into what URL the
   * confirm redirect chain lands on and whether that page itself triggers a
   * further JS navigation before goto() can safely fire.
   */
  test.fixme(
    'submit, unsubmit, and resubmit cycle restores submit button',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);
      const applab = new AppLab(page);

      const levelUrl =
        '/courses/allthethingscourse/units/1/lessons/18/levels/7?noautoplay=true';

      await page.goto(levelUrl);
      await applab.waitForReady();

      // Submit: run the level, wait for submit button, confirm modal.
      await applab.run();
      await page
        .locator('#submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await page.locator('#submitButton').click();
      await page.locator('.modal').waitFor({state: 'visible'});
      await page.locator('#confirm-button').click();
      await page.locator('.modal').waitFor({state: 'hidden', timeout: 30_000});

      // Reload to see the unsubmit button.
      await page.goto(levelUrl);
      await page
        .locator('#unsubmitButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Unsubmit and confirm.
      await page.locator('#unsubmitButton').click();
      await page.locator('.modal').waitFor({state: 'visible'});
      await page.locator('#confirm-button').click();
      await page.locator('.modal').waitFor({state: 'hidden', timeout: 30_000});

      // Reload: running the level again should expose the submit button.
      await page.goto(levelUrl);
      await applab.waitForReady();
      await applab.run();
      await expect(page.locator('#submitButton')).toBeVisible({
        timeout: 30_000,
      });
    },
  );
});
