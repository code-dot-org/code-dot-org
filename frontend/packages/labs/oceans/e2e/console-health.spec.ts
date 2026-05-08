import {expect, test} from 'playwright/test';

import {FishVTrashPage, OceansPage} from './OceansPage';

test.describe('Console health', () => {
  test('no model-loading errors on startup', async ({page}) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('model.json')) {
        errors.push(msg.text());
      }
    });
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.eraseButton).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('no unhandled JS errors on page load', async ({page}) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', err => pageErrors.push(err));
    const oceans = new OceansPage(page);
    await oceans.goto();
    await oceans.waitForTrainingScene();
    expect(pageErrors).toHaveLength(0);
  });
});
