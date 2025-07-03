import {expect} from '@playwright/test';

import {getCookieNameByStage} from '@/cookies/getCookie';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getAppStageFromTestStage} from './utils/stage';

test.describe('Home Page', () => {
  test('should redirect / to the localized path', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/');

    await page.waitForURL('**/en-US');
  });

  test('should redirect / to dashboard if the _user_type cookie is set', async ({
    page,
    browserName,
    context,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    const redirects: string[] = [];

    // Capture all requests to track redirects
    page.on('request', request => {
      redirects.push(request.url());
    });

    await page.route('**://**studio.code.org**/', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mocked Code Studio</body></html>',
      });
    });

    const marketingPage = new MarketingPage(page);

    await context.addCookies([
      {
        name: getCookieNameByStage('_user_type', getAppStageFromTestStage()),
        path: '/',
        domain: `.${marketingPage.getCookieDomain()}`,
        value: 'student',
      },
    ]);

    try {
      await marketingPage.goto('/');
    } catch {
      // It's ok if an error occurs as dashboard may not be running
    }

    await expect.poll(() => redirects[1]).toContain('studio.code.org');
  });

  test('should redirect / to dashboard if the user is signed in (no cookies set)', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');

    const marketingPage = new MarketingPage(page);

    await page.route('**/api/v1/users/signed_in', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({is_signed_in: true}),
      }),
    );

    await page.route('**://**studio.code.org**/', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mocked Code Studio</body></html>',
      });
    });

    await marketingPage.goto('/');

    await expect(page.getByText('Mocked Code Studio')).toBeVisible();
  });
});
