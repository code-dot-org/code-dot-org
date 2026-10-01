import {expect, test} from 'playwright/test';

import {LabPage} from './poms/LabPage';

test.describe('Sprite Lab smoke', () => {
  test('lab loads its fixture into the Code tab', async ({page}) => {
    const lab = await LabPage.load(page);
    await expect(lab.codeTab).toBeVisible();
    await expect(lab.workspace).toBeVisible();
  });

  // Folded in from the former console-health spec: a load with no thrown errors.
  test('no unhandled JS errors on page load', async ({page}) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', err => pageErrors.push(err));
    await LabPage.load(page);
    expect(pageErrors).toHaveLength(0);
  });
});
