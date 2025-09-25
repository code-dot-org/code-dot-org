import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {isDeployedStage} from './utils/stage';

test.describe('Security Tests', () => {
  test('should have HSTS headers', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(!isDeployedStage(), 'Only runs in deployed mode');

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    const response = await allTheThingsPage.goto();

    expect(response?.headers()['strict-transport-security']).toBe(
      'max-age=31536000',
    );
  });

  test('should redirect http to https', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(!isDeployedStage(), 'Only runs in deployed mode');

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    const plainTextPath = allTheThingsPage
      .getBasePath()
      .replace('https', 'http');

    await page.goto(plainTextPath);
    expect(page.url()).toBe(allTheThingsPage.getBasePath());
  });
});
