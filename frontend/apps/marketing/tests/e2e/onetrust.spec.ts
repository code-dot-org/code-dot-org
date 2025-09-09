import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';

test.describe('OneTrust Tests', () => {
  test('does NOT shows onetrust cookie consent in US', async ({page}) => {
    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/en-US/engineering/all-the-things?otgeo=us');

    await expect(
      page.getByText(
        'Click the "Cookies Settings" button to review the default cookie settings for this site and/or set your own cookie preferences.',
      ),
    ).not.toBeVisible();
  });

  test('shows onetrust cookie consent in es', async ({page}) => {
    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/en-US/engineering/all-the-things?otgeo=es');

    await expect(
      page.getByText(
        'Click the "Cookies Settings" button to review the default cookie settings for this site and/or set your own cookie preferences.',
      ),
    ).toBeVisible();
  });
});
