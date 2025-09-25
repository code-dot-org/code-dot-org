import {expect} from '@playwright/test';

import {STALE_WHILE_REVALIDATE_ONE_DAY} from '@/cache/constants';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('Sitemap Tests', () => {
  test('should return a sitemap and exclude noindex pages', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');

    const marketingPage = new MarketingPage(page);
    const response = await marketingPage.goto('/sitemap.xml');

    expect(response?.status()).toEqual(200);

    // Should cache the page
    expect(response?.headers()?.['cache-control']).toEqual(
      STALE_WHILE_REVALIDATE_ONE_DAY,
    );
    expect(response?.headers()?.['etag']).toBeDefined();

    const body = await response?.text();
    // Should have /en-US
    expect(body).toContain('/en-US');

    // Should not have all the things because it is noindex
    expect(body).not.toContain('all-the-things');
  });
});
