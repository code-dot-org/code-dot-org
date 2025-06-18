import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('Home Page', () => {
  test('should redirect / to the localized /home', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/');

    await page.waitForURL('**/en-US/home');
  });
});
