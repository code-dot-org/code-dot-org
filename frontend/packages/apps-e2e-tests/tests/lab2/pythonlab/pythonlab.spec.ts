import {expect, test} from '@playwright/test';

import {PythonLab} from './PythonLab';

/** Skip webkit for all Python Lab tests (@no_safari — web workers not supported). */
const skipSafari = ({browserName}: {browserName: string}) =>
  test.skip(browserName === 'webkit', '@no_safari');

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
    lab = new PythonLab(page);
    await lab.gotoLevel(1);
    await expect(lab.runButton).toBeEnabled();
  });

  test(
    'running prints Hello from the start! to the console',
    {tag: '@visual'},
    async () => {
      // visual checkpoint: "initial load"
      await lab.run();
      await expect(lab.console).toContainText('Hello from the start!');
      // visual checkpoint: "completed run"
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
    lab = new PythonLab(page);
    await lab.gotoLevel(10);
    await expect(lab.runButton).toBeEnabled();
  });

  test(
    'running Neighborhood program outputs 10 to the console',
    {tag: '@visual'},
    async () => {
      // visual checkpoint: "initial load"
      await lab.run();
      await expect(lab.console).toContainText('10');
      // visual checkpoint: "completed run"
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

  test('main.py is locked — no rename option', async () => {
    await lab.openFileDropdown(0);
    await expect(lab.filePopup(0)).toContainText('Download');
    await expect(lab.filePopup(0)).not.toContainText('Rename');
  });
});
