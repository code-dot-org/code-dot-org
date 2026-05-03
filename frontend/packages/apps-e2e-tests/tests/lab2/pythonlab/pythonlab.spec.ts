import {expect, test} from '@playwright/test';

import {PythonLab} from './PythonLab';

/**
 * Python Lab — lesson 50, level 1 (file management).
 *
 * Source: dashboard/test/ui/features/code_tools/pythonlab/pythonlab_files.feature
 * Tagged @no_mobile @no_safari — webkit skipped throughout.
 */
test.describe('Python Lab — level 1 — file management', () => {
  let lab: PythonLab;

  test.beforeEach(async ({page, browserName}) => {
    test.skip(browserName === 'webkit', '@no_safari');
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
