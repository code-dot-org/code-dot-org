import {expect} from '@playwright/test';

import {getStage} from '@/config/stage';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('robots.txt', () => {
  test('should disallow everything in preprod', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/robots.txt');

    expect((await page.locator('body').textContent())?.trim()).toEqual(
      `User-Agent: *\nDisallow: /`,
    );
  });
});
