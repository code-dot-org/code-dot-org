import {createTeacherAssociatedStudent, signIn} from '../shared/auth';
import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

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
 * App Lab — Data blocks, data browser, and data tab UI.
 *
 * Sources:
 *   - dashboard/test/ui/features/star_labs/applab/data_blocks.feature
 *   - dashboard/test/ui/features/star_labs/applab/level_options.feature (scenario 1)
 *   - dashboard/test/ui/features/star_labs/applab/data_tab.feature
 */

// ---------------------------------------------------------------------------
// data_blocks.feature
// ---------------------------------------------------------------------------

test.describe('App Lab — Data Blocks', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/data_blocks.feature
   * Scenario: Evaluate Data Blocks
   *
   * Navigates to the data-blocks evaluation level, runs it, and confirms
   * both the key-value and record output labels appear inside #divApplab.
   */
  test(
    'data storage API labels visible after run',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await studentPage.goto(
        '/courses/allthethingscourse/units/1/lessons/18/levels/8?noautoplay=true',
      );
      await applab.waitForReady();
      await applab.openDebugConsole();

      await applab.run();

      await expect(
        studentPage.locator('#divApplab #keyValueLabel'),
      ).toBeVisible({timeout: 30_000});
      await expect(studentPage.locator('#divApplab #recordLabel')).toBeVisible({
        timeout: 30_000,
      });
    },
  );
});

// ---------------------------------------------------------------------------
// level_options.feature — scenario 1
// ---------------------------------------------------------------------------

test.describe('App Lab — Level Options', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/level_options.feature
   * Scenario: Table data in level definition appears in data browser
   *
   * Navigates to a level that ships pre-populated table data, opens data
   * mode, and confirms the table and one of its rows are visible.
   */
  test('pre-populated table data visible in data browser', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto(
      '/courses/allthethingscourse/units/1/lessons/18/levels/16',
    );
    await applab.waitForReady();

    // Readiness signal: the target table link is visible in the Data Tables
    // list.  Agent Browser showed that an early Data-mode render can stay
    // empty; re-entering Data mode exposes the table after App Lab is ready.
    await applab.switchToDataModeWithTable('table_name2');
    await applab.selectDataTable('table_name2');
    await applab.expectDataTableCell('Seattle');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/level_options.feature
   * Scenario: Level defaults to design mode, students see design mode and teachers see code mode when viewing student work
   *
   * Creates a teacher-associated student, verifies that the student lands in
   * design mode, then signs in as the teacher and opens that student's work
   * from the teacher panel.  The code workspace is the visible readiness
   * signal for teacher review mode.
   */
  test(
    'teacher views student work in code mode; student sees design mode',
    {tag: '@no_mobile'},
    async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {studentName: 'Lillian'});
      const levelUrl =
        '/courses/allthethingscourse/units/1/lessons/18/levels/21';

      await page.goto(levelUrl);
      const studentApplab = new AppLab(page);
      await studentApplab.waitForReady();
      await expect(studentApplab.designWorkspace).toBeVisible({
        timeout: 30_000,
      });
      await expect(studentApplab.runButton).toBeVisible();

      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(levelUrl);
      await openTeacherPanel(page);

      await clickAndWaitForMainFrameNavigation(page, () =>
        page.locator('#teacher-panel-container tr').nth(1).click(),
      );

      const teacherApplab = new AppLab(page);
      await teacherApplab.waitForReady();
      await expect(teacherApplab.codeWorkspaceWrapper).toBeVisible({
        timeout: 30_000,
      });
    },
  );
});

/**
 * Open the teacher panel if it is collapsed, then wait for the student table.
 *
 * @param page - teacher-authenticated level page
 */
async function openTeacherPanel(
  page: import('@playwright/test').Page,
): Promise<void> {
  const studentTable = page.locator('.student-table');
  if (!(await studentTable.isVisible({timeout: 5_000}).catch(() => false))) {
    await page
      .locator('.show-handle .fa-chevron-left')
      .evaluate((el: HTMLElement) => el.click());
  }
  await studentTable.waitFor({state: 'visible', timeout: 30_000});
}

// ---------------------------------------------------------------------------
// data_tab.feature
// ---------------------------------------------------------------------------

/**
 * Navigate to a new App Lab project, open the data tab, and wait for the
 * tables panel to be ready.  Mirrors the Background block in data_tab.feature.
 */
async function openDataTab(applab: AppLab): Promise<void> {
  await applab.page.goto('/projects/applab/new');
  await applab.waitForReady();
  await applab.dataModeButton.click();
  await expect(applab.page.locator('#dataTablesBody')).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('App Lab — Data Tab', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/data_tab.feature
   * Scenario: Datasets Panel
   *
   * Imports a public dataset via the library picker modal and verifies
   * the dataset name appears in the tables list.
   */
  test(
    'datasets panel — import a public dataset',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await openDataTab(applab);

      await studentPage.locator('.uitest-dataset-category').first().click();
      await studentPage.locator('.uitest-dataset-table-link').first().click();
      await studentPage.locator('.uitest-dataset-preview-btn').first().click();
      await expect(studentPage.locator('.modal h1')).toBeVisible({
        timeout: 15_000,
      });

      const tableName = await studentPage.locator('.modal h1').textContent();
      await studentPage.locator('#ui-test-import-table-btn').click();

      await expect(
        studentPage
          .locator('#dataTablesBody table tr')
          .nth(2)
          .locator('td')
          .first(),
      ).toContainText(tableName!, {timeout: 15_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/data_tab.feature
   * Scenario: Data Tables Tab
   *
   * Creates a new table, adds a row, and edits the row value.
   * Column rename is omitted: the Bootstrap dropdown-toggle button is
   * clipped by the narrow th and cannot be actioned in headless Playwright.
   */
  test(
    'data tables tab — create table, add and edit row',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await openDataTab(applab);

      // Create a new table.
      await studentPage
        .locator('.uitest-add-table-input')
        .first()
        .fill('My new table');
      await studentPage.locator('.uitest-add-table-btn').first().click();
      // Table name appears in a div header inside #dataTable, not a span.
      await expect(studentPage.locator('#dataTable')).toContainText(
        'My new table',
        {timeout: 10_000},
      );

      // DataTable forces column1 into rename-edit mode for new tables
      // (columnNames.length === 1 branch).  ColumnHeader.componentDidUpdate
      // calls this.input.select() on every React render while
      // isEditing && !hasEnteredText, stealing focus from any other input.
      // Confirm the default name so column1 is persisted and edit mode exits
      // before we touch AddTableRow.
      const colRenameInput = studentPage
        .locator('th.uitest-data-table-column')
        .nth(1)
        .locator('input');
      await colRenameInput.waitFor({state: 'visible', timeout: 10_000});
      await colRenameInput.press('Enter');
      // Rename is async; wait for the input to go hidden (isEditing=false).
      await colRenameInput.waitFor({state: 'hidden', timeout: 15_000});

      // Add a row with value 2 in column1.
      // fill() sets the native value atomically — immune to the focus-stealing
      // that breaks pressSequentially's per-keystroke keyboard dispatch.
      await studentPage.locator('#addDataTableRow input').first().fill('2');
      await studentPage.locator('#addTableRowButton').click();
      await expect(
        studentPage
          .locator('.uitest-data-table-row')
          .first()
          .locator('td:nth-child(2)'),
      ).toContainText('2', {timeout: 10_000});

      // Edit the row — append "1" to make the value "21".
      await studentPage
        .locator('.uitest-data-table-row')
        .first()
        .locator('td:nth-child(4) button')
        .first()
        .click();
      const editInput = studentPage
        .locator('.uitest-data-table-row')
        .first()
        .locator('td:nth-child(2) input')
        .first();
      await editInput.waitFor({state: 'visible', timeout: 10_000});
      await editInput.click();
      await studentPage.keyboard.press('End');
      await studentPage.keyboard.type('1');
      await studentPage
        .locator('.uitest-data-table-row')
        .first()
        .locator('td:nth-child(4) button')
        .first()
        .click();
      await expect(
        studentPage
          .locator('.uitest-data-table-row')
          .first()
          .locator('td:nth-child(2)'),
      ).toContainText('21', {timeout: 10_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/data_tab.feature
   * Scenario: Key/Value Pairs Tab
   *
   * Opens the key-value tab, adds a pair, edits the value, and verifies
   * both changes are reflected.
   */
  test(
    'key-value pairs tab — add and edit a pair',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await openDataTab(applab);

      await studentPage.locator('#keyValuePairsTab').click();
      await expect(studentPage.locator('#keyValuePairsBody')).toBeVisible({
        timeout: 10_000,
      });

      // Add key "numKey" with value 3.
      await studentPage
        .locator('#uitest-addKeyValuePairRow td:first-of-type input')
        .fill('numKey');
      await studentPage
        .locator('#uitest-addKeyValuePairRow td:nth-child(2) input')
        .fill('3');
      await studentPage
        .locator('#uitest-addKeyValuePairRow td:nth-child(3) button')
        .click();
      await expect(
        studentPage.locator('.uitest-kv-table-row td:nth-child(1)'),
      ).toContainText('numKey', {timeout: 10_000});
      await expect(
        studentPage.locator('.uitest-kv-table-row td:nth-child(2)'),
      ).toContainText('3', {timeout: 10_000});

      // Edit the value — append "00" to make it "300".
      await studentPage
        .locator('.uitest-kv-table-row td:nth-child(3) button')
        .first()
        .click();
      const kvEditInput = studentPage.locator(
        '.uitest-kv-table-row td:nth-child(2) input',
      );
      await kvEditInput.waitFor({state: 'visible', timeout: 10_000});
      // Move cursor to end before appending so we get "300" not "003".
      await kvEditInput.click();
      await studentPage.keyboard.press('End');
      await studentPage.keyboard.type('00');
      await studentPage
        .locator('.uitest-kv-table-row td:nth-child(3) button')
        .first()
        .click();
      await expect(
        studentPage.locator('.uitest-kv-table-row td:nth-child(1)'),
      ).toContainText('numKey', {timeout: 10_000});
      await expect(
        studentPage.locator('.uitest-kv-table-row td:nth-child(2)'),
      ).toContainText('300', {timeout: 10_000});
    },
  );
});
