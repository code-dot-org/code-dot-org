import path from 'path';

import {createTeacherAssociatedStudent, signIn} from '../shared/auth';
import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab smoke tests — data storage, design mode, data browser, code entry,
 * design element drag, HTML sanitization, and change events.
 *
 * Sources:
 *   dashboard/test/ui/features/star_labs/applab/data_blocks.feature
 *   dashboard/test/ui/features/star_labs/applab/clipping.feature
 *   dashboard/test/ui/features/star_labs/applab/level_options.feature (scenario 1)
 *   dashboard/test/ui/features/star_labs/applab/scenarios.feature (scenarios 2-3)
 *   dashboard/test/ui/features/star_labs/applab/scenarios3.feature
 *   dashboard/test/ui/features/star_labs/applab/html_sanitization.feature
 *   dashboard/test/ui/features/star_labs/applab/scenarios2.feature (scenarios 1-2)
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

const FIXTURES = path.resolve(__dirname, '../shared/fixtures');

test.describe('App Lab — new project shell', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios.feature
   * Scenario: Project Template Workspace Icon should not appear since this is not a project template backed level.
   */
  test('new project does not show the project-template workspace icon', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab');
    await applab.waitForReady();
    await expect(
      studentPage.locator('.projectTemplateWorkspaceIcon'),
    ).toBeHidden();
  });
});

/**
 * Click an element that performs a full-page navigation and wait only for the
 * main-frame navigation to reach DOMContentLoaded.  The caller must assert the
 * next user-visible page state.  Some dashboard actions reload the same URL,
 * so URL-change waits are not sufficient here.
 *
 * @param page - Playwright page to observe
 * @param click - action that triggers the navigation
 */
async function clickAndWaitForMainFrameNavigation(
  page: import('@playwright/test').Page,
  click: () => Promise<unknown>,
): Promise<void> {
  await Promise.all([
    page.waitForEvent('framenavigated', {
      predicate: frame => frame === page.mainFrame(),
      timeout: 30_000,
    }),
    click(),
  ]);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Submit the current App Lab assessment level and wait for the post-submit
 * navigation to settle.  Mirrors `I submit this level` from steps.rb.
 *
 * @param page - page with an App Lab assessment level loaded
 * @param applab - App Lab page object for the loaded page
 */
async function submitAppLabLevel(
  page: import('@playwright/test').Page,
  applab: AppLab,
): Promise<void> {
  await applab.run();
  await page.locator('#submitButton').waitFor({
    state: 'visible',
    timeout: 30_000,
  });
  await page.locator('#submitButton').click();
  await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});

  await clickAndWaitForMainFrameNavigation(page, () =>
    page.locator('#confirm-button').click(),
  );
}

/**
 * Open the App Lab Manage Assets dialog via the settings cog.
 * Mirrors settings_cog_steps.rb: click the visible cog, then the
 * "Manage Assets" menu item.
 *
 * @param applab - App Lab page object for the loaded project
 */
async function openManageAssetsDialog(applab: AppLab): Promise<void> {
  await applab.switchToDesignMode();
  await applab.page
    .locator('.settings-cog:visible')
    .waitFor({state: 'visible', timeout: 15_000});
  await applab.page.locator('.settings-cog:visible').click();
  await applab.page
    .locator(
      '.ui-test-settings-cog-menu:visible .ui-test-settings-cog-menu-item',
      {
        hasText: 'Manage Assets',
      },
    )
    .click();
  await expect(applab.page.locator('.modal')).toContainText('Manage Assets', {
    timeout: 15_000,
  });
}

test.describe('App Lab — data storage blocks', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/data_blocks.feature
   * Scenario: Evaluate Data Blocks
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/clipping.feature
   * Scenario: Load an app to edit and see the blocks unclipped in design mode
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/level_options.feature
   * Scenario: Table data in level definition appears in data browser
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/sharing_from_script_level.feature
   * Scenario: Sharing from an App Lab script level
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
   * Migration status: COMPLETED
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab_submittable.feature
   * Scenario: Submit anything, unsubmit, be able to resubmit.
   * @no_mobile @as_taught_student
   *
   * Level 18/7 submit → unsubmit → resubmit cycle.  Requires a teacher-section
   * enrolment so the submit/unsubmit buttons render.
   *
   * The confirm buttons trigger full-page navigation.  The readiness signal is
   * the subsequent level page exposing #unsubmitButton or #submitButton,
   * matching the legacy scenario's user-visible checks.
   */
  test(
    'submit, unsubmit, and resubmit cycle restores submit button',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);
      const applab = new AppLab(page);

      const levelUrl =
        '/courses/allthethingscourse/units/1/lessons/18/levels/7?noautoplay=true';

      await page.goto(levelUrl);
      await applab.waitForReady();

      await submitAppLabLevel(page, applab);

      // Reload to see the unsubmit button.
      await page.goto(levelUrl);
      await page
        .locator('#unsubmitButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Unsubmit and confirm.
      await page.locator('#unsubmitButton').click();
      await page.locator('.modal').waitFor({state: 'visible'});
      await clickAndWaitForMainFrameNavigation(page, () =>
        page.locator('#confirm-button').click(),
      );

      // Reload: running the level again should expose the submit button.
      await page.goto(levelUrl);
      await applab.waitForReady();
      await applab.run();
      await expect(page.locator('#submitButton')).toBeVisible({
        timeout: 30_000,
      });
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab_submittable.feature
   * Scenario: Submit anything, teacher is able to unsubmit
   * @no_mobile @as_taught_student
   *
   * The visible readiness signals are the teacher panel selecting the student
   * row after navigation and the teacher-side unsubmit button disabling after
   * the reset reload.
   */
  test(
    'teacher can unsubmit student work',
    {tag: '@no_mobile'},
    async ({page}) => {
      const studentName = `AppLabStudent${Date.now()}${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const {teacherEmail, teacherPassword, sectionId} =
        await createTeacherAssociatedStudent(page, {studentName});
      const applab = new AppLab(page);
      const levelUrl =
        '/courses/allthethingscourse/units/1/lessons/18/levels/7?noautoplay=true';

      await page.goto(levelUrl, {waitUntil: 'domcontentloaded'});
      await applab.waitForReady();
      await submitAppLabLevel(page, applab);

      await page.goto(levelUrl, {waitUntil: 'domcontentloaded'});
      await page
        .locator('#unsubmitButton')
        .waitFor({state: 'visible', timeout: 30_000});

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(`${levelUrl}&section_id=${sectionId}`, {
        waitUntil: 'domcontentloaded',
      });
      await applab.loadStudentWorkFromTeacherPanel(studentName, sectionId);
      await applab.unsubmitSelectedStudentWork();
    },
  );
});

test.describe('App Lab — button text read/write', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios.feature
   * Scenario: Can read and set button text
   * @as_student @no_mobile
   *
   * Creates two buttons in code mode and uses setText/getText to copy one
   * label to the other; verifies both DOM buttons show "Jelly".
   */
  test(
    'setText and getText transfer button labels correctly',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.ensureTextMode();
      await applab.appendCode("button('testButton1', 'Peanut Butter');\n");
      await applab.appendCode("button('testButton2', 'Jelly');\n");
      await applab.appendCode(
        "setText('testButton1', getText('testButton2'));\n",
      );
      await applab.run();

      await studentPage
        .locator('#divApplab > .screen > button#testButton2')
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(studentPage.locator('#testButton1')).toHaveText('Jelly');
      await expect(studentPage.locator('#testButton2')).toHaveText('Jelly');
    },
  );
});

test.describe('App Lab — textarea newline preservation', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios.feature
   * Scenario: Text is preserved when reading and setting newlines in textarea
   * @as_student @no_mobile
   *
   * Drags a TEXT_AREA into design mode, runs getText/setText 100 times with
   * newline-containing text, and verifies the resulting innerHTML structure.
   */
  test(
    'getText/setText preserves newlines in textarea HTML',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.switchToDesignMode();
      await applab.dragElementToApp('TEXT_AREA');
      await applab.switchToCodeMode();

      await applab.ensureTextMode();
      await applab.appendCode(
        "setText('text_area1', 'Line 1\\nLine 2\\n\\nLine3');\n",
      );
      await applab.appendCode(
        "for (var i = 0; i < 100; i++) { setText('text_area1', getText('text_area1')); }",
      );
      await applab.run();

      await studentPage
        .locator('#divApplab > .screen > div#text_area1')
        .waitFor({state: 'visible', timeout: 15_000});
      const html = await studentPage.locator('div#text_area1').innerHTML();
      expect(html).toBe(
        'Line 1<div>Line 2</div><div><br></div><div>Line3</div>',
      );
    },
  );
});

test.describe('App Lab — HTTP image proxy', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios3.feature
   * Scenario: App Lab Http Image
   * @as_student @no_mobile
   *
   * An image created with an HTTP src must be proxied through the
   * studio.code.org/media endpoint to avoid mixed-content warnings.
   */
  test(
    'HTTP image src is rewritten through /media proxy endpoint',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.ensureTextMode();
      await applab.appendCode("image('test123', 'http://example.com')");
      await applab.run();

      const img = studentPage.locator('#divApplab > .screen > img#test123');
      await img.waitFor({state: 'visible', timeout: 15_000});
      // The proxy URL uses the current host (e.g. test-studio.code.org in the
      // test environment vs studio.code.org in production).  Check the path
      // rather than the full origin so the assertion is environment-agnostic.
      expect(await img.getAttribute('src')).toContain(
        '/media?u=http%3A%2F%2Fexample.com',
      );
    },
  );
});

test.describe('App Lab — clear puzzle restores initial HTML', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios3.feature
   * Scenario: App Lab Clear Puzzle and Design Mode
   * @as_student @no_mobile
   *
   * A BUTTON dragged into design mode must disappear after resetting the
   * project to its starting version via the Version History dialog.
   *
   * Uses the reset button and attached #divApplab as the post-run readiness
   * signal, then resets via Version History Start over.
   */
  test(
    'dragged button is absent after reset to starting version',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.switchToDesignMode();
      await applab.dragElementToApp('BUTTON');
      await applab.switchToCodeMode();

      expect(await applab.getLevelHtml()).toMatch(/button/);

      await applab.resetToStartingVersion();
      await studentPage.locator('#divApplab').waitFor({state: 'visible'});

      expect(await applab.getLevelHtml()).not.toMatch(/button/);
    },
  );
});

test.describe('App Lab — HTML sanitization', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/html_sanitization.feature
   * Scenario: Elements do not become nested
   * @as_student @no_mobile
   *
   * Drags SCREEN ×2, LABEL, TEXT_AREA, BUTTON into design mode and verifies
   * the resulting DOM hierarchy: screens are direct children of #divApplab,
   * inner elements are children of the correct screen.  Regression guard
   * against empty elements collapsing into each other.
   *
   * Cucumber's `I wait to see "#screen2"` only waits for the element to exist.
   * The current product keeps non-active screens hidden, so this port waits for
   * the visible Reset button and attached screen nodes before checking parents.
   */
  test(
    'design elements maintain correct parent-child DOM hierarchy',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.switchToDesignMode();
      await applab.dragElementToApp('SCREEN');
      await applab.dragElementToApp('SCREEN');
      await applab.dragElementToApp('LABEL');
      // Clear label text so empty-element nesting is exercised (Cucumber comment:
      // "labels are only in danger of collapsing when they are empty").
      await studentPage.evaluate(() => {
        const label = document.querySelector('#design_label1');
        if (!label) return;
        // Applab.updateProperty is the product path used by the property
        // editor; mutating the label DOM alone does not update serialized HTML.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Applab.updateProperty(label, 'text', '');
      });
      await applab.dragElementToApp('TEXT_AREA');
      await applab.dragElementToApp('BUTTON');

      await applab.run();
      await expect(applab.resetButton).toBeVisible({timeout: 15_000});
      await studentPage.locator('#screen2').waitFor({state: 'attached'});
      await studentPage.locator('#screen3').waitFor({state: 'attached'});

      // Empty elements must not have collapsed.
      await expect(studentPage.locator('#label1')).toHaveText('');
      await expect(studentPage.locator('#text_area1')).toHaveText('');

      // Screens are direct children of #divApplab.
      for (const id of ['screen2', 'screen3']) {
        const isDirectChild = await studentPage.evaluate((elId: string) => {
          const parent = document.querySelector('#divApplab');
          const child = document.querySelector(`#${elId}`);
          return child?.parentElement === parent;
        }, id);
        expect(isDirectChild, `#${id} must be direct child of #divApplab`).toBe(
          true,
        );
      }

      // Inner elements are direct children of screen3.
      for (const id of ['text_area1', 'button1']) {
        const isDirectChild = await studentPage.evaluate((elId: string) => {
          const parent = document.querySelector('#screen3');
          const child = document.querySelector(`#${elId}`);
          return child?.parentElement === parent;
        }, id);
        expect(isDirectChild, `#${id} must be direct child of #screen3`).toBe(
          true,
        );
      }
    },
  );
});

test.describe('App Lab — change event on text input', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios2.feature
   * Scenario: Change event works in text input
   * @as_student @no_mobile
   *
   * Drags a TEXT_INPUT into design mode, registers an onEvent 'change' handler
   * that logs the value, then verifies:
   *   1. Blur fires a change event → debug shows "text_input1: 123"
   *   2. Enter fires a change event → debug shows "text_input1: 123456"
   *   3. A subsequent blur does NOT fire a second change event.
   *
   * App Lab's debug console wraps each console.log string value in double quotes.
   */
  test(
    'blur and enter trigger change event; second blur does not',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.switchToDesignMode();
      await applab.dragElementToApp('TEXT_INPUT');
      await applab.switchToCodeMode();
      await applab.ensureTextMode();

      await applab.appendCode(
        "onEvent('text_input1', 'change', function(event) {\n",
      );
      await applab.appendCode(
        "  console.log(event.targetId + ': ' + getText('text_input1'));\n",
      );
      await applab.appendCode('});');
      await expect(
        studentPage.locator('.ace_line').filter({
          hasText: "onEvent('text_input1', 'change'",
        }),
      ).toBeVisible();
      await expect(
        studentPage.locator('.ace_line').filter({hasText: 'console.log'}),
      ).toBeVisible();
      await applab.run();
      await expect(applab.resetButton).toBeVisible({timeout: 15_000});

      const input = studentPage.locator('#text_input1');
      await expect(input).toBeEditable({timeout: 15_000});

      // Blur after typing fires change; Tab is the user-visible blur action.
      await input.fill('123');
      await expect(input).toHaveValue('123');
      await input.evaluate((el: HTMLInputElement) => el.blur());
      await expect(applab.consoleOutput).toContainText('"text_input1: 123"', {
        timeout: 10_000,
      });

      // Enter after changing the visible value fires change.
      await input.fill('123456');
      await expect(input).toHaveValue('123456');
      await input.press('Enter');
      await expect(applab.consoleOutput).toContainText(
        '"text_input1: 123456"',
        {timeout: 10_000},
      );

      // Second blur produces no new change event; "123456" appears only once.
      await input.evaluate((el: HTMLInputElement) => el.blur());
      await expect
        .poll(async () => {
          const debugText = (await applab.consoleOutput.textContent()) ?? '';
          return (debugText.match(/"text_input1: 123456"/g) ?? []).length;
        })
        .toBe(1);
    },
  );
});

test.describe('App Lab — change event on text area', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios2.feature
   * Scenario: Change event works in text area
   * @as_student @no_mobile
   *
   * Drags a TEXT_AREA into design mode, registers an onEvent 'change' handler,
   * then sets the element's textContent directly (mirroring the Cucumber
   * `I set selector text to` step which uses jQuery .text()) and blurs.
   * The blur must fire the change event with the new text value.
   */
  test(
    'blur fires change event after setting text area content',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await applab.switchToDesignMode();
      await applab.dragElementToApp('TEXT_AREA');
      await applab.switchToCodeMode();
      await applab.ensureTextMode();

      await applab.appendCode(
        "onEvent('text_area1', 'change', function(event) {\n",
      );
      await applab.appendCode(
        "  console.log(event.targetId + ': ' + getText('text_area1'));\n",
      );
      await applab.appendCode('});');
      await applab.run();

      const textarea = studentPage.locator('#text_area1');
      await textarea.waitFor({state: 'visible', timeout: 15_000});

      // Focus first so App Lab records the initial value, then set textContent
      // directly (mirrors Cucumber's jQuery .text("abc") step), then blur.
      await textarea.focus();
      await studentPage.evaluate(() => {
        const el = document.querySelector('#text_area1') as HTMLElement | null;
        if (el) el.textContent = 'abc';
      });
      await textarea.evaluate((el: HTMLElement) => el.blur());

      await expect(applab.consoleOutput).toContainText('"text_area1: abc"', {
        timeout: 10_000,
      });
    },
  );
});

test.describe('App Lab — asset management', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/scenarios2.feature
   * Scenario: Upload Image Asset
   * @as_student @no_mobile
   *
   * Uploads artist_image_1.png through the hidden uploader and deletes it.
   * The file fixture lives at dashboard/test/fixtures, matching the Cucumber
   * upload step's fixture directory.
   */
  test(
    'upload and delete image asset via Manage Assets dialog',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab/new');
      const applab = new AppLab(studentPage);
      await applab.waitForReady();

      await openManageAssetsDialog(applab);
      await expect(studentPage.locator('#upload-asset')).toBeVisible({
        timeout: 10_000,
      });

      await studentPage
        .locator('.uitest-hidden-uploader')
        .setInputFiles(path.join(FIXTURES, 'artist_image_1.png'));

      await expect(
        studentPage
          .locator('.assetRow td')
          .filter({hasText: 'artist_image_1.png'}),
      ).toBeVisible({timeout: 20_000});

      await studentPage.locator('.btn-danger').first().click();
      await studentPage.locator('.btn-danger').first().click();
      await expect(studentPage.locator('#manage-asset-status')).toContainText(
        'successfully deleted!',
        {timeout: 20_000},
      );
    },
  );
});

/**
 * Helper: create a new App Lab project, write a button, run it, reset.
 * Returns after the project is in a clean non-running state.
 *
 * @param studentPage - authenticated student Playwright page
 * @returns AppLab POM instance
 */
async function createApplabWithButton(
  studentPage: import('@playwright/test').Page,
): Promise<AppLab> {
  await studentPage.goto('/projects/applab/new');
  const applab = new AppLab(studentPage);
  await applab.waitForReady();

  await applab.ensureTextMode();
  await applab.appendCode("button('hello', 'world');");
  await applab.run();

  await studentPage
    .locator('#divApplab > .screen > button#hello')
    .waitFor({state: 'visible', timeout: 15_000});
  await expect(
    studentPage.locator('#divApplab > .screen > button#hello'),
  ).toContainText('world');

  await applab.resetButton.click();
  return applab;
}

test.describe('App Lab — embed player', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/embed.feature
   * Scenario: App Lab Embed
   * @as_student @no_mobile
   *
   * Creates a project, navigates to its embed URL, verifies the player runs
   * the app, then follows "How it Works (View Code)" from the footer more-menu
   * into a new tab and confirms the full editor loads there.
   *
   * Uses the embedded player's visible play button and footer more-menu as
   * readiness signals before opening the View Code tab.
   */
  test(
    'embed player runs app and How it Works link opens editor in new tab',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = await createApplabWithButton(studentPage);
      const embedPath = await applab.getEmbedUrl();
      await studentPage.goto(embedPath);

      // Embedded player shows a play button; click to run the app.
      await studentPage
        .locator('.fa-play')
        .waitFor({state: 'visible', timeout: 30_000});
      await studentPage.locator('.fa-play').click();
      await studentPage
        .locator('#divApplab > .screen > button#hello')
        .waitFor({state: 'visible', timeout: 15_000});

      // Open the footer more-menu.
      await studentPage
        .locator('button.more-link')
        .waitFor({state: 'visible', timeout: 10_000});
      await studentPage.locator('button.more-link').click();

      // "How it Works (View Code)" link opens editor in a new tab.
      const howItWorksLink = studentPage.locator('a', {
        hasText: 'How it Works (View Code)',
      });
      await howItWorksLink.waitFor({state: 'visible', timeout: 10_000});

      const newTabPromise = studentPage.context().waitForEvent('page');
      await howItWorksLink.click();
      const newTab = await newTabPromise;

      await newTab
        .locator('#codeWorkspaceWrapper')
        .waitFor({state: 'visible', timeout: 30_000});
      await newTab.close();
    },
  );
});

test.describe('App Lab — embed player without source', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/embed.feature
   * Scenario: App Lab Embed without Source
   * @as_student @no_mobile
   *
   * Creates a project and navigates to its source-hidden embed URL.
   * The app must run inside the embedded player, and the footer more-menu
   * must be present but must NOT contain a "How it Works (View Code)" link
   * (source is intentionally hidden from viewers).
   */
  test(
    'embed player without source hides How it Works link',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = await createApplabWithButton(studentPage);
      const embedPath = await applab.getEmbedUrl(true);
      await studentPage.goto(embedPath);

      await studentPage
        .locator('.fa-play')
        .waitFor({state: 'visible', timeout: 30_000});
      await studentPage.locator('.fa-play').click();
      await studentPage
        .locator('#divApplab > .screen > button#hello')
        .waitFor({state: 'visible', timeout: 15_000});

      await studentPage
        .locator('button.more-link')
        .waitFor({state: 'visible', timeout: 10_000});
      await studentPage.locator('button.more-link').click();

      // Source is hidden — "How it Works (View Code)" must not appear.
      await expect(
        studentPage.locator('a', {hasText: 'How it Works (View Code)'}),
      ).not.toBeVisible();
    },
  );
});
