import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';

import {PythonLab} from './PythonLab';

/** Skip webkit for all Python Lab tests (@no_safari — web workers not supported). */
const skipSafari = ({browserName}: {browserName: string}) =>
  test.skip(browserName === 'webkit', '@no_safari');

/**
 * Opens a Python Lab level and returns a POM once the runtime is ready.
 *
 * If Pyodide fatally fails during startup, the app leaves the visible Run
 * button disabled and exposes no in-page retry control. Reloading the level
 * creates a new worker while keeping the fixture-bound page alive for Eyes.
 *
 * @param page - authenticated page from the test fixture
 * @param level - 1-based level number
 */
async function openReadyPythonLab(
  page: Page,
  level: number,
): Promise<PythonLab> {
  let lab: PythonLab | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    lab = new PythonLab(page);
    await lab.reloadLevel(level);
    if (await lab.isRunReady()) {
      return lab;
    }
  }

  if (!lab) {
    throw new Error('Python Lab was not opened');
  }

  await lab.waitForRunReady();
  return lab;
}

/**
 * Python Lab — lesson 50, level 1 (run output).
 *
 * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run_eyes.feature
 * @no_mobile @no_safari — webkit skipped. @eyes steps annotated as visual checkpoints.
 */
test.describe('Python Lab — level 1 — run output', () => {
  let lab: PythonLab;

  test.beforeEach(async ({page, browserName}) => {
    skipSafari({browserName});
    await page.goto('/reset_session');
    lab = await openReadyPythonLab(page, 1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run_eyes.feature
   * Scenario: Can run and see output of Python program
   */
  test(
    'running prints Hello from the start! to the console',
    {tag: '@visual'},
    async ({eyes}) => {
      await eyes.open('run and see output of a Python program');
      await eyes.check('initial load');
      await lab.run();
      await expect(lab.console).toContainText('Hello from the start!');
      await eyes.check('completed run');
    },
  );
});

/**
 * Python Lab — lesson 50, level 10 (Neighborhood).
 *
 * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_neighborhood.feature
 * @no_mobile @no_safari — webkit skipped. @eyes steps annotated as visual checkpoints.
 */
test.describe('Python Lab — level 10 — Neighborhood', () => {
  let lab: PythonLab;

  test.beforeEach(async ({page, browserName}) => {
    skipSafari({browserName});
    await page.goto('/reset_session');
    lab = await openReadyPythonLab(page, 10);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_neighborhood.feature
   * Scenario: Can run and see output of Python program
   */
  test(
    'running Neighborhood program outputs 10 to the console',
    {tag: '@visual'},
    async ({eyes}) => {
      await eyes.open('run and see output of Neighborhood');
      await eyes.check('initial load');
      await lab.run();
      await expect(lab.console).toContainText('10');
      await eyes.check('completed run');
    },
  );
});

/**
 * Python Lab — lesson 50, level 1 (file management).
 *
 * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_files.feature
 * Tagged @no_mobile @no_safari — webkit skipped throughout.
 */
test.describe('Python Lab — level 1 — file management', () => {
  let lab: PythonLab;

  test.beforeEach(async ({page, browserName}) => {
    skipSafari({browserName});
    lab = new PythonLab(page);
    await lab.gotoLevel(1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_files.feature
   * Scenario: Can add a new, unlocked file
   */
  test('can add a new unlocked file', async () => {
    await lab.filesPlus.click();
    await expect(lab.page.locator('#uitest-new-file')).toBeVisible();
    await lab.page.locator('#uitest-new-file').click();

    await expect(lab.page.locator('#uitest-prompt-field')).toBeVisible();
    await lab.page.locator('#uitest-prompt-field').fill('new_file.py');
    await lab.page.locator('#uitest-generic-dialog-ok').click();

    await expect(lab.editorContent).toContainText(
      'Add your changes to new_file.py',
    );
    await expect(lab.filesList).toContainText('new_file.py');

    await lab.openFileDropdown(3);
    await expect(lab.filePopup(3)).toContainText('Download');
    await expect(lab.filePopup(3)).toContainText('Delete');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_files.feature
   * Scenario: main.py is locked
   */
  test('main.py is locked — no rename option', async () => {
    await lab.openFileDropdown(0);
    await expect(lab.filePopup(0)).toContainText('Download');
    await expect(lab.filePopup(0)).not.toContainText('Rename');
  });
});

/**
 * Python Lab — lesson 50, levels 1–2 (run as student).
 *
 * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run.feature
 * @no_mobile @no_safari — webkit skipped. Requires student auth.
 */
test.describe('Python Lab — run as student', () => {
  let lab: PythonLab;

  test.beforeEach(async ({studentPage, browserName}) => {
    skipSafari({browserName});
    lab = await openReadyPythonLab(studentPage, 1);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run.feature
   * Scenario: Can run and see output of Python program
   */
  test('running prints Hello from the start! to the console', async () => {
    await lab.run();
    await expect(lab.console).toContainText('Hello from the start!');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run.feature
   * Scenario: Continue button and progress status shows up correctly
   */
  test('continue button and progress status update correctly', async () => {
    await expect(lab.editorContent).toBeVisible();
    await lab.expectProgressIs(1, 'not_tried');

    await lab.typeInEditor("print('more code')");
    await lab.page.keyboard.press('Enter');
    await expect(lab.editorContent).toContainText("print('more code')");
    await lab.runAndWaitForProgressSave();
    await expect(lab.console).toContainText('more code');
    await lab.expectProgressIs(1, 'attempted');

    await expect(lab.continueButton).toBeVisible();
    await expect(lab.continueButton).toContainText('Continue');
    await lab.continueButton.click();

    // Wait for the real navigation before using the next level. The query
    // string already preserves hideProductTours, so avoid an extra reload while
    // the Pyodide worker is loading.
    await lab.page.waitForURL('**/lessons/50/levels/2**');
    await expect(lab.page).toHaveURL(/hideProductTours=true/);
    await lab.waitForRunReady();

    await lab.expectProgressIs(1, 'perfect');

    await expect(lab.validationTab).toBeVisible();
    await lab.validationTab.click();
    await expect(lab.validateButton).toBeVisible();
    await expect(lab.validateButton).toBeEnabled({timeout: 60_000});
    await lab.validateUntilProgressIsPerfect(2);
    await expect(lab.continueButton).toBeVisible();
    await expect(lab.continueButton).toContainText('Continue');
    await expect(lab.projectUpdatedAt).toContainText('Saved');
  });
});

/**
 * Python Lab — lesson 50, level 1 (start mode / levelbuilder).
 *
 * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_start_mode.feature
 * @no_mobile @no_safari — webkit skipped. Requires levelbuilder auth.
 */
test.describe('Python Lab — start mode (levelbuilder)', () => {
  let lab: PythonLab;

  test.beforeEach(async ({levelbuilderPage, browserName}) => {
    skipSafari({browserName});
    lab = new PythonLab(levelbuilderPage);
    await lab.reloadLevel(1);
    await lab.navigateToStartMode();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_start_mode.feature
   * Scenario: Correct file types are in the dropdown
   */
  test('file type dropdown shows correct options per file type', async () => {
    // File 0 is type LOCKED_STARTER — shows validation/starter/support options
    await lab.openFileDropdown(0);
    await expect(lab.filePopup(0)).toContainText('Make validation file');
    await expect(lab.filePopup(0)).toContainText('Make starter file');
    await expect(lab.filePopup(0)).toContainText('Make support file');
    await expect(lab.filePopup(0)).not.toContainText(
      'Make locked starter file',
    );

    // Close dropdown
    await lab.editorContent.click();

    // File 2 is type SUPPORT — shows validation/locked-starter/starter options
    await lab.openFileDropdown(2);
    await expect(lab.filePopup(2)).toContainText('Make validation file');
    await expect(lab.filePopup(2)).toContainText('Make locked starter file');
    await expect(lab.filePopup(2)).toContainText('Make starter file');
    await expect(lab.filePopup(2)).not.toContainText('Make support file');

    await lab.page.locator('#uitest-make-validation').click();

    // After designating a validation file, no other file offers the option
    await lab.openFileDropdown(0);
    await expect(lab.filePopup(0)).not.toContainText('Make validation file');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_start_mode_eyes.feature
   * Scenario: Basic Start mode
   */
  test('basic start mode page is ready', {tag: '@visual'}, async ({eyes}) => {
    await eyes.open('Python Lab start mode');
    await lab.waitForRunReady();
    await expect(lab.editorContent).toBeVisible();
    await expect(lab.filesList).toContainText('main.py');
    await eyes.check('basic start mode page');
  });
});
