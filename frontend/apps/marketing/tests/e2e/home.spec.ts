import {expect} from '@playwright/test';

import {getCookieNameByStage} from '@/cookies/getCookie';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';
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

  test(
    'should have a button to go to code studio (dashboard)',
    {tag: '@corporate'},
    async ({page, context}) => {
      test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');

      const marketingPage = new MarketingPage(page);

      await context.addCookies([
        {
          name: getCookieNameByStage('_user_type', getAppStageFromTestStage()),
          path: '/',
          domain: `.${marketingPage.getCookieDomain()}`,
          value: 'student',
        },
      ]);

      await marketingPage.goto('/');

      const studioButton = page.getByText('Go to Dashboard');

      await expect(studioButton).toBeVisible();

      await studioButton.click();

      await expect(page).not.toHaveURL('/');
    },
  );
});
