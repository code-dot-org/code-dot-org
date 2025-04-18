import {expect} from '@playwright/test';

import {getStage} from '@/config/stage';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';

test.describe('Caching Tests', () => {
  test('should cache by default', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    const response = await allTheThingsPage.goto();

    const cacheControlHeader = response?.headers()['cache-control'];
    expect(cacheControlHeader).toEqual(
      's-maxage=600, stale-while-revalidate=31535400',
    );
  });

  test('should disable cache if draft mode is enabled', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    const response = await allTheThingsPage.enableDraftMode();

    const cacheControlHeader = response?.headers()['cache-control'];
    expect(cacheControlHeader).toEqual(
      'private, no-cache, no-store, max-age=0, must-revalidate',
    );
  });

  test('should 401 with an invalid token', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    const response = await allTheThingsPage.enableDraftMode('invalid-token');

    expect(response?.status()).toEqual(401);
  });
});
