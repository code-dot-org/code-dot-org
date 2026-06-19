import type {Page} from '@playwright/test';

import {expect, test} from '../fixtures';

const DCDO_PATH = '/api/test/get_dcdo';

/**
 * Assert the JSON body at DCDO_PATH contains `"key":value`. Firefox's JSON
 * viewer hides the raw <pre> behind a "Raw Data" tab — click it if present,
 * mirroring the Cucumber step's #rawdata-tab click.
 */
async function assertJsonKeyValue(
  page: Page,
  key: string,
  value: string,
): Promise<void> {
  const rawDataTab = page.locator('#rawdata-tab');
  if (await rawDataTab.isVisible()) {
    await rawDataTab.click();
  }
  await expect(page.locator('pre')).toContainText(`"${key}":${value}`);
}

test.describe('DCDO mocking', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/dcdo_mocking.feature
   */
  test('Using a cookie to mock DCDO', async ({page, dcdo}) => {
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', 'null');

    await dcdo.mock('dcdo_mocking_test', 'mocked');
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', '"mocked"');

    await dcdo.mock('dcdo_mocking_test', {dcdo: 're-mocked'});
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', '{"dcdo":"re-mocked"}');

    await dcdo.clear();
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', 'null');
  });
});
