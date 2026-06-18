import {expect, type Page, test} from '@playwright/test';

import {clearDcdoCookie, mockDcdo} from '../shared/dcdo';

const DCDO_PATH = '/api/test/get_dcdo';

/**
 * Assert that the JSON body of the current page contains `"key":value`.
 *
 * Firefox's JSON viewer requires clicking the "Raw Data" tab before the
 * <pre> element is visible — mirrors the Cucumber step's #rawdata-tab click.
 */
async function assertJsonKeyValue(
  page: Page,
  key: string,
  value: string,
): Promise<void> {
  // Firefox JSON viewer shows a "Raw Data" tab; click it if present so the
  // <pre> element with the raw JSON text is visible.
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
  test('Using a cookie to mock DCDO', async ({page}) => {
    // Initial state: no DCDO cookie — both values are null.
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', 'null');

    // Mock a string value.
    await mockDcdo(page, 'dcdo_mocking_test', 'mocked');
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', '"mocked"');

    // Re-mock with an object value.
    await mockDcdo(page, 'dcdo_mocking_test', {dcdo: 're-mocked'});
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', '{"dcdo":"re-mocked"}');

    // Delete the DCDO cookie — values return to null.
    await clearDcdoCookie(page);
    await page.goto(DCDO_PATH);
    await assertJsonKeyValue(page, 'stored', 'null');
    await assertJsonKeyValue(page, 'fetched', 'null');
  });
});
