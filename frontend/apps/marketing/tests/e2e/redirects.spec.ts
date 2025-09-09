import {expect} from '@playwright/test';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {getStage} from '@/config/stage';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('Redirects', () => {
  test('should do a temporary redirect to an internal URL', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');
    let redirectStatus: number | undefined;
    let cacheControl: string | undefined;
    let etag: string | undefined;

    page.on('response', response => {
      if (
        response.url().includes('/engineering-redirect-internal-test-501a67e6')
      ) {
        redirectStatus = response.status();
        cacheControl = response.headers()['cache-control'];
        etag = response.headers()['etag'];
      }
    });

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/engineering-redirect-internal-test-501a67e6');

    expect(redirectStatus).toEqual(307);
    expect(cacheControl).toEqual(STALE_WHILE_REVALIDATE_ONE_HOUR);
    expect(etag).toBeDefined();
    await page.waitForURL('**/en-US/engineering/all-the-things');
  });

  test('should do a permanent redirect to an external URL', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');
    let redirectStatus: number | undefined;
    let cacheControl: string | undefined;
    let etag: string | undefined;

    page.on('response', response => {
      if (
        response.url().includes('/engineering-redirect-external-test-588aaf530')
      ) {
        redirectStatus = response.status();
        cacheControl = response.headers()['cache-control'];
        etag = response.headers()['etag'];
      }
    });

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/engineering-redirect-external-test-588aaf530');

    expect(redirectStatus).toEqual(308);
    expect(cacheControl).toEqual(STALE_WHILE_REVALIDATE_ONE_HOUR);
    expect(etag).toBeDefined();
    await page.waitForURL('**/api/health_check');
  });
});
