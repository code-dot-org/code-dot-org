import {expect} from '@playwright/test';

import {getStage} from '@/config/stage';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('404 Not Found Page', () => {
  test('should return a custom 404 page', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');

    const marketingPage = new MarketingPage(page);
    const response = await marketingPage.goto(
      '/en-US/test-invalid-page-not-found-d4740fb9',
    );

    expect(response?.status()).toEqual(404);
    await page.waitForFunction(() => document.title === 'Page Not Found');

    await expect(
      page.getByRole('heading', {name: "We couldn't find this page"}),
    ).toBeVisible();
    await expect(
      page.getByText(
        "We couldn't find the page you were looking for, let's get you back on track.",
      ),
    ).toBeVisible();
    await expect(page.getByText('Go to homepage')).toBeVisible();
  });

  test('should return a custom 404 page for unknown /api routes', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getStage() === 'production', 'Only runs in preprod');

    const marketingPage = new MarketingPage(page);
    const response = await marketingPage.goto(
      '/api/custom-api-route-not-found-d4740fb9',
    );

    expect(response?.status()).toEqual(404);
    await page.waitForFunction(() => document.title === 'Page Not Found');
    await expect(
      page.getByRole('heading', {name: "We couldn't find this page"}),
    ).toBeVisible();
    await expect(
      page.getByText(
        "We couldn't find the page you were looking for, let's get you back on track.",
      ),
    ).toBeVisible();
    await expect(page.getByText('Go to homepage')).toBeVisible();
  });
});
